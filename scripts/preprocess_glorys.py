#!/usr/bin/env python3
"""
OceanEmbed — Step 1: Preprocess GLORYS12V1 subsurface temperature.
MEMORY-SAFE: processes one month at a time, saves each month separately.
No concatenation — training loads months lazily.

Usage:
  conda activate ocean
  python scripts/preprocess_glorys.py 2023
"""
import sys
import os
import gc
import numpy as np
import xarray as xr
from pathlib import Path

# === CONFIGURATION ===
DOMAIN = dict(lat_min=5.0, lat_max=30.0, lon_min=45.0, lon_max=105.0)
TARGET_RES = 0.25  # degrees
TARGET_DEPTHS = [2, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000]
RAW_DIR = Path("/home/varun/Downloads/Ps66/data/raw/glorys")
OUT_DIR = Path("/home/varun/Downloads/Ps66/data/processed")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def load_glorys_month(year: int, month: int) -> xr.Dataset:
    """Load a single month of raw GLORYS data."""
    month_str = f"{year}{month:02d}"
    month_dir = RAW_DIR / month_str
    nc_files = sorted(month_dir.glob("*.nc"))
    if not nc_files:
        print(f"  [WARN] No files found for {month_str}, skipping.")
        return None

    ds = xr.open_mfdataset(nc_files, combine="by_coords", parallel=True)
    print(f"  Loaded {month_str}: {len(ds.time)} days, shape={ds.thetao.shape}")
    return ds


def select_target_depths(ds: xr.Dataset) -> xr.DataArray:
    """Interpolate temperature to the 15 standard depths."""
    target_depths_m = np.array(TARGET_DEPTHS, dtype=float)
    ds_interp = ds.thetao.interp(depth=target_depths_m, method="linear")
    return ds_interp


def regrid_to_target(ds_interp: xr.DataArray) -> xr.Dataset:
    """Regrid from 0.083° to 0.25° over the NIO domain."""
    target_lat = np.arange(DOMAIN["lat_min"], DOMAIN["lat_max"] + TARGET_RES, TARGET_RES)
    target_lon = np.arange(DOMAIN["lon_min"], DOMAIN["lon_max"] + TARGET_RES, TARGET_RES)

    # Select NIO domain from raw
    ds_nio = ds_interp.sel(
        latitude=slice(DOMAIN["lat_min"], DOMAIN["lat_max"]),
        longitude=slice(DOMAIN["lon_min"], DOMAIN["lon_max"]),
    )

    # Regrid using xarray interpolation
    ds_regrid = ds_nio.interp(
        latitude=target_lat,
        longitude=target_lon,
        method="linear",
    )

    ds_regrid.name = "thetao"
    ds_regrid.attrs["units"] = "degC"
    ds_regrid.attrs["standard_name"] = "sea_water_potential_temperature"

    result = ds_regrid.to_dataset(name="thetao")
    result.attrs["regridded_from"] = "GLORYS12V1 (0.083 deg)"
    result.attrs["target_resolution"] = "0.25 deg"
    result.attrs["target_depths"] = str(TARGET_DEPTHS)

    return result


def process_month(year: int, month: int) -> bool:
    """Process one month: load → depth interp → regrid → save. Returns True if ok."""
    out_path = OUT_DIR / f"glorys_nio_{year}_{month:02d}.nc"

    # Skip if already processed
    if out_path.exists():
        print(f"  [SKIP] {out_path.name} already exists.")
        return True

    # Load raw month
    ds_raw = load_glorys_month(year, month)
    if ds_raw is None:
        return False

    # Step 1: interpolate to 15 target depths
    print(f"  Interpolating to {len(TARGET_DEPTHS)} target depths...")
    ds_depth = select_target_depths(ds_raw)
    ds_raw.close()  # free raw data immediately
    gc.collect()

    # Step 2: regrid to 0.25 deg
    print(f"  Regridding to 0.25 deg...")
    ds_regrid = regrid_to_target(ds_depth)
    ds_depth.close()
    gc.collect()

    # Step 3: save this month only
    print(f"  Saving to {out_path.name}...")
    ds_regrid.to_netcdf(out_path, engine="netcdf4")
    print(f"  -> Saved! shape={ds_regrid.thetao.shape}")

    ds_regrid.close()
    gc.collect()
    return True


def main():
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2023

    print(f"=== Preprocessing GLORYS {year} (MEMORY-SAFE) ===")
    print(f"  Domain: NIO ({DOMAIN})")
    print(f"  Target: 0.25 deg, 15 depths: {TARGET_DEPTHS}")
    print(f"  Method: process one month at a time, save individually")

    n_done = 0
    for month in range(1, 13):
        print(f"\n--- Month {month:02d} ---")
        ok = process_month(year, month)
        if ok:
            n_done += 1
        gc.collect()

    print(f"\n=== DONE: {n_done}/12 months processed ===")
    print(f"  Output: {OUT_DIR}/glorys_nio_{year}_MM.nc")


if __name__ == "__main__":
    main()
