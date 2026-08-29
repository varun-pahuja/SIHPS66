#!/bin/bash
source ~/miniconda3/etc/profile.d/conda.sh
conda activate ocean
cd /home/varun/Downloads/Ps66
PYTHONUNBUFFERED=1 python scripts/train.py 2023 10
