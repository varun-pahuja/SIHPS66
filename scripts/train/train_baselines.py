#!/usr/bin/env python3
"""
OceanEmbed — Baseline Comparison Training
Trains Linear, CNN, Autoencoder, and Shallow baselines on the same data
as the ViT model, then compares all results.

Usage:
  conda activate ocean
  python scripts/train_baselines.py 2023
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

torch.set_num_threads(4)

sys.path.insert(0, str(Path(__file__).parent.parent / "eval"))
from baselines import LinearBaseline, CNNBaseline, AutoencoderBaseline, ShallowBaseline

# === CONFIG ===
TARGET_DEPTHS = [2, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000]
N_DEPTHS = len(TARGET_DEPTHS)
IN_CHANNELS = 7
PATCH_SIZE = 64
BATCH_SIZE = 32
EPOCHS = 30
LR = 1e-3
DEVICE = "cpu"
TRAIN_SPLIT = 0.8
LOG_DIR = Path("/home/varun/Downloads/Ps66/logs")
MODEL_DIR = Path("/home/varun/Downloads/Ps66/models")
DATA_DIR = Path("/home/varun/Downloads/Ps66/data/processed")
LOG_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)


# Reuse dataset from train.py (copy for independence)
class OceanTempDataset(Dataset):
    def __init__(self, glorys_dir, surface_path, year, patch_size=64, mode="train", train_split=0.8):
        self.data_dir = Path(glorys_dir)
        self.surface_path = Path(surface_path)
        self.year = year
        self.patch_size = patch_size

        self.monthly_files = sorted(self.data_dir.glob(f"glorys_nio_{year}_*.nc"))
        n_months = len(self.monthly_files)
        split_idx = max(1, int(n_months * train_split))
        if mode == "train":
            self.files = self.monthly_files[:split_idx]
        else:
            self.files = self.monthly_files[split_idx:]

        ds_surf = xr.open_dataset(self.surface_path)
        self.surface_data = ds_surf['surface'].values.astype(np.float32)
        self.surface_time = ds_surf['time'].values
        ds_surf.close()

        self.all_glorys = []
        self.time_offsets = []
        self.surface_day_indices = []
        total_days = 0

        for f in self.files:
            ds = xr.open_dataarray(f)
            glorys_time = ds.time.values
            data = ds.values.astype(np.float32)
            ds.close()
            for gtime in glorys_time:
                diffs = np.abs(self.surface_time - gtime)
                surf_idx = np.argmin(diffs)
                self.surface_day_indices.append(surf_idx)
            self.all_glorys.append(data)
            self.time_offsets.append(total_days)
            total_days += data.shape[0]
            del data

        self.total_days = total_days
        self.n_depths = self.all_glorys[0].shape[1]
        self.H = self.all_glorys[0].shape[2]
        self.W = self.all_glorys[0].shape[3]

        sample = self.all_glorys[0][0]
        self.ocean_mask = ~np.isnan(sample).all(axis=0)
        surf_sample = self.surface_data[0]
        surf_ocean = ~np.isnan(surf_sample[0])
        self.ocean_mask = self.ocean_mask & surf_ocean

        self.valid_positions = []
        ps = self.patch_size
        valid_h, valid_w = np.where(self.ocean_mask)
        for h, w in zip(valid_h, valid_w):
            if h + ps > self.H or w + ps > self.W:
                continue
            patch_mask = self.ocean_mask[h:h + ps, w:w + ps]
            if patch_mask.mean() > 0.5:
                self.valid_positions.append((h, w))

        all_glorys_cat = np.concatenate(self.all_glorys, axis=0)
        ocean_expanded = self.ocean_mask[None, None, :, :]
        ocean_data = np.where(ocean_expanded, all_glorys_cat, np.nan)
        self.glorys_mean = np.nanmean(ocean_data, axis=(0, 2, 3), keepdims=True)
        self.glorys_std = np.nanstd(ocean_data, axis=(0, 2, 3), keepdims=True)
        self.glorys_std[self.glorys_std < 1e-6] = 1.0
        del all_glorys_cat, ocean_data

        surf_expanded = self.ocean_mask[None, :, :]
        surf_ocean_data = np.where(surf_expanded, self.surface_data, np.nan)
        self.surf_mean = np.nanmean(surf_ocean_data, axis=(0, 2, 3), keepdims=True)
        self.surf_std = np.nanstd(surf_ocean_data, axis=(0, 2, 3), keepdims=True)
        self.surf_std[self.surf_std < 1e-6] = 1.0
        del surf_ocean_data

    def __len__(self):
        return self.total_days * 2

    def __getitem__(self, idx):
        day_in_set = idx // 2
        month_idx = 0
        for i, offset in enumerate(self.time_offsets):
            if i + 1 < len(self.time_offsets):
                if day_in_set >= offset and day_in_set < self.time_offsets[i + 1]:
                    month_idx = i
                    break
            else:
                month_idx = i

        day_in_month = day_in_set - self.time_offsets[month_idx]
        glorys_day = self.all_glorys[month_idx][day_in_month]

        global_day_idx = self.time_offsets[month_idx] + day_in_month
        surf_day_idx = self.surface_day_indices[global_day_idx]
        surf_day = self.surface_data[surf_day_idx]

        if len(self.valid_positions) > 0:
            pos_idx = np.random.randint(len(self.valid_positions))
            h, w = self.valid_positions[pos_idx]
        else:
            h = np.random.randint(0, self.H - self.patch_size)
            w = np.random.randint(0, self.W - self.patch_size)

        ps = self.patch_size
        surf_patch = surf_day[:, h:h + ps, w:w + ps]
        surf_patch = np.nan_to_num(surf_patch, nan=0.0)
        surf_patch = (surf_patch - self.surf_mean.squeeze()[:, None, None]) / self.surf_std.squeeze()[:, None, None]

        glorys_patch = glorys_day[:, h:h + ps, w:w + ps]
        glorys_patch = np.nan_to_num(glorys_patch, nan=0.0)
        g_mean = self.glorys_mean.squeeze()
        g_std = self.glorys_std.squeeze()
        glorys_patch = (glorys_patch - g_mean[:, None, None]) / g_std[:, None, None]

        x = surf_patch
        y = glorys_patch[:, ps // 2, ps // 2]

        return (
            torch.tensor(x, dtype=torch.float32),
            torch.tensor(y, dtype=torch.float32),
        )


def compute_metrics(pred, target, depths):
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
        metrics[depths[i]] = {"rmse": float(rmse), "bias": float(bias), "corr": float(corr)}
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


def train_model(name, model, train_loader, val_loader, epochs=EPOCHS):
    print(f"\n{'='*60}")
    print(f"Training: {name}")
    n_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Parameters: {n_params:,}")

    criterion = nn.MSELoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

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
            }, MODEL_DIR / f"baseline_{name.lower()}.pt")

        history.append({
            "epoch": epoch,
            "train_loss": train_loss,
            "val_loss": val_loss,
            "avg_rmse": avg_rmse,
            "avg_corr": avg_corr,
        })

        if epoch % 5 == 0 or epoch == 1:
            print(
                f"  Epoch {epoch:3d}/{epochs} | "
                f"train={train_loss:.6f} val={val_loss:.6f} | "
                f"RMSE={avg_rmse:.4f} corr={avg_corr:.4f} | {dt:.1f}s"
            )

    # Load best and get final metrics
    ckpt = torch.load(MODEL_DIR / f"baseline_{name.lower()}.pt", weights_only=False)
    model.load_state_dict(ckpt["model_state_dict"])
    _, final_pred, final_target = validate(model, val_loader, criterion)
    final_metrics = compute_metrics(final_pred, final_target, TARGET_DEPTHS)

    return final_metrics, history


def main():
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2023
    surface_path = DATA_DIR / f"surface_inputs_{year}_NIO.nc"

    print(f"=== Baseline Comparison ({year}) ===")

    # Load data once
    print("\n--- Loading data ---")
    train_ds = OceanTempDataset(DATA_DIR, surface_path, year, patch_size=PATCH_SIZE, mode="train")
    val_ds = OceanTempDataset(DATA_DIR, surface_path, year, patch_size=PATCH_SIZE, mode="val")

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # Define baselines
    baselines = {
        "Linear": LinearBaseline(in_channels=IN_CHANNELS, patch_size=PATCH_SIZE, n_depths=N_DEPTHS),
        "Shallow": ShallowBaseline(in_channels=IN_CHANNELS, n_depths=N_DEPTHS),
        "CNN": CNNBaseline(in_channels=IN_CHANNELS, n_depths=N_DEPTHS),
        "Autoencoder": AutoencoderBaseline(in_channels=IN_CHANNELS, n_depths=N_DEPTHS),
    }

    all_results = {}
    all_histories = {}

    for name, model in baselines.items():
        model = model.to(DEVICE)
        metrics, history = train_model(name, model, train_loader, val_loader)
        all_results[name] = metrics
        all_histories[name] = history

    # Load ViT results from previous training
    vit_metrics_path = LOG_DIR / f"metrics_{year}.json"
    if vit_metrics_path.exists():
        with open(vit_metrics_path) as f:
            all_results["ViT"] = json.load(f)

    # Print comparison table
    print("\n" + "=" * 80)
    print("COMPARISON TABLE — Average RMSE (°C) and Correlation by Depth")
    print("=" * 80)

    depth_labels = [f"{d}m" for d in TARGET_DEPTHS]
    model_names = list(all_results.keys())

    # Header
    header = f"{'Depth':>8}"
    for name in model_names:
        header += f" | {name:>12}"
    print(header)
    print("-" * len(header))

    # RMSE rows
    for i, d in enumerate(TARGET_DEPTHS):
        row = f"{d:>6}m"
        for name in model_names:
            if d in all_results[name]:
                rmse = all_results[name][d]["rmse"]
                row += f" | {rmse:>12.4f}"
            else:
                row += f" | {'N/A':>12}"
        print(row)

    # Average row
    print("-" * len(header))
    avg_row = f"{'AVG':>6} "
    for name in model_names:
        if all_results[name]:
            avg_rmse = np.mean([m["rmse"] for m in all_results[name].values()])
            avg_row += f" | {avg_rmse:>12.4f}"
        else:
            avg_row += f" | {'N/A':>12}"
    print(avg_row)

    # Correlation table
    print("\nCorrelation:")
    header2 = f"{'Depth':>8}"
    for name in model_names:
        header2 += f" | {name:>12}"
    print(header2)
    print("-" * len(header2))

    for i, d in enumerate(TARGET_DEPTHS):
        row = f"{d:>6}m"
        for name in model_names:
            if d in all_results[name]:
                corr = all_results[name][d]["corr"]
                row += f" | {corr:>12.4f}"
            else:
                row += f" | {'N/A':>12}"
        print(row)

    print("-" * len(header2))
    avg_row2 = f"{'AVG':>6} "
    for name in model_names:
        if all_results[name]:
            avg_corr = np.mean([m["corr"] for m in all_results[name].values()])
            avg_row2 += f" | {avg_corr:>12.4f}"
        else:
            avg_row2 += f" | {'N/A':>12}"
    print(avg_row2)

    # Save all results
    output = {
        "year": year,
        "models": all_results,
        "depths": TARGET_DEPTHS,
    }
    with open(LOG_DIR / f"comparison_{year}.json", "w") as f:
        json.dump(output, f, indent=2)

    # Save histories
    with open(LOG_DIR / f"baseline_histories_{year}.json", "w") as f:
        json.dump(all_histories, f, indent=2)

    print(f"\nResults saved to {LOG_DIR / f'comparison_{year}.json'}")
    print("=== DONE ===")


if __name__ == "__main__":
    main()
