#!/usr/bin/env bash
# OceanEmbed - run_glorys_bg.sh
# Runs the monthly GLORYS downloader in the BACKGROUND (nohup) so it survives
# shell timeouts. Logs to logs/glorys_all.log
#
# Usage:  bash scripts/run_glorys_bg.sh 2023
set -euo pipefail
YEAR="${1:-2023}"
cd /home/varun/Downloads/Ps66

# Credentials must be in environment before calling
if [ -z "${COPERNICUSMARINE_SERVICE_USERNAME:-}" ] && [ -z "${CMEMS_USER:-}" ]; then
  echo "ERROR: Set COPERNICUSMARINE_SERVICE_USERNAME + _PASSWORD (or CMEMS_USER/CMEMS_PASS)"
  exit 1
fi

nohup bash scripts/download_glorys_monthly.sh "$YEAR" \
  > /home/varun/Downloads/Ps66/logs/glorys_all.log 2>&1 &

echo "Launched background GLORYS download for year $YEAR"
echo "PID: $!"
echo "Log: logs/glorys_all.log"
echo "Monitor:  tail -f /home/varun/Downloads/Ps66/logs/glorys_all.log"
