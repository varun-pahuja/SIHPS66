# OceanEmbed — Satellite Embedding-Based Reconstruction of Subsurface Ocean Temperature

**Prototype for:** Ministry of Earth Sciences (MoES) / INCOIS Hackathon
**Task:** Predict depth-wise subsurface ocean temperature from surface satellite observations only.

---

## 1. What we're building (30-second version)

Satellites give us the **surface** ocean (temp, salinity, height, currents, winds).
ARGO floats give us the **real temperature below the surface** — but only sparsely.
We train an AI to look at the **surface** and **predict the temperature at 15 depths**
(0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000 m) across the
**North Indian Ocean** (5N–30N, 45E–105E) at **0.25° daily** resolution.

---

## 2. Data acquisition plan

Everything you need, in the right order. **Do registrations FIRST — they need approval.**

### Materials needed (all free, but require account registration)

| # | What | Product (recommended) | Where to register/download | Your account status |
|---|------|----------------------|----------------------------|---------------------|
| 1 | **Subsurface temp (TRAINING TARGET)** | GLORYS12V1 reanalysis | [CMEMS register](https://data.marine.copernicus.eu/register) | ❌ need |
| 2 | **Subsurface temp (EVAL - independent)** | Gridded ARGO | [INCOIS LAS](https://las.incois.gov.in) or [CMEMS ARGO](https://data.marine.copernicus.eu/product/INSITU_GLO_PHY_TS_DISCRETE_MY_013_001/) | ❌ need |
| 3 | Sea Surface Temperature (SST) | OSTIA (0.05° daily) | [CMEMS SST](https://data.marine.copernicus.eu/product/SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001/) | ❌ need |
| 4 | Sea Surface Salinity (SSS) | SMAP (0.25° 8-day) | [NASA PODAAC](https://urs.earthdata.nasa.gov/users/new) + [SMAP](https://podaac.jpl.nasa.gov/dataset/SMAP_JPL_L3_SSS_CAP_8DAY-RUNNINGMEAN_V5) | ❌ need |
| 5 | Sea Surface Height (SSH/SLA) | AVISO / CMEMS | [CMEMS SLA](https://data.marine.copernicus.eu/product/SEALEVEL_GLO_PHY_L4_MY_008_047/) | ❌ need |
| 6 | Surface currents (U,V) | OSCAR (0.25° 5-day) | [NASA PODAAC](https://urs.earthdata.nasa.gov/users/new) + [OSCAR](https://podaac.jpl.nasa.gov/dataset/OSCAR_L4_OC_third-deg) | ❌ need |
| 7 | Surface winds (U,V) | ERA5 (0.25° 6-hour) | [CDS register](https://cds.climate.copernicus.eu/user/register) | ❌ need |

### What I'll set up to make download one command
- `scripts/setup_env.sh` — installs Python + tools
- `scripts/download_glorys.sh` — GLORYS (your training target)
- (We'll add more once we confirm which products/platforms you can access)

---

## 3. Recommended order of operations

```
STEP 1  Register all accounts listed above (5 min each, ~30 min total).
        ⚠️ Do this NOW - CMEMS/CDS approval can take hours-days.
        Track your status in the table above.

STEP 2  Run scripts/setup_env.sh  →  installs Python 3.12 + PyTorch (uses your GPU)

STEP 3  Get GLORYS downloading first (it's your target & biggest dependency).
        export CMEMS_USER=...; export CMEMS_PASS=...
        bash scripts/download_glorys.sh 2023-01-01 2023-12-31

STEP 4  Download surface inputs (SST, SSH, currents, winds, SSS).

STEP 5  Download Gridded ARGO for independent validation.

STEP 6  Run preprocessing to put everything on the 0.25° daily grid.

STEP 7  Build & train the AI model.  (I'll write this)
```

---

## 4. Progress tracking

| Task | Status |
|------|--------|
| 1. Accounts registered | ❌ not yet |
| 2. Python env setup | ❌ not yet |
| 3. GLORYS downloaded | ❌ not yet |
| 4. Surface inputs | ❌ not yet |
| 5. ARGO eval data | ❌ not yet |
| 6. Preprocessing grid | ❌ not yet |
| 7. Model train + eval | ❌ not yet |

---

## 5. Folder layout

```
Ps66/
├── config/config.yaml        ← all settings (domain, depths, resolution, hyperparams)
├── scripts/
│   ├── setup_env.sh          ← install Python + AI tools
│   └── download_glorys.sh    ← download training target from CMEMS
├── data/
│   ├── raw/                  ← downloaded NetCDF files
│   ├── processed/            ← regridded, harmonized 0.25° daily
│   └── embedding/            ← latent satellite embeddings (model output)
├── notebooks/                ← PoC exploration & demo
├── models/                   ← trained weights
└── logs/                     ← training/download logs
```
