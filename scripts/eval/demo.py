#!/usr/bin/env python3
"""
OceanEmbed — Demo: 7-Channel Surface Inputs → Subsurface Profiles
Generates demonstration plots using real satellite surface data.

Usage:
  conda activate ocean
  python scripts/demo.py 2023
"""
import sys
import numpy as np
import torch
import json
from pathlib import Path
import xarray as xr
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).parent.parent / "model"))
from model import OceanEmbed

# === CONFIGURATION ===
TARGET_DEPTHS = [2, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000]
N_DEPTHS = len(TARGET_DEPTHS)
EMBED_DIM = 128
PATCH_SIZE = 4
N_HEADS = 4
N_LAYERS = 4
DEVICE = "cpu"

MODEL_DIR = Path("/home/varun/Downloads/Ps66/models")
DATA_DIR = Path("/home/varun/Downloads/Ps66/data/processed")
OUT_DIR = Path("/home/varun/Downloads/Ps66/notebooks")
OUT_DIR.mkdir(parents=True, exist_ok=True)

CHANNEL_NAMES = ['SST', 'SSH', 'SSS', 'U_curr', 'V_curr', 'U_wind', 'V_wind']

REGIONS = {
    "Bay of Bengal": {"lat": [10, 20], "lon": [80, 95]},
    "Arabian Sea":   {"lat": [10, 20], "lon": [55, 75]},
}


def load_model():
    model = OceanEmbed(
        in_channels=7,
        embed_dim=EMBED_DIM,
        patch_size=PATCH_SIZE,
        nhead=N_HEADS,
        num_layers=N_LAYERS,
        n_depths=N_DEPTHS,
    )
    ckpt_path = MODEL_DIR / "best_model.pt"
    if ckpt_path.exists():
        ckpt = torch.load(ckpt_path, map_location=DEVICE, weights_only=False)
        model.load_state_dict(ckpt["model_state_dict"])
        glorys_mean = ckpt.get("glorys_mean", None)
        glorys_std = ckpt.get("glorys_std", None)
        surf_mean = ckpt.get("surf_mean", None)
        surf_std = ckpt.get("surf_std", None)
        print(f"  Loaded model from {ckpt_path} (epoch {ckpt['epoch']})")
    else:
        print(f"  WARNING: No trained model found. Using random weights.")
        glorys_mean = glorys_std = surf_mean = surf_std = None
    model.eval()
    return model, glorys_mean, glorys_std, surf_mean, surf_std


