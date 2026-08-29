#!/usr/bin/env bash
# OceanEmbed - GRIDSetup.sh
# Sets up the GRID environment (an open-source tool for downloading ocean
# reanalysis/forecast data from CMEMS, including GLORYS).
# Also installs python dependencies via conda.
#
# Run:  bash scripts/setup_env.sh
set -euo pipefail

echo "======================================================"
echo " OceanEmbed - Environment & Tool Setup"
echo "======================================================"

# --- 1. Install Miniconda if not present -------------------------
if ! command -v conda >/dev/null 2>&1; then
  echo "[1/4] Installing Miniconda..."
  cd /tmp
  wget -q https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh
  bash miniconda.sh -b -p "$HOME/miniconda3"
  # shellcheck disable=SC1090
  source "$HOME/miniconda3/etc/profile.d/conda.sh"
  conda init bash
else
  echo "[1/4] Conda already installed."
fi

# Reset conda in this shell
# shellcheck disable=SC1090
source "$HOME/miniconda3/etc/profile.d/conda.sh" 2>/dev/null || source "$(conda info --base)/etc/profile.d/conda.sh"

# --- 2. Create ocean environment (Python 3.12) -------------------
if ! conda env list | grep -q "ocean"; then
  echo "[2/4] Creating 'ocean' conda env (Python 3.12)..."
  conda create -n ocean python=3.12 -y
fi
conda activate ocean

echo "[3/4] Installing core scientific packages..."
conda install -n ocean -y -c conda-forge xarray dask netcdf4 h5py pandas numpy scipy matplotlib -q

echo "[4/4] Installing AI + download tooling..."
pip install --quiet torch torchvision --index-url https://download.pytorch.org/whl/cu121 || \
  echo "  (Torch install warned - check CUDA version for your GPU)"
pip install --quiet scikit-learn cartopy
pip install --quiet gridded 2>/dev/null || echo "  (gridded not on pip - we'll use direct CMEMS API)"
pip install --quiet copernicusmarine 2>/dev/null || echo "  (copernicusmarine not on pip)"

echo ""
echo "Setup complete. Activate with:"
echo "  conda activate ocean"
