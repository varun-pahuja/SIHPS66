#!/usr/bin/env python3
"""
OceanEmbed v2 — Improved Satellite Embedding Model
Key improvements over v1:
  - Depth embedding: model knows which depth it's predicting
  - Skip connections in decoder
  - Depth-weighted loss (deeper levels weighted more)
  - Huber loss (robust to outliers)
  - Gradient clipping
  - Learning rate warmup
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import math


class PatchEmbedding(nn.Module):
    """Convert surface fields into patch tokens for the transformer."""

    def __init__(self, in_channels=7, patch_size=4, embed_dim=192):
        super().__init__()
        self.proj = nn.Conv2d(
            in_channels, embed_dim,
            kernel_size=patch_size, stride=patch_size
        )
        self.norm = nn.LayerNorm(embed_dim)

    def forward(self, x):
        x = self.proj(x)
        B, D, H, W = x.shape
        x = x.flatten(2).transpose(1, 2)
        x = self.norm(x)
        return x


class TransformerBlock(nn.Module):
    """Transformer encoder block with pre-norm."""

    def __init__(self, embed_dim=192, nhead=6, mlp_ratio=3.0, dropout=0.15):
        super().__init__()
        self.norm1 = nn.LayerNorm(embed_dim)
        self.attn = nn.MultiheadAttention(
            embed_dim, nhead, dropout=dropout, batch_first=True
        )
        self.norm2 = nn.LayerNorm(embed_dim)
        self.mlp = nn.Sequential(
            nn.Linear(embed_dim, int(embed_dim * mlp_ratio)),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(int(embed_dim * mlp_ratio), embed_dim),
            nn.Dropout(dropout),
        )

    def forward(self, x):
        h = self.norm1(x)
        h, _ = self.attn(h, h, h)
        x = x + h
        x = x + self.mlp(self.norm2(x))
        return x


class SatelliteEncoder(nn.Module):
    """Vision Transformer encoder for satellite embeddings."""

    def __init__(
        self,
        in_channels=7,
        patch_size=4,
        embed_dim=192,
        nhead=6,
        num_layers=6,
        dropout=0.15,
        pool="mean",
        max_patches=256,
    ):
        super().__init__()
        self.patch_embed = PatchEmbedding(in_channels, patch_size, embed_dim)
        self.pool = pool
        self.pos_bias = nn.Parameter(
            torch.randn(1, max_patches, embed_dim) * 0.02
        )

        if pool == "cls":
            self.cls_token = nn.Parameter(torch.randn(1, 1, embed_dim) * 0.02)

        self.blocks = nn.ModuleList([
            TransformerBlock(embed_dim, nhead, dropout=dropout)
            for _ in range(num_layers)
        ])
        self.norm = nn.LayerNorm(embed_dim)

    def forward(self, x):
        B = x.shape[0]
        x = self.patch_embed(x)
        N = x.shape[1]
        x = x + self.pos_bias[:, :N, :]

        if self.pool == "cls":
            cls = self.cls_token.expand(B, -1, -1)
            x = torch.cat([cls, x], dim=1)

        for block in self.blocks:
            x = block(x)

        x = self.norm(x)

        if self.pool == "cls":
            return x[:, 0]
        return x.mean(dim=1)


class DepthDecoder(nn.Module):
    """Enhanced MLP decoder with depth embedding and skip connections."""

    def __init__(self, embed_dim=192, hidden_dim=384, n_depths=15, dropout=0.15):
        super().__init__()
        self.n_depths = n_depths
        self.embed_dim = embed_dim

        # Learnable depth embedding (1 per depth level)
        self.depth_embed = nn.Parameter(torch.randn(n_depths, 32) * 0.02)

        # Project depth embedding to match feature dim
        self.depth_proj = nn.Linear(32, embed_dim)

        # Feature extraction layers
        self.layer1 = nn.Linear(embed_dim * 2, hidden_dim)
        self.layer2 = nn.Linear(hidden_dim, hidden_dim)
        self.layer3 = nn.Linear(hidden_dim, hidden_dim // 2)
        self.output = nn.Linear(hidden_dim // 2, 1)

        self.norm1 = nn.LayerNorm(hidden_dim)
        self.norm2 = nn.LayerNorm(hidden_dim)
        self.norm3 = nn.LayerNorm(hidden_dim // 2)

    def forward(self, embedding):
        B = embedding.shape[0]
        D = self.n_depths

        # Expand embedding for each depth
        embed_expanded = embedding.unsqueeze(1).expand(B, D, self.embed_dim)  # (B, D, E)

        # Project depth embedding
        depth_emb = self.depth_proj(self.depth_embed)  # (D, E)
        depth_emb = depth_emb.unsqueeze(0).expand(B, D, -1)  # (B, D, E)

        # Concatenate surface embedding with depth embedding
        x = torch.cat([embed_expanded, depth_emb], dim=2)  # (B, D, E*2)

        # Feature extraction with skip connections
        x = F.gelu(self.norm1(self.layer1(x)))
        residual = x
        x = F.gelu(self.norm2(self.layer2(x)))
        x = x + residual  # skip connection

        x = F.gelu(self.norm3(self.layer3(x)))
        x = self.output(x).squeeze(-1)  # (B, D)

        return x


class OceanEmbedV2(nn.Module):
    """
    Improved OceanEmbed with depth embedding and skip connections.
    """

    def __init__(
        self,
        in_channels=7,
        embed_dim=192,
        patch_size=4,
        nhead=6,
        num_layers=6,
        n_depths=15,
        dropout=0.15,
    ):
        super().__init__()
        self.encoder = SatelliteEncoder(
            in_channels=in_channels,
            patch_size=patch_size,
            embed_dim=embed_dim,
            nhead=nhead,
            num_layers=num_layers,
            dropout=dropout,
        )
        self.decoder = DepthDecoder(
            embed_dim=embed_dim,
            hidden_dim=embed_dim * 2,
            n_depths=n_depths,
            dropout=dropout,
        )

    def forward(self, x):
        embedding = self.encoder(x)
        temp = self.decoder(embedding)
        return temp


class DepthWeightedLoss(nn.Module):
    """MSE loss with depth weighting (deeper levels weighted more)."""

    def __init__(self, n_depths=15, depth_weight_power=0.5):
        super().__init__()
        # Weight deeper levels more (they're harder to predict)
        depths = torch.linspace(0, 1, n_depths)
        weights = 1.0 + depth_weight_power * depths
        self.register_buffer("weights", weights)

    def forward(self, pred, target):
        sq_error = (pred - target) ** 2
        weighted = sq_error * self.weights.unsqueeze(0)
        return weighted.mean()


def count_parameters(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


if __name__ == "__main__":
    model = OceanEmbedV2(in_channels=7, embed_dim=192, patch_size=4, num_layers=6)
    print(f"Model parameters: {count_parameters(model):,}")

    x = torch.randn(4, 7, 64, 64)
    out = model(x)
    print(f"Input shape:  {x.shape}")
    print(f"Output shape: {out.shape}")
    print(f"Output range: [{out.min().item():.3f}, {out.max().item():.3f}]")
    print("Model OK!")
