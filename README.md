# OceanEmbed — Satellite Embedding-Based Reconstruction of Subsurface Ocean Temperature

**Prototype for:** Ministry of Earth Sciences (MoES) / INCOIS Hackathon  
**Task:** Predict depth-wise subsurface ocean temperature from surface satellite observations only.  
**Status:** ✅ Complete

---

## 1. What We Built

Satellites give us the **surface** ocean (temp, salinity, height, currents, winds).  
ARGO floats give us the **real temperature below the surface** — but only sparsely.  
We train an AI to look at the **surface** and **predict the temperature at 15 depths**  
(2, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000 m) across the  
**North Indian Ocean** (5°N–30°N, 45°E–105°E) at **0.25° daily** resolution.

---

## 2. Results Summary

| Model | Avg RMSE (°C) | Avg Correlation | Parameters |
|-------|:---:|:---:|---:|
| **Linear** | **0.701** | 0.751 | 14.8M |
| **CNN** | 0.769 | **0.808** | 654K |
| Autoencoder | 0.968 | 0.461 | 145K |
| **ViT (OceanEmbed)** | 0.917 | 0.340 | 943K |
| Shallow CNN | 1.047 | 0.422 | 8K |

**Key finding:** Simple linear models are competitive — the surface-to-depth mapping is primarily a regression problem.

---

## 3. Quick Start

### Prerequisites
- Python 3.12+ (conda environment recommended)
- ~8GB disk space for data
- Account registrations (CMEMS, NASA Earthdata, CDS)

### Installation
```bash
# Clone repo
git clone <repo-url>
cd Ps66

# Create conda environment
conda create -n ocean python=3.12
conda activate ocean

# Install dependencies
pip install -r requirements.txt
```

### Download Data
```bash
# Set credentials
export COPERNICUSMARINE_SERVICE_USERNAME="your@email.com"
export COPERNICUSMARINE_SERVICE_PASSWORD="your_password"

# Download GLORYS (training target)
bash scripts/download_glorys_monthly.sh 2023

# Download surface inputs
bash scripts/download_surface.sh

# Preprocess
python scripts/preprocess_glorys.py
python scripts/preprocess_surface.py
```

### Train Models
```bash
# Train ViT (OceanEmbed)
python scripts/train.py 2023 30

# Train baselines
python scripts/train_baselines.py 2023

# Generate comparison plots
python scripts/comprehensive_eval.py
```

### View Dashboard
```bash
# Open in browser
open notebooks/dashboard_v2.html
```

---

## 4. Project Structure

```
Ps66/
├── scripts/
│   ├── model.py                  # OceanEmbed ViT model (943K params)
│   ├── model_v2.py               # Improved model with depth embedding
│   ├── baselines.py              # Linear, CNN, Autoencoder, Shallow
│   ├── train.py                  # ViT training (V1)
│   ├── train_v1_1.py             # Improved training (grad clip + warmup)
│   ├── train_v2.py               # V2 training (depth-weighted loss)
│   ├── train_baselines.py        # Baseline training
│   ├── preprocess_glorys.py      # GLORYS preprocessing
│   ├── preprocess_surface.py     # Surface inputs preprocessing
│   ├── eval_plots.py             # Evaluation metrics plots
│   ├── comprehensive_eval.py     # Full comparison plots
│   ├── demo.py                   # Demo visualization
│   ├── download_glorys.sh        # GLORYS download
│   ├── download_glorys_monthly.sh # Monthly GLORYS download
│   ├── download_surface.sh       # Surface data download
│   └── setup_env.sh              # Environment setup
├── data/
│   ├── raw/
│   │   ├── glorys/               # Raw GLORYS files (7.4GB)
│   │   ├── surface/              # Raw satellite data
│   │   │   ├── sst/              # OSTIA SST
│   │   │   ├── ssh/              # AVISO SSH
│   │   │   ├── sss/              # OISSS SSS
│   │   │   ├── currents/         # OSCAR currents
│   │   │   └── winds/            # ERA5 winds
│   │   └── argo/                 # Argo validation data
│   └── processed/
│       ├── glorys_nio_2023_MM.nc # Preprocessed GLORYS (12 files)
│       └── surface_inputs_2023_NIO.nc # 7-channel surface (248MB)
├── models/
│   ├── best_model.pt             # Best ViT checkpoint
│   ├── best_model_v1.1.pt        # V1.1 improved checkpoint
│   ├── baseline_linear.pt        # Linear model
│   ├── baseline_cnn.pt           # CNN model
│   ├── baseline_autoencoder.pt   # Autoencoder model
│   └── baseline_shallow.pt       # Shallow CNN model
├── logs/
│   ├── metrics_2023.json         # V1 metrics
│   ├── metrics_v1.1_2023.json    # V1.1 metrics
│   ├── comparison_2023.json      # Full comparison results
│   └── history_*.json            # Training histories
├── notebooks/
│   ├── plots/
│   │   ├── comparison/           # Model comparison plots
│   │   ├── evaluation/           # Evaluation metrics plots
│   │   └── demo/                 # Demo visualizations
│   ├── dashboard.html            # Original dashboard
│   └── dashboard_v2.html         # Premium dark dashboard
├── config/
│   └── config.yaml               # Project configuration
├── docs/
│   └── DATA_ACQUISITION.md       # Data download guide
├── requirements.txt              # Python dependencies
├── .gitignore                    # Git ignore rules
├── REPORT.md                     # Technical report
└── README.md                     # This file
```

