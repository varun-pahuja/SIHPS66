#!/usr/bin/env bash
# OceanEmbed - download_glorys_monthly.sh
# Downloads GLORYS12V1 subsurface temperature (thetao) for the North Indian Ocean
# in MONTHLY chunks to keep memory/low (safe on machines with limited RAM).
#
# Downloads full year 2023 into data/raw/glorys/YYYYMM/ directories.
#
# PREREQUISITES:
#   export COPERNICUSMARINE_SERVICE_USERNAME="you@email.com"
#   export COPERNICUSMARINE_SERVICE_PASSWORD="your_password"
#   conda activate ocean
#
# Run:  bash scripts/download_glorys_monthly.sh 2023
set -euo pipefail

YEAR="${1:-2023}"
ROOT="/home/varun/Downloads/Ps66/data/raw/glorys"
mkdir -p "$ROOT"

export COPERNICUSMARINE_SERVICE_USERNAME="${COPERNICUSMARINE_SERVICE_USERNAME:-${CMEMS_USER:-}}"
export COPERNICUSMARINE_SERVICE_PASSWORD="${COPERNICUSMARINE_SERVICE_PASSWORD:-${CMEMS_PASS:-}}"
if [ -z "$COPERNICUSMARINE_SERVICE_USERNAME" ] || [ -z "$COPERNICUSMARINE_SERVICE_PASSWORD" ]; then
  echo "ERROR: Set COPERNICUSMARINE_SERVICE_USERNAME / _PASSWORD (or CMEMS_USER/CMEMS_PASS)"
  exit 1
fi

# Absolute path to the copernicusmarine binary so it works in background/nohup
# without conda PATH. Fall back to PATH lookup if not present.
COP=""
if [ -x "/home/varun/miniconda3/envs/ocean/bin/copernicusmarine" ]; then
  COP="/home/varun/miniconda3/envs/ocean/bin/copernicusmarine"
else
  COP="$(command -v copernicusmarine)"
fi
if [ -z "$COP" ]; then
  echo "ERROR: copernicusmarine not found. Activate the 'ocean' conda env."
  exit 1
fi

for M in 01 02 03 04 05 06 07 08 09 10 11 12; do
  OUT="$ROOT/${YEAR}${M}"
  mkdir -p "$OUT"
  # Skip if already has output for that month
  if ls "$OUT"/*.nc >/dev/null 2>&1; then
    echo "[$YEAR-$M] already present, skipping."
    continue
  fi
  echo ""
  echo "======================================================"
  echo " Downloading $YEAR-$M ..."
  echo "======================================================"
  START="${YEAR}-${M}-01"
  # Last day of the month (handles Feb 28/29, 30/31-day months)
  END="$(date -d "${YEAR}-${M}-01 +1 month -1 day" +%Y-%m-%d)"
  echo "  Range: $START to $END"
  "$COP" subset \
    --dataset-id cmems_mod_glo_phy_my_0.083deg_P1D-m \
    --variable thetao \
    --minimum-longitude 45 \
    --maximum-longitude 105 \
    --minimum-latitude 5 \
    --maximum-latitude 30 \
    --start-datetime "${START}T00:00:00" \
    --end-datetime "${END}T23:59:59" \
    --minimum-depth 0.494 \
    --maximum-depth 5902 \
    --force-download \
    --output-directory "$OUT"
  echo "  -> done $YEAR-$M"
done

echo ""
echo "All months downloaded to $ROOT"
