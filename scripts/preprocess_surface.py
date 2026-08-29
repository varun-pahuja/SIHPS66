#!/usr/bin/env python3
"""
Preprocess all surface inputs to 0.25° daily NIO grid for OceanEmbed.
Handles: different lat/lon naming, 0-360 vs -180-180 lon, cftime calendars.
"""

import xarray as xr
import numpy as np
import os
import warnings
warnings.filterwarnings('ignore')

BASE      = "/home/varun/Downloads/Ps66"
RAW_DIR   = f"{BASE}/data/raw/surface"
PROC_DIR  = f"{BASE}/data/processed"
TARGET_RES = 0.25

os.makedirs(PROC_DIR, exist_ok=True)

# Target grid: lat 30→5 (N→S), lon 45→105
target_lat = np.arange(30, 5 - TARGET_RES/2, -TARGET_RES)
target_lon = np.arange(45, 105 + TARGET_RES/2, TARGET_RES)
print(f"Target grid: {len(target_lat)} lat x {len(target_lon)} lon")


def fix_lon_to_180(ds):
    """Convert 0-360 longitude to -180-180 if needed."""
    lon_name = 'longitude' if 'longitude' in ds.coords else 'lon'
    lon_vals = ds[lon_name].values
    if lon_vals.max() > 180:
        # Wrap to -180..180
        new_lon = ((lon_vals + 180) % 360) - 180
        ds = ds.assign_coords({lon_name: new_lon})
        ds = ds.sortby(lon_name)
    return ds


def regrid_var(ds, var_name, lat_name='latitude', lon_name='longitude'):
    """Regrid a single variable to target NIO grid."""
    # If lat/lon are just integer indices (dim without coords), swap_dims
    if lat_name in ds.dims and lat_name not in ds.indexes:
        lat_coord = 'lat' if 'lat' in ds.coords else lat_name
        lon_coord = 'lon' if 'lon' in ds.coords else lon_name
        ds = ds.swap_dims({lat_name: lat_coord, lon_name: lon_coord})
        lat_name = lat_coord
        lon_name = lon_coord
    elif lat_name in ds.dims and lat_name not in ds.coords:
        # Try any coord that maps to this dim
        for c in ds.coords:
            if ds[c].dims == (lat_name,):
                ds = ds.swap_dims({lat_name: c})
                lat_name = c
                break
        for c in ds.coords:
            if ds[c].dims == (lon_name,):
                ds = ds.swap_dims({lon_name: c})
                lon_name = c
                break

    # Fix lon if needed (0-360 → -180-180)
    lon_vals = ds[lon_name].values
    if lon_vals.max() > 180:
        new_lon = ((lon_vals + 180) % 360) - 180
        ds = ds.assign_coords({lon_name: new_lon})
        ds = ds.sortby(lon_name)
    
    # Sort lat ascending
    lat_vals = ds[lat_name].values
    if lat_vals[0] > lat_vals[-1]:
        ds = ds.isel({lat_name: slice(None, None, -1)})
    
    # Drop any pre-existing conflicting coord names
    for drop_name in ['lat', 'lon', 'latitude', 'longitude']:
        if drop_name in ds.coords and drop_name != lat_name and drop_name != lon_name:
            ds = ds.drop_vars(drop_name, errors='ignore')
    
    # Select domain
    ds = ds.sel({lat_name: slice(5, 30), lon_name: slice(45, 105)})
    
    # Interpolate
    out = ds[var_name].interp(
        {lat_name: target_lat, lon_name: target_lon},
        method='linear'
    )
    # Rename dims to standard
    rename_map = {}
    for dim in list(out.dims):
        if dim == lat_name:
            rename_map[dim] = 'lat'
        elif dim == lon_name:
            rename_map[dim] = 'lon'
    if rename_map:
        out = out.rename(rename_map)
    return out


# ════════════════════════════════════════════════════════════════════════
# 1. SST — OSTIA 0.05° daily
# ════════════════════════════════════════════════════════════════════════
print("\n=== SST ===")
ds = xr.open_dataset(f"{RAW_DIR}/sst/sst_ostia_2023_nio.nc")
sst = regrid_var(ds, 'analysed_sst', 'latitude', 'longitude')
if sst.mean() > 100:
    sst = sst - 273.15
