"use client";

import { motion } from "framer-motion";

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
  const entries = Object.entries(models);
  const bestRmse = Math.min(...entries.map(([, m]) => m.rmse));
  const bestCorr = Math.max(...entries.map(([, m]) => m.correlation));

  return (
    <section id="metrics" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 max-w-2xl"
        >
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ocean-600">
            Full Comparison
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-sand-900 md:text-4xl">
            Detailed metrics
          </h2>
          <p className="mt-3 text-base text-sand-500">
            Comprehensive evaluation across all model architectures on the 2023
            North Indian Ocean benchmark.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-sand-200/60 bg-white/70 backdrop-blur-sm"
        >
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200/60">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">
                    Model
                  </th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">
                    RMSE
                  </th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">
                    Correlation
                  </th>
                  <th className="hidden px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400 lg:table-cell">
                    Parameters
                  </th>
                  <th className="hidden px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400 xl:table-cell">
                    Inference
                  </th>
                  <th className="hidden px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400 xl:table-cell">
                    Best For
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([key, model]) => (
                  <tr
                    key={key}
                    className="border-b border-sand-100/60 transition-colors hover:bg-sand-50/50 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sand-100 text-sand-500">
                          {getModelIconSmall(key)}
                        </div>
                        <div>
                          <div className="font-medium text-sand-800">
                            {model.name}
                          </div>
                          <div className="text-[10px] text-sand-400">{key}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-sand-700">
                          {model.rmse.toFixed(3)}
                        </span>
                        {model.rmse === bestRmse && (
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ocean-100 text-ocean-600">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1.5 4L3.5 6L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-sand-700">
                          {model.correlation.toFixed(3)}
                        </span>
                        {model.correlation === bestCorr && (
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ocean-100 text-ocean-600">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1.5 4L3.5 6L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 font-mono text-sand-500 lg:table-cell">
                      {model.params}
                    </td>
                    <td className="hidden px-6 py-4 font-mono text-sand-500 xl:table-cell">
                      {model.inference}
                    </td>
                    <td className="hidden px-6 py-4 text-sand-400 xl:table-cell">
                      {model.bestFor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-sand-100/60 md:hidden">
            {entries.map(([key, model]) => (
              <div key={key} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sand-100 text-sand-500">
                      {getModelIconSmall(key)}
                    </div>
                    <div className="font-medium text-sand-800">{model.name}</div>
                  </div>
                  {model.rmse === bestRmse && (
                    <span className="rounded-full bg-ocean-50 px-2 py-0.5 text-[9px] font-semibold uppercase text-ocean-600">
                      Best
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-sand-50 px-3 py-2">
                    <div className="text-[10px] text-sand-400">RMSE</div>
                    <div className="font-mono text-sm font-medium text-sand-700">
                      {model.rmse.toFixed(3)} °C
                    </div>
                  </div>
                  <div className="rounded-lg bg-sand-50 px-3 py-2">
                    <div className="text-[10px] text-sand-400">Correlation</div>
                    <div className="font-mono text-sm font-medium text-sand-700">
                      {model.correlation.toFixed(3)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-sand-400">
                  {model.params} params · {model.inference} · {model.bestFor}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-4 flex items-center gap-3 text-[10px] text-sand-400">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ocean-100 text-ocean-600">
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <path d="M1 3.5L2.5 5L6 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Best in category
          </div>
          <span className="text-sand-200">|</span>
          <span>All models trained on 2023 NIO data</span>
        </div>
      </div>
    </section>
  );
}

function getModelIconSmall(key: string) {
  const icons: Record<string, React.ReactNode> = {
    linear: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 10L10 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    cnn: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1" />
        <rect x="7" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1" />
        <rect x="1" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1" />
        <rect x="7" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    autoencoder: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M1 6L6 1L11 6L6 11L1 6Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    ),
    vit: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1" />
        <path d="M6 1.5V4M6 8V10.5M1.5 6H4M8 6H10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
    shallow: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 4H10M2 6H10M2 8H10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  };
  return icons[key] || icons.linear;
}
