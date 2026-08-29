#!/usr/bin/env python3
"""
OceanEmbed — Evaluation Plots
Generate depth-level metrics, profile comparisons, and vertical section plots.
"""
import sys
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from pathlib import Path

LOG_DIR = Path("/home/varun/Downloads/Ps66/logs")
FIG_DIR = Path("/home/varun/Downloads/Ps66/notebooks")
FIG_DIR.mkdir(parents=True, exist_ok=True)

TARGET_DEPTHS = [2, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000]

# Load metrics
with open(LOG_DIR / "metrics_2023.json") as f:
    metrics = json.load(f)

# Extract arrays
depths = [d for d in TARGET_DEPTHS if str(d) in metrics]
rmse_vals = [metrics[str(d)]["rmse"] for d in depths]
bias_vals = [metrics[str(d)]["bias"] for d in depths]
corr_vals = [metrics[str(d)]["corr"] for d in depths]

# ═══════════════════════════════════════════════════════════════
# Plot 1: Depth-level metrics
# ═══════════════════════════════════════════════════════════════
fig, axes = plt.subplots(1, 3, figsize=(15, 6))

# RMSE
axes[0].plot(rmse_vals, depths, 'o-', color='#e74c3c', linewidth=2, markersize=6)
axes[0].set_xlabel('RMSE (°C)', fontsize=12)
axes[0].set_ylabel('Depth (m)', fontsize=12)
axes[0].set_title('RMSE by Depth', fontsize=14, fontweight='bold')
axes[0].invert_yaxis()
axes[0].grid(True, alpha=0.3)
axes[0].set_xscale('log')

# Bias
axes[1].plot(bias_vals, depths, 's-', color='#3498db', linewidth=2, markersize=6)
axes[1].axvline(x=0, color='gray', linestyle='--', alpha=0.5)
axes[1].set_xlabel('Bias (°C)', fontsize=12)
axes[1].set_ylabel('Depth (m)', fontsize=12)
axes[1].set_title('Bias by Depth', fontsize=14, fontweight='bold')
axes[1].invert_yaxis()
axes[1].grid(True, alpha=0.3)

# Correlation
axes[2].plot(corr_vals, depths, '^-', color='#2ecc71', linewidth=2, markersize=6)
axes[2].axvline(x=0, color='gray', linestyle='--', alpha=0.5)
axes[2].set_xlabel('Correlation', fontsize=12)
axes[2].set_ylabel('Depth (m)', fontsize=12)
axes[2].set_title('Correlation by Depth', fontsize=14, fontweight='bold')
axes[2].invert_yaxis()
axes[2].grid(True, alpha=0.3)
axes[2].set_xlim(-0.2, 1.0)

plt.suptitle('OceanEmbed 7-Channel Model — Validation Metrics (2023)', fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(FIG_DIR / 'eval_metrics_7ch.png', dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {FIG_DIR / 'eval_metrics_7ch.png'}")

# ═══════════════════════════════════════════════════════════════
# Plot 2: Summary bar chart
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 5))
x = np.arange(len(depths))
width = 0.35

bars1 = ax.bar(x - width/2, rmse_vals, width, label='RMSE (°C)', color='#e74c3c', alpha=0.8)
bars2 = ax.bar(x + width/2, [abs(b) for b in bias_vals], width, label='|Bias| (°C)', color='#3498db', alpha=0.8)

ax.set_xlabel('Depth (m)', fontsize=12)
ax.set_ylabel('Error (°C)', fontsize=12)
ax.set_title('OceanEmbed Error by Depth Level', fontsize=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels([str(d) for d in depths], rotation=45, ha='right')
ax.legend()
ax.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig(FIG_DIR / 'eval_bars_7ch.png', dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {FIG_DIR / 'eval_bars_7ch.png'}")

# Print summary
print("\n=== Summary ===")
print(f"Shallow (2-30m) avg RMSE: {np.mean(rmse_vals[:5]):.3f}°C")
print(f"Mid (50-150m) avg RMSE:   {np.mean(rmse_vals[5:9]):.3f}°C")
print(f"Deep (200-1000m) avg RMSE: {np.mean(rmse_vals[9:]):.3f}°C")
print(f"Overall avg RMSE:         {np.mean(rmse_vals):.3f}°C")
print(f"Overall avg correlation:  {np.mean(corr_vals):.3f}")