print(f"  Shape: {sst.shape}, NaN: {np.isnan(sst).mean()*100:.1f}%")
ds.close()

# ════════════════════════════════════════════════════════════════════════
# 2. SSH — AVISO 0.25° daily
# ════════════════════════════════════════════════════════════════════════
print("\n=== SSH ===")
ds = xr.open_dataset(f"{RAW_DIR}/ssh/ssh_aviso_2023_nio.nc")
ssh = regrid_var(ds, 'sla', 'latitude', 'longitude')
print(f"  Shape: {ssh.shape}, NaN: {np.isnan(ssh).mean()*100:.1f}%")
ds.close()

# ════════════════════════════════════════════════════════════════════════
# 3. SSS — OISSS 0.25° 7-day
# ════════════════════════════════════════════════════════════════════════
print("\n=== SSS ===")
sss_dir = f"{RAW_DIR}/sss"
sss_files = sorted([f for f in os.listdir(sss_dir) if f.endswith('.nc')])
print(f"  Files: {len(sss_files)}")

sss_list = []
for f in sss_files:
    ds = xr.open_dataset(f"{sss_dir}/{f}")
    s = regrid_var(ds, 'sss', 'latitude', 'longitude')
    sss_list.append(s)
    ds.close()

sss_stacked = xr.concat(sss_list, dim='time')
# Fix any cftime → datetime64
try:
    import cftime
    times = sss_stacked.time.values
    if hasattr(times[0], 'isoformat'):
        new_times = np.array([np.datetime64(str(t)[:10]) for t in times])
        sss_stacked = sss_stacked.assign_coords(time=new_times)
except:
    pass

# Interpolate 7-day → daily
sss_daily = sss_stacked.interp(time=sst.time, method='linear')
sss_daily = sss_daily.transpose('time', 'lat', 'lon')
print(f"  Shape: {sss_daily.shape}, NaN: {np.isnan(sss_daily).mean()*100:.1f}%")

# ════════════════════════════════════════════════════════════════════════
# 4. OSCAR currents — 0.25° daily (0-360 lon, cftime)
# ════════════════════════════════════════════════════════════════════════
print("\n=== OSCAR currents ===")
cur_dir = f"{RAW_DIR}/currents"
cur_files = sorted([f for f in os.listdir(cur_dir) if f.endswith('.nc')])
print(f"  Files: {len(cur_files)}")

u_list = []
v_list = []
for i, f in enumerate(cur_files):
    ds = xr.open_dataset(f"{cur_dir}/{f}")
    u_val = regrid_var(ds, 'u', 'latitude', 'longitude')
    v_val = regrid_var(ds, 'v', 'latitude', 'longitude')
    
    # Convert cftime → datetime64 IMMEDIATELY (before concat)
    try:
        times = u_val.time.values
        if hasattr(times[0], 'isoformat'):
            new_times = np.array([np.datetime64(str(t)[:10], 'ns') for t in times])
            u_val = u_val.assign_coords(time=new_times)
            v_val = v_val.assign_coords(time=new_times)
    except:
        pass
    
    u_list.append(u_val)
    v_list.append(v_val)
    ds.close()
    
    if (i+1) % 50 == 0:
        print(f"  Processed {i+1}/{len(cur_files)}")

u_stacked = xr.concat(u_list, dim='time')
v_stacked = xr.concat(v_list, dim='time')
print(f"  After concat: shape={u_stacked.shape}, NaN={np.isnan(u_stacked.values).mean()*100:.1f}%")

# Each file has 1 day, no duplicates expected after cftime→datetime64 conversion
# But just in case, average duplicates
u_daily = u_stacked.groupby('time').mean(dim=None)
v_daily = v_stacked.groupby('time').mean(dim=None)
print(f"  After groupby: shape={u_daily.shape}, NaN={np.isnan(u_daily.values).mean()*100:.1f}%")

# Sort by time
u_daily = u_daily.sortby('time')
v_daily = v_daily.sortby('time')

