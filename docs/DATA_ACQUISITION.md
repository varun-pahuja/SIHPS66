# Data Acquisition Guide

This is your step-by-step guide for getting **all** the data. Work through these as your
accounts get approved. **Order matters** — future steps depend on earlier ones.

---

## Account Registration Checklist (DONE = you can log in)

| Account | URL | Provides | Status |
|---------|-----|----------|--------|
| CMEMS | https://data.marine.copernicus.eu/register | GLORYS, SST, SSH | ☐ |
| NASA Earthdata | https://urs.earthdata.nasa.gov/users/new | SMAP SSS, OSCAR currents | ☐ |
| CDS/ECMWF | https://cds.climate.copernicus.eu/user/register | ERA5 winds | ☐ |
| INCOIS LAS | https://las.incois.gov.in | Gridded ARGO (validation) | ☐ |

> ⚠️ CMEMS and CDS approval can take **hours to days**. Register all at once, in parallel,
> so they approve while you work on other things.

---

## STEP 1 — GLORYS12V1 (Training Target, MOST IMPORTANT)

**What it is:** Global ocean reanalysis at 0.083° × daily with 50 depth levels.
Gives you the `thetao` (temperature) at all depths you need — it IS your training target
and the "ground truth" the model learns from.

**Where:** CMEMS → Products → `GLOBAL_MULTIYEAR_PHY_001_030` → `cmems_mod_glo_phy_my_0.083deg_P1D-m`

**How to download (once CMEMS approved):**
```bash
conda activate ocean
export CMEMS_USER="your_email"
export CMEMS_PASS="your_password"
bash scripts/download_glorys.sh 2023-01-01 2023-12-31
```

**Time/Size estimate:** A single year over the NIO domain at 0.083° ≈ **several GB**.
Start with **1 year** (e.g., 2023) to validate the pipeline, then expand.

---

## STEP 2 — Surface Input Variables

These are the **inputs** your model sees. Download after GLORYS starts.

| Variable | Product | Method | Credentials |
|----------|---------|--------|-------------|
| SST | OSTIA (CMEMS `SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001`) | `copernicusmarine subset` | CMEMS |
| SSH/SLA | AVISO (CMEMS `SEALEVEL_GLO_PHY_L4_MY_008_047`) | `copernicusmarine subset` | CMEMS |
| SSS | SMAP CAP (PODAAC) | `bash scripts/download_surface.sh sss` | NASA Earthdata |
| Currents | OSCAR (PODAAC) | `bash scripts/download_surface.sh currents` | NASA Earthdata |
| Winds U,V | ERA5 (CDS) | CDS API (see below) | CDS key |

### ERA5 winds (needs CDS API key)
1. After CDS approval, get your API key: CDS website → your profile → "API Key"
2. Save it as `~/.cdsapirc`:
   ```
   url: https://cds.climate.copernicus.eu/api
   key: YOUR_UID:YOUR_API_KEY
   ```
3. Then use the `cdsapi` python package (we'll add this script once you have the key).

---

## STEP 3 — Gridded ARGO (Independent Validation)

**What it is:** Real measured subsurface temperature from ARGO floats, gridded.
This is your **holdout test set** — you do NOT train on it. You use it to check whether
your model's predictions match reality in places it never saw.

**Sources (either works):**
- **INCOIS LAS (Gridded ARGO):** https://las.incois.gov.in — the Indian gridded ARGO product
- **CMEMS ARGO** (`INSITU_GLO_PHY_TS_DISCRETE_MY_013_001`) — global gridded ARGO

> ⚠️ **Important:** Your model is trained on GLORYS reanalysis. To prove it works you must
> compare against **real ARGO observations** that were never fed to the model. This is the
> "independent validation" the problem statement requires.

---

## STEP 4 — Preprocessing (what I'll build next, no accounts needed)

Once you have GLORYS + at least the surface data, I'll build the preprocessing pipeline that:
1. Regrids everything to a common **0.25° × daily** grid
2. Co-locates all surface variables at the same time/place as the temperature profiles
3. Produces clean `X` (surface channels) and `y` (15 depth temperatures) pairs
4. Splits into train / validation / test (ARGO held out)

---

## Quick-reference: what maps to what

```
SURFACE INPUTS (X)                     →   SUBSURFACE OUTPUT (y)
────────────────────────────────────      ─────────────────────
SST (temp at surface)                       Temperature at:
SSS (salinity at surface)                    0, 5, 10, 20, 30, 50,
SSH/SLA (sea height)                          75, 100, 125, 150,
currents U,V                                   200, 300, 500, 700,
winds U,V                                      1000 m
       ↓
   [Deep Learning Model learns: surface → profile]
```

---


## Progress tracker (fill in as you go)

| Task | Status |
|------|--------|
| Register CMEMS | ☐ |
| Register NASA Earthdata | ☐ |
| Register CDS | ☐ |
| Register INCOIS | ☐ |
| GLORYS downloaded | ☐ |
| SST downloaded | ☐ |
| SSH downloaded | ☐ |
| SSS downloaded | ☐ |
| Currents downloaded | ☐ |
| Winds downloaded | ☐ |
| ARGO downloaded | ☐ |
