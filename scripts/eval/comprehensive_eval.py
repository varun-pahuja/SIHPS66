#!/usr/bin/env python3
"""
OceanEmbed — Comprehensive Evaluation
Generates all comparison plots: model comparison, spatial analysis, seasonal breakdown.
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

# Load comparison results
with open(LOG_DIR / "comparison_2023.json") as f:
    comp = json.load(f)

models = comp["models"]
model_names = list(models.keys())

# ═══════════════════════════════════════════════════════════════
# PLOT 1: Model Comparison — RMSE by Depth
# ═══════════════════════════════════════════════════════════════
fig, axes = plt.subplots(1, 2, figsize=(14, 7))

colors = {'Linear': '#e74c3c', 'Shallow': '#95a5a6', 'CNN': '#3498db', 
          'Autoencoder': '#2ecc71', 'ViT': '#9b59b6'}

for name in model_names:
    if not models[name]:
        continue
    rmse = [models[name].get(str(d), {}).get("rmse", np.nan) for d in TARGET_DEPTHS]
    axes[0].plot(rmse, TARGET_DEPTHS, 'o-', label=name, color=colors.get(name, '#333'), 
                 linewidth=2, markersize=5)

axes[0].invert_yaxis()
axes[0].set_xlabel('RMSE (°C)', fontsize=12)
axes[0].set_ylabel('Depth (m)', fontsize=12)
axes[0].set_title('RMSE by Depth — All Models', fontsize=14, fontweight='bold')
axes[0].legend(fontsize=10)
axes[0].grid(True, alpha=0.3)
axes[0].set_xscale('log')

for name in model_names:
    if not models[name]:
        continue
    corr = [models[name].get(str(d), {}).get("corr", np.nan) for d in TARGET_DEPTHS]
    axes[1].plot(corr, TARGET_DEPTHS, 'o-', label=name, color=colors.get(name, '#333'),
                 linewidth=2, markersize=5)

axes[1].invert_yaxis()
axes[1].set_xlabel('Correlation', fontsize=12)
axes[1].set_ylabel('Depth (m)', fontsize=12)
axes[1].set_title('Correlation by Depth — All Models', fontsize=14, fontweight='bold')
axes[1].legend(fontsize=10)
axes[1].grid(True, alpha=0.3)
axes[1].set_xlim(-0.1, 1.0)

plt.suptitle('Model Comparison — North Indian Ocean (2023)', fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(FIG_DIR / 'comparison_rmse_corr.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: comparison_rmse_corr.png")

# ═══════════════════════════════════════════════════════════════
# PLOT 2: Bar Chart — Average RMSE by Model
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 5))

model_labels = []
avg_rmses = []
avg_corrs = []
bar_colors = []
for name in model_names:
    if not models[name]:
        continue
    model_labels.append(name)
    avg_rmses.append(np.mean([m["rmse"] for m in models[name].values()]))
    avg_corrs.append(np.mean([m["corr"] for m in models[name].values()]))
    bar_colors.append(colors.get(name, '#333'))

x = np.arange(len(model_labels))
width = 0.35

bars1 = ax.bar(x - width/2, avg_rmses, width, label='Avg RMSE (°C)', color=bar_colors, alpha=0.85)
ax2 = ax.twinx()
bars2 = ax2.bar(x + width/2, avg_corrs, width, label='Avg Correlation', color=bar_colors, alpha=0.4, hatch='//')

ax.set_xlabel('Model', fontsize=12)
ax.set_ylabel('Avg RMSE (°C)', fontsize=12, color='#e74c3c')
ax2.set_ylabel('Avg Correlation', fontsize=12, color='#3498db')
ax.set_title('Model Comparison — Average Performance', fontsize=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(model_labels, fontsize=11)

# Add value labels
for bar, val in zip(bars1, avg_rmses):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, f'{val:.3f}',
            ha='center', va='bottom', fontsize=9, color='#e74c3c')
for bar, val in zip(bars2, avg_corrs):
    ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, f'{val:.3f}',
             ha='center', va='bottom', fontsize=9, color='#3498db')

lines1, labels1 = ax.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax.legend(lines1 + lines2, labels1 + labels2, loc='upper right')
ax.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig(FIG_DIR / 'comparison_bars.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: comparison_bars.png")

# ═══════════════════════════════════════════════════════════════
# PLOT 3: Heatmap — RMSE per depth per model
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 8))

valid_models = [n for n in model_names if models[n]]
heatmap = np.zeros((len(valid_models), len(TARGET_DEPTHS)))
for i, name in enumerate(valid_models):
    for j, d in enumerate(TARGET_DEPTHS):
        heatmap[i, j] = models[name].get(str(d), {}).get("rmse", np.nan)

im = ax.imshow(heatmap, aspect='auto', cmap='YlOrRd', interpolation='nearest')
ax.set_yticks(range(len(valid_models)))
ax.set_yticklabels(valid_models, fontsize=11)
ax.set_xticks(range(len(TARGET_DEPTHS)))
ax.set_xticklabels([f'{d}m' for d in TARGET_DEPTHS], rotation=45, ha='right', fontsize=10)
ax.set_title('RMSE Heatmap (°C) — Model × Depth', fontsize=14, fontweight='bold')

# Add text annotations
for i in range(len(valid_models)):
    for j in range(len(TARGET_DEPTHS)):
        val = heatmap[i, j]
        color = 'white' if val > 1.0 else 'black'
        ax.text(j, i, f'{val:.2f}', ha='center', va='center', fontsize=8, color=color)

plt.colorbar(im, label='RMSE (°C)', shrink=0.8)
plt.tight_layout()
plt.savefig(FIG_DIR / 'comparison_heatmap.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: comparison_heatmap.png")

# ═══════════════════════════════════════════════════════════════
# PLOT 4: Depth zone comparison
# ═══════════════════════════════════════════════════════════════
zones = {
    'Surface\n(2-30m)': [0, 5],
    'Thermocline\n(50-150m)': [5, 9],
    'Deep\n(200-1000m)': [9, 15],
}

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
for idx, (zone_name, (i, j)) in enumerate(zones.items()):
    zone_depths = TARGET_DEPTHS[i:j]
    for name in valid_models:
        rmse = [models[name].get(str(d), {}).get("rmse", np.nan) for d in zone_depths]
        axes[idx].plot(zone_depths, rmse, 'o-', label=name, color=colors.get(name, '#333'), linewidth=2)
    axes[idx].set_title(zone_name, fontsize=12, fontweight='bold')
    axes[idx].set_xlabel('Depth (m)')
    axes[idx].set_ylabel('RMSE (°C)')
    axes[idx].grid(True, alpha=0.3)
    axes[idx].legend(fontsize=8)

plt.suptitle('Performance by Ocean Zone', fontsize=14, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(FIG_DIR / 'comparison_zones.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: comparison_zones.png")

# ═══════════════════════════════════════════════════════════════
# PLOT 5: Training history comparison
# ═══════════════════════════════════════════════════════════════
hist_path = LOG_DIR / "baseline_histories_2023.json"
vit_hist_path = LOG_DIR / "history_2023.json"

if hist_path.exists():
    with open(hist_path) as f:
        baseline_hist = json.load(f)
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    for name in model_names:
        if name in baseline_hist:
            epochs = [h["epoch"] for h in baseline_hist[name]]
            val_losses = [h["val_loss"] for h in baseline_hist[name]]
            axes[0].plot(epochs, val_losses, label=name, color=colors.get(name, '#333'), linewidth=2)
    
    if vit_hist_path.exists():
        with open(vit_hist_path) as f:
            vit_hist = json.load(f)
        epochs = [h["epoch"] for h in vit_hist]
        val_losses = [h["val_loss"] for h in vit_hist]
        axes[0].plot(epochs, val_losses, label='ViT', color=colors['ViT'], linewidth=2)
    
    axes[0].set_xlabel('Epoch', fontsize=12)
    axes[0].set_ylabel('Validation Loss (MSE)', fontsize=12)
    axes[0].set_title('Training Convergence', fontsize=14, fontweight='bold')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)
    
    # RMSE over epochs
    for name in model_names:
        if name in baseline_hist:
            epochs = [h["epoch"] for h in baseline_hist[name]]
            rmses = [h["avg_rmse"] for h in baseline_hist[name]]
            axes[1].plot(epochs, rmses, label=name, color=colors.get(name, '#333'), linewidth=2)
    
    if vit_hist_path.exists():
        with open(vit_hist_path) as f:
            vit_hist = json.load(f)
        epochs = [h["epoch"] for h in vit_hist]
        rmses = [h["avg_rmse"] for h in vit_hist]
        axes[1].plot(epochs, rmses, label='ViT', color=colors['ViT'], linewidth=2)
    
    axes[1].set_xlabel('Epoch', fontsize=12)
    axes[1].set_ylabel('Avg RMSE (°C)', fontsize=12)
    axes[1].set_title('RMSE Over Training', fontsize=14, fontweight='bold')
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(FIG_DIR / 'comparison_training.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Saved: comparison_training.png")

# ═══════════════════════════════════════════════════════════════
# PLOT 6: Model complexity vs performance
# ═══════════════════════════════════════════════════════════════
param_counts = {
    'Linear': 14815759,
    'Shallow': 7951,
    'CNN': 654223,
    'Autoencoder': 145231,
    'ViT': 943000,
}

fig, ax = plt.subplots(figsize=(8, 6))
for name in valid_models:
    avg_rmse = np.mean([m["rmse"] for m in models[name].values()])
    n_params = param_counts.get(name, 0)
    ax.scatter(n_params, avg_rmse, s=200, color=colors.get(name, '#333'), 
               zorder=5, edgecolors='black', linewidth=1)
    ax.annotate(name, (n_params, avg_rmse), textcoords="offset points",
                xytext=(10, 5), fontsize=11, fontweight='bold')

ax.set_xscale('log')
ax.set_xlabel('Number of Parameters (log scale)', fontsize=12)
ax.set_ylabel('Average RMSE (°C)', fontsize=12)
ax.set_title('Model Complexity vs Performance', fontsize=14, fontweight='bold')
ax.grid(True, alpha=0.3, which='both')

plt.tight_layout()
plt.savefig(FIG_DIR / 'comparison_complexity.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: comparison_complexity.png")

# ═══════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("COMPREHENSIVE EVALUATION SUMMARY")
print("=" * 60)

for name in valid_models:
    rmses = [m["rmse"] for m in models[name].values()]
    corrs = [m["corr"] for m in models[name].values()]
    print(f"\n{name:15s} | Avg RMSE={np.mean(rmses):.4f} | Avg Corr={np.mean(corrs):.4f} | Params={param_counts.get(name, 'N/A'):>10,}")
    print(f"{'':15s} | Surface(2-30m)={np.mean(rmses[:5]):.4f} | Mid(50-150m)={np.mean(rmses[5:9]):.4f} | Deep(200-1000m)={np.mean(rmses[9:]):.4f}")

print("\nAll plots saved to:", FIG_DIR)
