#!/usr/bin/env bash
# OceanEmbed - download_surface.sh
# Downloads the SURFACE input variables for the North Indian Ocean domain.
# Currently supports NASA PODAAC products (which use Earthdata URS login):
#   - SMAP Sea Surface Salinity (SSS)
#   - OSCAR surface currents (U, V)
#
# These use NASA's CMR API with an Earthdata bearer token.
#
# PREREQUISITES:
#   1) Register at https://urs.earthdata.nasa.gov/users/new
#   2) Set creds in shell:
#        export EARTHDATA_USER="your_username"
#        export EARTHDATA_PASS="your_password"
#   3) conda activate ocean
#
# Run:  bash scripts/download_surface.sh sss    (or 'currents')
set -euo pipefail

PRODUCT="${1:-sss}"
OUTDIR="/home/varun/Downloads/Ps66/data/raw/surface"
mkdir -p "$OUTDIR"

echo "======================================================"
echo " Downloading surface product: $PRODUCT"
echo "======================================================"

# --- Get an Earthdata bearer token from URS --------------------
get_token() {
  curl -s -X POST \
    -u "${EARTHDATA_USER:?set EARTHDATA_USER}:${EARTHDATA_PASS:?set EARTHDATA_PASS}" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=client_credentials" \
    https://urs.earthdata.nasa.gov/api/users/tokens | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || {
      echo "ERROR: Could not get Earthdata token. Check your username/password." >&2
      exit 1
    }
}
TOKEN="$(get_token)"
echo "Got Earthdata token (first 12 chars): ${TOKEN:0:12}..."

# --- Domain bounding box (lon_min, lon_max, lat_min, lat_max) ----
BBOX="45,5,105,30"

case "$PRODUCT" in
  sss)
    # SMAP Level-3 CAP V5 8-day running mean, 0.25 deg, global daily
    SHORT="SMAP_JPL_L3_SSS_CAP_8DAY-RUNNINGMEAN_V5"
    echo "SMAP SSS: $SHORT"
    # Granule search via CMR API
    URL=$(curl -s -H "Authorization: Bearer $TOKEN" \
      "https://cmr.earthdata.nasa.gov/search/granules.json?short_name=${SHORT}&bounding_box=${BBOX}&page_size=5&temporal=2023-01-01T00:00:00Z,2023-12-31T23:59:59Z" \
      | python3 -c "import sys,json; d=json.load(sys.stdin); links=[x['links'] for x in d['feed']['entry']][0]; print([l['href'] for l in links if l.get('href','').endswith('.h5')][0])" 2>/dev/null || echo "NO_GRANULE")
    if [ "$URL" = "NO_GRANULE" ]; then
      echo "ERROR: Could not find SMAP granules. Check product ID or CMR reachability."
      echo "Hint: manually browse https://podaac.jpl.nasa.gov/dataset/$SHORT"
      exit 1
    fi
    echo "Downloading: $URL"
    curl -s -L -H "Authorization: Bearer $TOKEN" -o "$OUTDIR/smap_sss.h5" "$URL"
    echo "Saved to $OUTDIR/smap_sss.h5"
    ;;
  currents)
    # OSCAR surface currents, 0.25 deg, 5-day, global
    SHORT="OSCAR_L4_OC_third-deg"
    echo "OSCAR currents: $SHORT"
    URL=$(curl -s -H "Authorization: Bearer $TOKEN" \
      "https://cmr.earthdata.nasa.gov/search/granules.json?short_name=${SHORT}&bounding_box=${BBOX}&page_size=5&temporal=2023-01-01T00:00:00Z,2023-12-31T23:59:59Z" \
      | python3 -c "import sys,json; d=json.load(sys.stdin); links=[x['links'] for x in d['feed']['entry']][0]; from os.path import basename; print([l['href'] for l in links if '.nc' in l.get('href','')][0])" 2>/dev/null || echo "NO_GRANULE")
    if [ "$URL" = "NO_GRANULE" ]; then
      echo "ERROR: Could not find OSCAR granules."
      exit 1
    fi
    echo "Downloading: $URL"
    curl -s -L -H "Authorization: Bearer $TOKEN" -o "$OUTDIR/oscar_uv.nc" "$URL"
    echo "Saved to $OUTDIR/oscar_uv.nc"
    ;;
  *)
    echo "Unknown product: $PRODUCT. Use 'sss' or 'currents'."
    exit 1
    ;;
esac

echo ""
echo "Done. Note: CMR often needs exact product IDs & years. We'll refine per-product."