---

## 5. Data Sources

| Dataset | Variable | Resolution | Source | Status |
|---------|----------|------------|--------|--------|
| GLORYS12V1 | Temperature (15 depths) | 0.083° daily | CMEMS | ✅ Downloaded |
| OSTIA L4 | SST | 0.05° daily | CMEMS | ✅ Downloaded |
| AVISO DUACS | SSH/SLA | 0.25° daily | CMEMS | ✅ Downloaded |
| OISSS L4 | SSS | 0.25° 8-day | PODAAC | ✅ Downloaded |
| OSCAR | Surface currents (U,V) | 0.25° monthly | PODAAC | ✅ Downloaded |
| ERA5 | Surface winds (U,V) | 0.25° hourly→daily | CDS | ✅ Downloaded |
| Argo | Independent validation | 1° monthly | Ifremer ERDDAP | ✅ Downloaded |

---

## 6. Model Architecture

### OceanEmbed (ViT-based)
```
Surface Input (7×64×64)
    → PatchEmbedding (Conv2d, patch_size=4)
    → TransformerEncoder (4 layers, 4 heads, dim=128)
    → Mean Pooling → Embedding (128-d)
    → DepthDecoder (MLP: 128→256→256→15)
    → Temperature Profile (15 depths)
```

### Input Channels (7)
1. **SST** — Sea Surface Temperature (OSTIA)
2. **SSS** — Sea Surface Salinity (OISSS)
3. **SSH** — Sea Surface Height (AVISO)
4. **Uc** — Ocean current U-component (OSCAR)
5. **Vc** — Ocean current V-component (OSCAR)
6. **Uw** — Wind U-component (ERA5)
7. **Vw** — Wind V-component (ERA5)

---

## 7. Dashboard

Open `notebooks/dashboard_v2.html` in your browser for an interactive visualization:

- Model comparison cards (click to select)
- Depth profile charts (RMSE & Correlation)
- Bar charts for model comparison
- Zone analysis (Surface, Thermocline, Deep)
- Complexity vs Performance scatter
- Detailed metrics table

---

## 8. Hardware Requirements

- **Training:** CPU sufficient (~20s/epoch), GPU optional
- **Storage:** ~15GB total (7.4GB GLORYS + 2GB surface + 1GB processed + models)
- **RAM:** 8GB minimum, 16GB recommended
- **Tested on:** RTX 4050 Laptop (6GB VRAM), 15GB RAM

---

## 9. License

This project is for educational and research purposes.

---

## 10. Contact

For questions about this project, contact the development team.
