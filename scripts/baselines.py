#!/usr/bin/env python3
"""
OceanEmbed — Baseline Models for Comparison
Provides CNN, Linear, and Autoencoder baselines to compare against the ViT model.

All models share the same interface:
  Input:  (batch, 7, H, W)  — 7 surface channels
  Output: (batch, 15)        — temperature at 15 standard depths
"""
import torch
import torch.nn as nn
import torch.nn.functional as F


class LinearBaseline(nn.Module):
    """Simple linear model: flatten input → linear → output."""

    def __init__(self, in_channels=7, patch_size=64, n_depths=15):
        super().__init__()
        flat_dim = in_channels * patch_size * patch_size
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(flat_dim, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, n_depths),
        )

    def forward(self, x):
        return self.net(x)


class CNNBaseline(nn.Module):
    """CNN encoder + MLP decoder."""

    def __init__(self, in_channels=7, n_depths=15):
        super().__init__()
        # Encoder: 3 conv blocks
        self.enc = nn.Sequential(
            # Block 1: 7 -> 32
            nn.Conv2d(in_channels, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),  # 64 -> 32
            # Block 2: 32 -> 64
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),  # 32 -> 16
            # Block 3: 64 -> 128
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(4),  # -> 128 x 4 x 4
        )
        # Decoder
        self.dec = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 4 * 4, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, n_depths),
        )

    def forward(self, x):
        x = self.enc(x)
        return self.dec(x)


class AutoencoderBaseline(nn.Module):
    """
    Autoencoder-style: encode surface to bottleneck, decode to profile.
    The bottleneck forces the model to learn a compressed representation.
    """

    def __init__(self, in_channels=7, n_depths=15, bottleneck_dim=64):
        super().__init__()
        # Encoder
        self.enc = nn.Sequential(
            nn.Conv2d(in_channels, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(2),
        )
        # Bottleneck
        self.bottleneck = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 2 * 2, bottleneck_dim),
            nn.ReLU(),
        )
        # Decoder
        self.dec = nn.Sequential(
            nn.Linear(bottleneck_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, n_depths),
        )

    def forward(self, x):
        h = self.enc(x)
        z = self.bottleneck(h)
        return self.dec(z)


class ShallowBaseline(nn.Module):
    """
    2-layer CNN — deliberately shallow to show what a minimal model achieves.
    """

    def __init__(self, in_channels=7, n_depths=15):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_channels, 16, 5, padding=2),
            nn.ReLU(),
            nn.MaxPool2d(4),
            nn.Conv2d(16, 32, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(32, n_depths),
        )

    def forward(self, x):
        return self.net(x)


def count_parameters(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


if __name__ == "__main__":
    # Test all baselines
    x = torch.randn(4, 7, 64, 64)

    for name, Model in [
        ("Linear", LinearBaseline),
        ("CNN", CNNBaseline),
        ("Autoencoder", AutoencoderBaseline),
        ("Shallow", ShallowBaseline),
    ]:
        model = Model(in_channels=7, n_depths=15)
        out = model(x)
        n = count_parameters(model)
        print(f"{name:15s} | params={n:>10,} | output={out.shape}")