# Ensure time is numpy datetime64 (in case groupby brought back cftime)
u_times = u_daily.time.values
v_times = v_daily.time.values
if hasattr(u_times[0], 'isoformat'):
    u_daily = u_daily.assign_coords(time=np.array([np.datetime64(str(t)[:10], 'ns') for t in u_times]))
    v_daily = v_daily.assign_coords(time=np.array([np.datetime64(str(t)[:10], 'ns') for t in v_times]))

# Interpolate to SST time
u_daily = u_daily.interp(time=sst.time, method='linear')
v_daily = v_daily.interp(time=sst.time, method='linear')
print(f"  After interp: shape={u_daily.shape}, NaN={np.isnan(u_daily.values).mean()*100:.1f}%")
u_daily = u_daily.transpose('time', 'lat', 'lon')
v_daily = v_daily.transpose('time', 'lat', 'lon')
print(f"  Shape: {u_daily.shape}, NaN: {np.isnan(u_daily).mean()*100:.1f}%")

# ════════════════════════════════════════════════════════════════════════
# 5. ERA5 winds — already 0.25° NIO
# ════════════════════════════════════════════════════════════════════════
print("\n=== ERA5 winds ===")
ds = xr.open_dataset(f"{RAW_DIR}/winds/era5_u10v10_2023_nio.nc")

# Handle valid_time → time rename
if 'valid_time' in ds.dims:
    ds = ds.rename({'valid_time': 'time'})
if 'latitude' in ds.coords:
    lat_name = 'latitude'
elif 'lat' in ds.coords:
    lat_name = 'lat'
else:
    lat_name = list(ds.dims)[1]

lon_name = 'longitude' if 'longitude' in ds.coords else 'lon'

# Drop expver if present
if 'expver' in ds.dims:
    ds = ds.isel(expver=0).drop_vars('expver', errors='ignore')

# Select domain
lat_vals = ds[lat_name].values
if lat_vals[0] > lat_vals[-1]:
    ds = ds.sel({lat_name: slice(30, 5), lon_name: slice(45, 105)})
else:
    ds = ds.sel({lat_name: slice(5, 30), lon_name: slice(45, 105)})

u10 = ds['u10'].rename({lat_name: 'lat', lon_name: 'lon'})
v10 = ds['v10'].rename({lat_name: 'lat', lon_name: 'lon'})
ds.close()

# 6-hourly → daily
u10_daily = u10.resample(time='1D').mean()
v10_daily = v10.resample(time='1D').mean()
print(f"  Shape: {u10_daily.shape}, NaN: {np.isnan(u10_daily).mean()*100:.1f}%")

# ════════════════════════════════════════════════════════════════════════
# 6. Combine all 7 channels
# ════════════════════════════════════════════════════════════════════════
print("\n=== Combining ===")

# Align all to same time axis
time_ref = sst.time

# Make sure all have same lat/lon dims in same order
def ensure_order(da):
    return da.transpose('time', 'lat', 'lon')

channels = np.stack([
    ensure_order(sst).values,
    ensure_order(ssh).values,
    ensure_order(sss_daily).values,
    ensure_order(u_daily).values,
    ensure_order(v_daily).values,
    ensure_order(u10_daily).values,
    ensure_order(v10_daily).values,
], axis=1).astype(np.float32)

print(f"  Shape: {channels.shape} (time, channels, lat, lon)")
for i, name in enumerate(['sst','ssh','sss','u_cur','v_cur','u_wnd','v_wnd']):
    nan_pct = np.isnan(channels[:,i]).mean()*100
    print(f"    {name}: NaN={nan_pct:.1f}%")

# Save
ds_out = xr.Dataset({
    'surface': (['time', 'channel', 'lat', 'lon'], channels),
}, coords={
    'time': time_ref,
    'channel': ['sst', 'ssh', 'sss', 'u_current', 'v_current', 'u_wind', 'v_wind'],
    'lat': target_lat,
    'lon': target_lon,
})
ds_out.attrs['domain'] = 'NIO (5-30N, 45-105E)'
ds_out.attrs['resolution'] = '0.25 deg'
ds_out.attrs['year'] = '2023'

out_path = f"{PROC_DIR}/surface_inputs_2023_NIO.nc"
ds_out.to_netcdf(out_path)
print(f"\nSaved: {out_path} ({os.path.getsize(out_path)/1e6:.1f} MB)")
