"use client";

import { Check, Award, TrendingUp, Zap } from "lucide-react";

interface ModelInfo {
  name: string;
  description: string;
  rmse: number;
  correlation: number;
  params: string;
  inference: string;
  bestFor: string;
}

interface MetricsTableProps {
  models: Record<string, ModelInfo>;
}

export function MetricsTable({ models }: MetricsTableProps) {
  const modelEntries = Object.entries(models);
  const bestRmse = Math.min(...modelEntries.map(([, m]) => m.rmse));
  const bestCorr = Math.max(...modelEntries.map(([, m]) => m.correlation));

  return (
    <section id="metrics" className="border-b border-warm-200/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-warm-900">
            Detailed Metrics
          </h2>
          <p className="mt-3 text-warm-500">
            Comprehensive comparison across all evaluation dimensions.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-warm-200/60 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-warm-100 bg-warm-50/80">
                  <th className="px-6 py-4 font-semibold text-warm-700">
                    Model
                  </th>
                  <th className="px-6 py-4 font-semibold text-warm-700">
                    RMSE (°C)
                  </th>
                  <th className="px-6 py-4 font-semibold text-warm-700">
                    Correlation
                  </th>
                  <th className="px-6 py-4 font-semibold text-warm-700">
                    Parameters
                  </th>
                  <th className="px-6 py-4 font-semibold text-warm-700">
                    Inference
                  </th>
                  <th className="px-6 py-4 font-semibold text-warm-700">
                    Best For
                  </th>
                </tr>
              </thead>
              <tbody>
                {modelEntries.map(([key, model]) => (
                  <tr
                    key={key}
                    className="border-b border-warm-100/50 transition-colors hover:bg-ocean-50/30 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-100 text-warm-600">
                          {model.rmse === bestRmse ? (
                            <Award size={14} />
                          ) : model.correlation === bestCorr ? (
                            <TrendingUp size={14} />
                          ) : (
                            <Zap size={14} />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-warm-900">
                            {model.name}
                          </div>
                          <div className="text-xs text-warm-400">{key}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-warm-700">
                          {model.rmse.toFixed(3)}
                        </span>
                        {model.rmse === bestRmse && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                            <Check size={10} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-warm-700">
                          {model.correlation.toFixed(3)}
                        </span>
                        {model.correlation === bestCorr && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                            <Check size={10} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-warm-600">
                      {model.params}
                    </td>
                    <td className="px-6 py-4 font-mono text-warm-600">
                      {model.inference}
                    </td>
                    <td className="px-6 py-4 text-warm-500">{model.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-warm-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <Check size={10} />
            </span>
            Best in category
          </div>
          <span>All models trained on 2023 North Indian Ocean data</span>
        </div>
      </div>
    </section>
  );
}
