"use client";

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
    <section id="metrics" className="border-b border-slate-200 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Detailed Metrics
          </h2>
          <p className="mt-3 text-base text-slate-500">
            Comprehensive comparison across all evaluation dimensions.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3.5 font-medium text-slate-600">
                  Model
                </th>
                <th className="px-5 py-3.5 font-medium text-slate-600">
                  RMSE (°C)
                </th>
                <th className="px-5 py-3.5 font-medium text-slate-600">
                  Correlation
                </th>
                <th className="hidden px-5 py-3.5 font-medium text-slate-600 md:table-cell">
                  Parameters
                </th>
                <th className="hidden px-5 py-3.5 font-medium text-slate-600 lg:table-cell">
                  Inference
                </th>
                <th className="hidden px-5 py-3.5 font-medium text-slate-600 xl:table-cell">
                  Best For
                </th>
              </tr>
            </thead>
            <tbody>
              {modelEntries.map(([key, model]) => (
                <tr
                  key={key}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{model.name}</div>
                    <div className="text-xs text-slate-400">{key}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-700">
                        {model.rmse.toFixed(3)}
                      </span>
                      {model.rmse === bestRmse && (
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-700">
                        {model.correlation.toFixed(3)}
                      </span>
                      {model.correlation === bestCorr && (
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 font-mono text-slate-600 md:table-cell">
                    {model.params}
                  </td>
                  <td className="hidden px-5 py-4 font-mono text-slate-600 lg:table-cell">
                    {model.inference}
                  </td>
                  <td className="hidden px-5 py-4 text-slate-500 xl:table-cell">
                    {model.bestFor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
