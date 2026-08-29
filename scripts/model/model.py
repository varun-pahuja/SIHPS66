#!/usr/bin/env python3
"""
OceanEmbed — Satellite Embedding-Based Deep Learning Model
Reconstructs subsurface temperature profiles from surface satellite observations.

Architecture:
  1. PatchEmbed: surface fields (7 channels) → spatial patches → transformer
  2. SatelliteEncoder: ViT-style encoder → compact latent embedding
  3. DepthDecoder: MLP that maps embedding → 15-depth temperature profile

Input:  (batch, 7, H, W)  — 7 surface channels (SST, SSS, SSH, Uc, Vc, Uw, Vw)
Output: (batch, 15)        — temperature at 15 standard depths
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import numpy as np


class PatchEmbedding(nn.Module):
    """Convert surface fields into patch tokens for the transformer."""

    def __init__(self, in_channels=7, patch_size=4, embed_dim=128):
        super().__init__()
        self.patch_size = patch_size
        self.proj = nn.Conv2d(
            in_channels, embed_dim,
            kernel_size=patch_size, stride=patch_size
        )
        self.norm = nn.LayerNorm(embed_dim)

    def forward(self, x):
        # x: (B, C, H, W) → (B, embed_dim, H/p, W/p) → (B, N, embed_dim)
        x = self.proj(x)              # (B, D, H', W')
        B, D, H, W = x.shape
        x = x.flatten(2).transpose(1, 2)  # (B, H'*W', D)
        x = self.norm(x)
        return x


class TransformerBlock(nn.Module):
    """Standard transformer encoder block."""

    def __init__(self, embed_dim=128, nhead=4, mlp_ratio=4.0, dropout=0.1):
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
        # Self-attention with residual
        h = self.norm1(x)
        h, _ = self.attn(h, h, h)
        x = x + h
        # MLP with residual
        x = x + self.mlp(self.norm2(x))
        return x


class SatelliteEncoder(nn.Module):
    """
    Vision Transformer encoder that learns compact satellite embeddings
    from surface ocean fields.
    """

    def __init__(
        self,
        in_channels=7,
        patch_size=4,
        embed_dim=128,
        nhead=4,
        num_layers=4,
        dropout=0.1,
        pool="mean",
        max_patches=256,  # max spatial patches (16x16)
    ):
        super().__init__()
        self.patch_embed = PatchEmbedding(in_channels, patch_size, embed_dim)
        self.pool = pool
        self.max_patches = max_patches

        # Pre-allocate positional embedding for max grid size
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
        """
        Args:
            x: (B, C, H, W) surface fields
        Returns:
            embedding: (B, embed_dim) compact latent representation
        """
        B = x.shape[0]
        x = self.patch_embed(x)  # (B, N, D)
        N = x.shape[1]

        # Use positional embedding (truncate if needed)
        x = x + self.pos_bias[:, :N, :]

        if self.pool == "cls":
            cls = self.cls_token.expand(B, -1, -1)
            x = torch.cat([cls, x], dim=1)

        for block in self.blocks:
            x = block(x)

        x = self.norm(x)

        if self.pool == "cls":
            embedding = x[:, 0]
        else:
            embedding = x.mean(dim=1)

        return embedding


class DepthDecoder(nn.Module):
    """MLP that maps a compact embedding to a 15-depth temperature profile."""

    def __init__(self, embed_dim=128, hidden_dim=256, n_depths=15, dropout=0.1):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(embed_dim, hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, n_depths),
        )

    def forward(self, embedding):
        """embedding: (B, embed_dim) → (B, n_depths)"""
        return self.net(embedding)


class OceanEmbed(nn.Module):
    """
    Full OceanEmbed model: surface fields → satellite embedding → temperature profile.

    Input:  (B, 7, H, W)  — 7 surface channels
    Output: (B, 15)        — temperature at 15 standard depths
    """

    def __init__(
        self,
        in_channels=7,
        embed_dim=128,
        patch_size=4,
        nhead=4,
        num_layers=4,
        n_depths=15,
        dropout=0.1,
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
        """
        Args:
            x: (B, 7, H, W) — surface fields
        Returns:
            temp_profile: (B, 15) — temperature at 15 depths
        """
        embedding = self.encoder(x)   # (B, D)
        temp = self.decoder(embedding)  # (B, 15)
        return temp


def count_parameters(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


if __name__ == "__main__":
    # Quick test: create model and run dummy input
    model = OceanEmbed(in_channels=7, embed_dim=128, patch_size=4, num_layers=4)
    print(f"Model parameters: {count_parameters(model):,}")

    # Dummy input: batch=4, 7 channels, 64x64 spatial patch
    x = torch.randn(4, 7, 64, 64)
    out = model(x)
    print(f"Input shape:  {x.shape}")
    print(f"Output shape: {out.shape}")
    print(f"Output range: [{out.min().item():.3f}, {out.max().item():.3f}]")
    print("Model OK!")
