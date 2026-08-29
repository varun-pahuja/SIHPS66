#!/usr/bin/env python3
"""
OceanEmbed — Training + Evaluation Script
Trains the OceanEmbed model with 7-channel surface inputs (SST, SSH, SSS, currents, winds)
and GLORYS subsurface temperature profiles.

Usage:
  conda activate ocean
  python scripts/train.py 2023
"""
import sys
import os
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from pathlib import Path
import json
import time
import xarray as xr

# Memory safety: limit CPU threads
torch.set_num_threads(4)

# Import our model
sys.path.insert(0, str(Path(__file__).parent))
from model import OceanEmbed


# === CONFIGURATION ===
TARGET_DEPTHS = [2, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000]
N_DEPTHS = len(TARGET_DEPTHS)
IN_CHANNELS = 7  # SST, SSH, SSS, u_current, v_current, u_wind, v_wind
PATCH_SIZE = 4
EMBED_DIM = 128
N_HEADS = 4
N_LAYERS = 4
BATCH_SIZE = 16
EPOCHS = 30
LR = 1e-3
DEVICE = "cpu"
TRAIN_SPLIT = 0.8
LOG_DIR = Path("/home/varun/Downloads/Ps66/logs")
MODEL_DIR = Path("/home/varun/Downloads/Ps66/models")
DATA_DIR = Path("/home/varun/Downloads/Ps66/data/processed")
LOG_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)