def run_demo(year=2023):
    print(f"=== OceanEmbed 7-Channel Demo ({year}) ===")

    model, glorys_mean, glorys_std, surf_mean, surf_std = load_model()

    # Load surface inputs
    surf_path = DATA_DIR / f"surface_inputs_{year}_NIO.nc"
    ds_surf = xr.open_dataset(surf_path)
    surface = ds_surf['surface'].values  # (T, 7, H, W)
    surf_time = ds_surf['time'].values
    surf_lat = ds_surf['lat'].values
    surf_lon = ds_surf['lon'].values
    ds_surf.close()
    print(f"  Surface: {surface.shape}, time: {surf_time[0]} to {surf_time[-1]}")

    # Load GLORYS for ground truth
    glorys_path = DATA_DIR / f"glorys_nio_{year}_01.nc"
    ds_glorys = xr.open_dataarray(glorys_path)
    glorys = ds_glorys.values  # (T, D, H, W)
    glorys_lat = ds_glorys.latitude.values
    glorys_lon = ds_glorys.longitude.values
    ds_glorys.close()
    print(f"  GLORYS: {glorys.shape}")

    # Pick a day (Jan 15)
    day_idx = 14
    surf_day = surface[day_idx]  # (7, H, W)

    # --- Plot 1: Profile comparison ---
    fig, axes = plt.subplots(2, 3, figsize=(18, 10))
    fig.suptitle(f"OceanEmbed: 7-Channel Satellite → Subsurface Temperature — {year}", fontsize=16, fontweight='bold')

    for col, (region_name, region) in enumerate(REGIONS.items()):
        print(f"\n  --- {region_name} ---")

        lat_mask = (surf_lat >= region["lat"][0]) & (surf_lat <= region["lat"][1])
        lon_mask = (surf_lon >= region["lon"][0]) & (surf_lon <= region["lon"][1])
        lat_idx = np.where(lat_mask)[0]
        lon_idx = np.where(lon_mask)[0]

        if len(lat_idx) == 0 or len(lon_idx) == 0:
            print(f"    Region not found, skipping.")
            continue

        ci, cj = lat_idx[len(lat_idx) // 2], lon_idx[len(lon_idx) // 2]

        # Ground truth profile (center pixel, all depths)
        profile_true = glorys[day_idx, :, ci, cj]
        valid_true = ~np.isnan(profile_true)

        if valid_true.sum() < 3:
            print(f"    Not enough valid data.")
            continue

        # Extract 64x64 surface patch centered on this point
        ps = 64
        h_start = max(0, min(ci - ps // 2, len(surf_lat) - ps))
        w_start = max(0, min(cj - ps // 2, len(surf_lon) - ps))
        h_end = min(h_start + ps, len(surf_lat))
        w_end = min(w_start + ps, len(surf_lon))
        h_start = max(0, h_end - ps)
        w_start = max(0, w_end - ps)

        surf_patch = surf_day[:, h_start:h_start+ps, w_start:w_start+ps]  # (7, ps, ps)
        surf_patch = np.nan_to_num(surf_patch, nan=0.0)

        # Normalize surface
        if surf_mean is not None and surf_std is not None:
            surf_patch = (surf_patch - surf_mean.squeeze()[:, None, None]) / surf_std.squeeze()[:, None, None]

        # Model prediction
        x = torch.tensor(surf_patch, dtype=torch.float32).unsqueeze(0)  # (1, 7, ps, ps)
        with torch.no_grad():
            pred_norm = model(x).numpy()[0]  # (15,)

        # Denormalize prediction
        if glorys_mean is not None and glorys_std is not None:
            pred = pred_norm * glorys_std.squeeze() + glorys_mean.squeeze()
        else:
            pred = pred_norm

        # Compute metrics
        both_valid = valid_true & ~np.isnan(pred)
        if both_valid.sum() > 2:
            rmse = np.sqrt(np.mean((pred[both_valid] - profile_true[both_valid]) ** 2))
            corr = np.corrcoef(pred[both_valid], profile_true[both_valid])[0, 1]
            print(f"    RMSE: {rmse:.4f}°C, Corr: {corr:.4f}")
        else:
            rmse = float('nan')
            corr = float('nan')

        # Plot true profile
        ax_true = axes[0, col]
        depths_arr = np.array(TARGET_DEPTHS)
        ax_true.plot(profile_true[valid_true], depths_arr[valid_true], "b-o", label="GLORYS (true)", markersize=4)
        ax_true.set_ylabel("Depth (m)")
        ax_true.set_title(f"{region_name}\nTrue Profile (day {day_idx})")
        ax_true.invert_yaxis()
        ax_true.grid(True, alpha=0.3)
        ax_true.legend()

        # Plot predicted profile
        ax_pred = axes[1, col]
        valid_pred = ~np.isnan(pred)
        ax_pred.plot(pred[valid_pred], depths_arr[valid_pred], "r-o", label="OceanEmbed (pred)", markersize=4)
        ax_pred.set_xlabel("Temperature (°C)")
        ax_pred.set_ylabel("Depth (m)")
        ax_pred.set_title(f"{region_name}\nPredicted Profile\nRMSE={rmse:.3f}°C Corr={corr:.3f}")
        ax_pred.invert_yaxis()
        ax_pred.grid(True, alpha=0.3)
        ax_pred.legend()

    # Third column: model info
    axes[0, 2].set_visible(False)
    axes[1, 2].set_visible(False)

    fig.text(
        0.72, 0.5,
        "Model: ViT-S Encoder + MLP Decoder\n"
        f"Parameters: 943K\n"
        f"Input: 7 channels (SST, SSH, SSS,\n"
        f"  U_curr, V_curr, U_wind, V_wind)\n"
        f"Depths: {N_DEPTHS} levels (2–1000 m)\n"
        f"Domain: North Indian Ocean\n"
        f"Resolution: 0.25° daily",
        ha="center", va="center", fontsize=11,
        bbox=dict(boxstyle="round", facecolor="lightyellow", alpha=0.8),
    )

    plt.tight_layout()
    out_path = OUT_DIR / f"demo_7ch_{year}.png"
    plt.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\n  Saved: {out_path}")

    # --- Plot 2: Surface inputs overview ---
    print(f"\n  Generating surface inputs overview...")
    fig2, axes2 = plt.subplots(2, 4, figsize=(20, 8))
    fig2.suptitle(f"Surface Inputs — Day {day_idx} of {year}", fontsize=14, fontweight='bold')

    for i in range(7):
        ax = axes2[i // 4, i % 4]
        data = surf_day[i]
        data_plot = np.nan_to_num(data, nan=0)
        im = ax.pcolormesh(surf_lon, surf_lat, data_plot, cmap='RdYlBu_r', shading='auto')
        ax.set_title(CHANNEL_NAMES[i], fontsize=12)
        ax.set_xlabel('Lon (°E)')
        ax.set_ylabel('Lat (°N)')
        plt.colorbar(im, ax=ax, shrink=0.8)

    # Last subplot: model prediction map
    ax_last = axes2[1, 3]
    # Show SST as background
    sst_plot = np.nan_to_num(surf_day[0], nan=0)
    ax_last.pcolormesh(surf_lon, surf_lat, sst_plot, cmap='RdYlBu_r', shading='auto')
    ax_last.set_title('SST + Regions', fontsize=12)
    ax_last.set_xlabel('Lon (°E)')
    ax_last.set_ylabel('Lat (°N)')
    for region_name, region in REGIONS.items():
        ax_last.plot(region['lon'], region['lat'], 'w--', linewidth=2)
        ax_last.text(np.mean(region['lon']), np.mean(region['lat']), region_name,
                    color='white', fontsize=8, ha='center', fontweight='bold')

    plt.tight_layout()
    out_path2 = OUT_DIR / f"surface_inputs_{year}.png"
    plt.savefig(out_path2, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {out_path2}")

    # --- Plot 3: Vertical section along 15°N ---
    print(f"\n  Generating vertical section plot...")
    fig3, axes3 = plt.subplots(1, 2, figsize=(16, 6))
    fig3.suptitle(f"GLORYS Temperature Section Along 15°N — {year}", fontsize=14, fontweight='bold')

    for col, (region_name, region) in enumerate(REGIONS.items()):
        lat_mask = (glorys_lat >= region["lat"][0]) & (glorys_lat <= region["lat"][1])
        lon_mask = (glorys_lon >= region["lon"][0]) & (glorys_lon <= region["lon"][1])
        lat_idx = np.where(lat_mask)[0]
        lon_idx = np.where(lon_mask)[0]

        if len(lat_idx) == 0 or len(lon_idx) == 0:
            continue

        mid_lat = lat_idx[len(lat_idx) // 2]
        section = glorys[day_idx, :, mid_lat, lon_idx]
        section = np.where(np.isnan(section), 0, section)

        ax = axes3[col]
        im = ax.pcolormesh(glorys_lon[lon_idx], TARGET_DEPTHS, section.T, cmap="RdYlBu_r", shading="auto")
        ax.set_ylabel("Depth (m)")
        ax.set_xlabel("Longitude (°E)")
        ax.set_title(region_name)
        ax.invert_yaxis()
        plt.colorbar(im, ax=ax, label="Temperature (°C)")

    plt.tight_layout()
    out_path3 = OUT_DIR / f"section_{year}.png"
    plt.savefig(out_path3, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {out_path3}")

    # Print training metrics
    metrics_path = LOG_DIR = Path("/home/varun/Downloads/Ps66/logs") / f"metrics_{year}.json"
    if metrics_path.exists():
        with open(metrics_path) as f:
            metrics = json.load(f)
        print(f"\n  --- Trained Model Metrics (Validation) ---")
        print(f"  {'Depth':>8} {'RMSE':>8} {'Bias':>8} {'Corr':>8}")
        for d in TARGET_DEPTHS:
            d_str = str(d)
            if d_str in metrics:
                m = metrics[d_str]
                print(f"  {d:>8} {m['rmse']:>8.4f} {m['bias']:>8.4f} {m['corr']:>8.4f}")

    print(f"\n=== DEMO COMPLETE ===")


if __name__ == "__main__":
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2023
    run_demo(year)
