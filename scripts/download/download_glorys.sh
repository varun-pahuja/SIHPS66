#!/usr/bin/env bash
# OceanEmbed - download_glorys.sh
# Downloads GLORYS12V1 reanalysis subsurface temperature (the TRAINING TARGET)
# for the North Indian Ocean domain, using the CMEMS `copernicusmarine` CLI.
#
# PREREQUISITES (before running):
#   1) Register a free CMEMS account:  https://data.marine.copernicus.eu/register
#   2) Set credentials in your shell (copernicusmarine reads these env vars):
#        export COPERNICUSMARINE_SERVICE_USERNAME="your.email@example.com"
#        export COPERNICUSMARINE_SERVICE_PASSWORD="your_password"
#   3) conda activate ocean  (see setup_env.sh)
#
# Run:  bash scripts/download_glorys.sh 2023-01-01 2023-12-31
set -euo pipefail

START="${1:-2023-01-01}"
END="${2:-2023-12-31}"

# Fall back to the CMEMS_USER/CMEMS_PASS var names if the copernicus ones unset
export COPERNICUSMARINE_SERVICE_USERNAME="${COPERNICUSMARINE_SERVICE_USERNAME:-${CMEMS_USER:-}}"
export COPERNICUSMARINE_SERVICE_PASSWORD="${COPERNICUSMARINE_SERVICE_PASSWORD:-${CMEMS_PASS:-}}"

if [ -z "$COPERNICUSMARINE_SERVICE_USERNAME" ] || [ -z "$COPERNICUSMARINE_SERVICE_PASSWORD" ]; then
  echo "ERROR: Set your CMEMS credentials first:"
  echo "  export COPERNICUSMARINE_SERVICE_USERNAME=\"you@email.com\""
  echo "  export COPERNICUSMARINE_SERVICE_PASSWORD=\"your_password\""
  exit 1
fi

echo "======================================================"
echo " Downloading GLORYS12V1 subsurface temperature (thetao)"
echo " DOI: 10.48670/moi-00021"
echo " Period: $START to $END"
echo " Domain: 5N-30N, 45E-105E (North Indian Ocean)"
echo " Depths: 0.494 to 1000 m (ALL depth levels)"
echo " Variable: thetao"
echo " User: $COPERNICUSMARINE_SERVICE_USERNAME"
echo "======================================================"

OUTDIR="/home/varun/Downloads/Ps66/data/raw/glorys"
mkdir -p "$OUTDIR"

copernicusmarine subset \
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
  --output-directory "$OUTDIR"

echo ""
echo "Downloaded to: $OUTDIR"
echo "Done."