class OceanTempDataset(Dataset):
    """
    Dataset that loads preprocessed GLORYS monthly files and 7-channel surface inputs.
    Pairs surface observations (input) with depth profiles (target).
    """

    def __init__(self, glorys_dir, surface_path, year, patch_size=64, mode="train", train_split=0.8):
        self.data_dir = Path(glorys_dir)
        self.surface_path = Path(surface_path)
        self.year = year
        self.patch_size = patch_size

        # List available monthly GLORYS files
        self.monthly_files = sorted(self.data_dir.glob(f"glorys_nio_{year}_*.nc"))
        if not self.monthly_files:
            raise FileNotFoundError(f"No monthly files found in {glorys_dir}")

        # Temporal split
        n_months = len(self.monthly_files)
        split_idx = max(1, int(n_months * train_split))
        if mode == "train":
            self.files = self.monthly_files[:split_idx]
        else:
            self.files = self.monthly_files[split_idx:]

        print(f"  {mode} set: {len(self.files)} months")

        # Load surface inputs (full year)
        print(f"  Loading surface inputs from {self.surface_path}")
        ds_surf = xr.open_dataset(self.surface_path)
        self.surface_data = ds_surf['surface'].values.astype(np.float32)  # (T, 7, H, W)
        self.surface_time = ds_surf['time'].values
        ds_surf.close()

        # Build time index mapping: GLORYS day -> surface day index
        # Load GLORYS months and build day mapping
        self.all_glorys = []
        self.time_offsets = []
        self.surface_day_indices = []  # maps each GLORYS day to surface day index
        total_days = 0

        for f in self.files:
            ds = xr.open_dataarray(f)
            glorys_time = ds.time.values
            data = ds.values.astype(np.float32)  # (T, D, H, W)
            ds.close()

            # Find corresponding surface day indices
            for gtime in glorys_time:
                # Find matching surface day
                diffs = np.abs(self.surface_time - gtime)
                surf_idx = np.argmin(diffs)
                self.surface_day_indices.append(surf_idx)

            self.all_glorys.append(data)
            self.time_offsets.append(total_days)
            total_days += data.shape[0]
            print(f"    Loaded {f.name}: {data.shape[0]} days")
            del data

        self.total_days = total_days
        self.n_depths = self.all_glorys[0].shape[1]
        self.H = self.all_glorys[0].shape[2]
        self.W = self.all_glorys[0].shape[3]

        # Precompute ocean mask
        sample = self.all_glorys[0][0]  # (D, H, W)
        self.ocean_mask = ~np.isnan(sample).all(axis=0)  # (H, W)

        # Also check surface ocean mask (SST channel 0)
        surf_sample = self.surface_data[0]  # (7, H, W)
        surf_ocean = ~np.isnan(surf_sample[0])  # (H, W) — True where SST is valid
        self.ocean_mask = self.ocean_mask & surf_ocean

        # Find valid patch positions
        self.valid_positions = []
        ps = self.patch_size
        valid_h, valid_w = np.where(self.ocean_mask)
        if len(valid_h) == 0:
            print("  [WARN] No ocean pixels found!")
        for h, w in zip(valid_h, valid_w):
            if h + ps > self.H or w + ps > self.W:
                continue
            patch_mask = self.ocean_mask[h:h + ps, w:w + ps]
            if patch_mask.mean() > 0.5:
                self.valid_positions.append((h, w))
        print(f"    Ocean: {self.ocean_mask.mean()*100:.1f}%, valid positions: {len(self.valid_positions)}")

        # Compute per-depth statistics (GLORYS)
        all_glorys_cat = np.concatenate(self.all_glorys, axis=0)
        ocean_expanded = self.ocean_mask[None, None, :, :]
        ocean_data = np.where(ocean_expanded, all_glorys_cat, np.nan)
        self.glorys_mean = np.nanmean(ocean_data, axis=(0, 2, 3), keepdims=True)
        self.glorys_std = np.nanstd(ocean_data, axis=(0, 2, 3), keepdims=True)
        self.glorys_std[self.glorys_std < 1e-6] = 1.0
        del all_glorys_cat, ocean_data

        # Compute surface statistics (ocean-only)
        surf_expanded = self.ocean_mask[None, :, :]  # (1, H, W)
        surf_ocean_data = np.where(surf_expanded, self.surface_data, np.nan)
        self.surf_mean = np.nanmean(surf_ocean_data, axis=(0, 2, 3), keepdims=True)  # (1, 7, 1, 1)
        self.surf_std = np.nanstd(surf_ocean_data, axis=(0, 2, 3), keepdims=True)    # (1, 7, 1, 1)
        self.surf_std[self.surf_std < 1e-6] = 1.0
        del surf_ocean_data

        print(f"    Total: {self.total_days} days, grid={self.H}x{self.W}")
        print(f"    Surface channels: {IN_CHANNELS}")

    def __len__(self):
        return self.total_days * 2  # 2 random crops per day

    def __getitem__(self, idx):
        day_in_set = idx // 2

        # Find which GLORYS month file this day belongs to
        month_idx = 0
        for i, offset in enumerate(self.time_offsets):
            if i + 1 < len(self.time_offsets):
                if day_in_set >= offset and day_in_set < self.time_offsets[i + 1]:
                    month_idx = i
                    break
            else:
                month_idx = i

        day_in_month = day_in_set - self.time_offsets[month_idx]
        glorys_day = self.all_glorys[month_idx][day_in_month]  # (D, H, W)

        # Get corresponding surface day
        global_day_idx = self.time_offsets[month_idx] + day_in_month
        surf_day_idx = self.surface_day_indices[global_day_idx]
        surf_day = self.surface_data[surf_day_idx]  # (7, H, W)

        # Pick random valid ocean position
        if len(self.valid_positions) > 0:
            pos_idx = np.random.randint(len(self.valid_positions))
            h, w = self.valid_positions[pos_idx]
        else:
            h = np.random.randint(0, self.H - self.patch_size)
            w = np.random.randint(0, self.W - self.patch_size)

        ps = self.patch_size

        # Surface patch (7 channels)
        surf_patch = surf_day[:, h:h + ps, w:w + ps]  # (7, ps, ps)
        surf_patch = np.nan_to_num(surf_patch, nan=0.0)

        # Normalize surface
        surf_patch = (surf_patch - self.surf_mean.squeeze()[:, None, None]) / self.surf_std.squeeze()[:, None, None]

        # GLORYS patch (depth profiles)
        glorys_patch = glorys_day[:, h:h + ps, w:w + ps]  # (D, ps, ps)
        glorys_patch = np.nan_to_num(glorys_patch, nan=0.0)

        # Normalize GLORYS
        g_mean = self.glorys_mean.squeeze()  # (D,)
        g_std = self.glorys_std.squeeze()
        glorys_patch = (glorys_patch - g_mean[:, None, None]) / g_std[:, None, None]

        # Input: 7-channel surface patch (7, ps, ps)
        x = surf_patch

        # Target: depth profiles at center pixel (D,)
        y = glorys_patch[:, ps // 2, ps // 2]

        return (
            torch.tensor(x, dtype=torch.float32),
            torch.tensor(y, dtype=torch.float32),
        )


def compute_metrics(pred, target, depths):
    """Compute RMSE, correlation, and bias at each depth level."""
    pred = pred.detach().cpu().numpy()
    target = target.detach().cpu().numpy()

    n_depths = pred.shape[1]
    metrics = {}

    for i in range(n_depths):
        p = pred[:, i]
        t = target[:, i]

        valid = (t != 0) & (~np.isnan(t))
        if valid.sum() < 2:
            continue

        p_valid = p[valid]
        t_valid = t[valid]

        rmse = np.sqrt(np.mean((p_valid - t_valid) ** 2))
        bias = np.mean(p_valid - t_valid)
        corr = np.corrcoef(p_valid, t_valid)[0, 1] if np.std(p_valid) > 0 else 0.0

        metrics[depths[i]] = {
            "rmse": float(rmse),
            "bias": float(bias),
            "corr": float(corr),
        }

    return metrics


def train_one_epoch(model, loader, optimizer, criterion):
    model.train()
    total_loss = 0
    n_batches = 0
    for x, y in loader:
        x, y = x.to(DEVICE), y.to(DEVICE)
        optimizer.zero_grad()
        pred = model(x)
        loss = criterion(pred, y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        n_batches += 1
    return total_loss / max(n_batches, 1)


def validate(model, loader, criterion):
    model.eval()
    total_loss = 0
    all_pred = []
    all_target = []
    n_batches = 0
    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(DEVICE), y.to(DEVICE)
            pred = model(x)
            loss = criterion(pred, y)
            total_loss += loss.item()
            all_pred.append(pred)
            all_target.append(y)
            n_batches += 1

    avg_loss = total_loss / max(n_batches, 1)
    all_pred = torch.cat(all_pred)
    all_target = torch.cat(all_target)
    return avg_loss, all_pred, all_target


def main():
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2023
    epochs = int(sys.argv[2]) if len(sys.argv) > 2 else 30

    surface_path = DATA_DIR / f"surface_inputs_{year}_NIO.nc"

    print(f"=== OceanEmbed Training ({year}) ===")
    print(f"  GLORYS data: {DATA_DIR}")
    print(f"  Surface data: {surface_path}")
    print(f"  Device: {DEVICE}")
    print(f"  Model: ViT-S ({EMBED_DIM}d, {N_HEADS} heads, {N_LAYERS} layers)")
    print(f"  Input: {IN_CHANNELS}-channel surface patches ({PATCH_SIZE}x{PATCH_SIZE})")

    # Create datasets
    print("\n--- Loading data ---")
    train_ds = OceanTempDataset(DATA_DIR, surface_path, year, patch_size=64, mode="train")
    val_ds = OceanTempDataset(DATA_DIR, surface_path, year, patch_size=64, mode="val")

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # Create model
    model = OceanEmbed(
        in_channels=IN_CHANNELS,
        embed_dim=EMBED_DIM,
        patch_size=PATCH_SIZE,
        nhead=N_HEADS,
        num_layers=N_LAYERS,
        n_depths=N_DEPTHS,
    ).to(DEVICE)

    n_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  Parameters: {n_params:,}")

    # Loss and optimizer
    criterion = nn.MSELoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    # Training loop
    print(f"\n--- Training ({epochs} epochs) ---")
    best_val_loss = float("inf")
    history = []

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        train_loss = train_one_epoch(model, train_loader, optimizer, criterion)
        val_loss, val_pred, val_target = validate(model, val_loader, criterion)
        scheduler.step()
        dt = time.time() - t0

        metrics = compute_metrics(val_pred, val_target, TARGET_DEPTHS)
        avg_rmse = np.mean([m["rmse"] for m in metrics.values()])
        avg_corr = np.mean([m["corr"] for m in metrics.values()])

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "val_loss": val_loss,
                "metrics": metrics,
                "glorys_mean": train_ds.glorys_mean,
                "glorys_std": train_ds.glorys_std,
                "surf_mean": train_ds.surf_mean,
                "surf_std": train_ds.surf_std,
            }, MODEL_DIR / "best_model.pt")

        history.append({
            "epoch": epoch,
            "train_loss": train_loss,
            "val_loss": val_loss,
            "avg_rmse": avg_rmse,
            "avg_corr": avg_corr,
        })

        print(
            f"  Epoch {epoch:3d}/{EPOCHS} | "
            f"train_loss={train_loss:.6f} | val_loss={val_loss:.6f} | "
            f"avg_RMSE={avg_rmse:.4f}C | avg_corr={avg_corr:.4f} | "
            f"{dt:.1f}s"
        )

    # Final evaluation
    print("\n--- Final Evaluation (best model) ---")
    checkpoint = torch.load(MODEL_DIR / "best_model.pt", weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    _, final_pred, final_target = validate(model, val_loader, criterion)
    final_metrics = compute_metrics(final_pred, final_target, TARGET_DEPTHS)

    print("\n  Depth-level metrics:")
    print(f"  {'Depth (m)':>10} {'RMSE (C)':>10} {'Bias (C)':>10} {'Corr':>8}")
    print(f"  {'-'*42}")
    for depth in TARGET_DEPTHS:
        if depth in final_metrics:
            m = final_metrics[depth]
            print(f"  {depth:>10} {m['rmse']:>10.4f} {m['bias']:>10.4f} {m['corr']:>8.4f}")

    # Save metrics
    metrics_path = LOG_DIR / f"metrics_{year}.json"
    with open(metrics_path, "w") as f:
        json.dump(final_metrics, f, indent=2)
    print(f"\n  Metrics saved to {metrics_path}")

    # Save training history
    history_path = LOG_DIR / f"history_{year}.json"
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)

    print(f"\n=== DONE ===")
    print(f"  Best model: {MODEL_DIR / 'best_model.pt'}")
    print(f"  Best val loss: {best_val_loss:.6f}")


if __name__ == "__main__":
    main()
