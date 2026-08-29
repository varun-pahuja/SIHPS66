"use client";

import { ArrowUpDown, Check } from "lucide-react";

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
    <section id="metrics" className="border-b border-stone-200/50 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            Detailed Metrics
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Comprehensive comparison across all evaluation dimensions.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="px-4 py-3 font-medium text-stone-600">Model</th>
                <th className="px-4 py-3 font-medium text-stone-600">RMSE (°C)</th>
                <th className="px-4 py-3 font-medium text-stone-600">
                  Correlation
                </th>
                <th className="px-4 py-3 font-medium text-stone-600">Params</th>
                <th className="px-4 py-3 font-medium text-stone-600">Inference</th>
                <th className="px-4 py-3 font-medium text-stone-600">Best For</th>
              </tr>
            </thead>
            <tbody>
              {modelEntries.map(([key, model]) => (
                <tr
                  key={key}
                  className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-900">{model.name}</div>
                    <div className="text-xs text-stone-400">{key}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-stone-700">
                        {model.rmse.toFixed(3)}
                      </span>
                      {model.rmse === bestRmse && (
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check size={10} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-stone-700">
                        {model.correlation.toFixed(3)}
                      </span>
                      {model.correlation === bestCorr && (
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check size={10} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-stone-600">
                    {model.params}
                  </td>
                  <td className="px-4 py-3 font-mono text-stone-600">
                    {model.inference}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{model.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={10} />
            </span>
            Best in category
          </div>
          <span>·</span>
          <span>All models trained on 2023 North Indian Ocean data</span>
        </div>
      </div>
    </section>
  );
}
