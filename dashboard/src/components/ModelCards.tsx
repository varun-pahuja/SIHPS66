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

interface ModelCardsProps {
  models: Record<string, ModelInfo>;
  selected: string;
  onSelect: (key: string) => void;
}

export function ModelCards({ models, selected, onSelect }: ModelCardsProps) {
  const entries = Object.entries(models);
  const bestKey = entries.reduce((a, b) =>
    b[1].rmse < a[1].rmse ? b : a
  )[0];

  return (
    <section id="models" className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 max-w-2xl sm:mb-14"
        >
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ocean-600">
            Model Comparison
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-sand-900 sm:text-3xl md:text-4xl">
            Five architectures, one benchmark
          </h2>
          <p className="mt-3 text-sm text-sand-500 sm:text-base">
            Each model evaluated on the same 2023 North Indian Ocean dataset.
            Select any model to inspect its metrics.
          </p>
        </motion.div>

        {/* Bento grid: 1-col mobile, 2-col md, asymmetric on lg */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {entries.map(([key, model], i) => {
            const isBest = key === bestKey;
            const isSelected = selected === key;

            const spanClass =
              i === 0
                ? "lg:col-span-5"
                : i === 1
                ? "lg:col-span-7"
                : i === 2
                ? "lg:col-span-4"
                : i === 3
                ? "lg:col-span-4"
                : "lg:col-span-4";

            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onSelect(key)}
                className={`group relative w-full rounded-2xl border p-5 text-left transition-all duration-300 sm:p-6 ${spanClass} ${
                  isSelected
                    ? "border-ocean-300 bg-ocean-50/40 shadow-[0_0_0_1px_var(--color-ocean-200)]"
                    : "border-sand-200/60 bg-white/70 hover:border-sand-300 hover:bg-white hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]"
                }`}
              >
                {isBest && (
                  <div className="absolute right-4 top-4 rounded-full bg-ocean-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Best
                  </div>
                )}

                <div className="mb-4 flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                      isSelected
                        ? "bg-ocean-100 text-ocean-600"
                        : "bg-sand-100 text-sand-500 group-hover:bg-sand-200"
                    }`}
                  >
                    {getModelIcon(key)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-sand-800">
                      {model.name}
                    </h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-sand-400 line-clamp-2">
                      {model.description}
                    </p>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-sand-50/80 px-3 py-2.5">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-sand-400">
                      RMSE
                    </div>
                    <div className="mt-0.5 font-mono text-sm font-semibold text-sand-700">
                      {model.rmse.toFixed(3)}
                      <span className="ml-0.5 text-xs font-normal text-sand-400">
                        °C
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-sand-50/80 px-3 py-2.5">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-sand-400">
                      Correlation
                    </div>
                    <div className="mt-0.5 font-mono text-sm font-semibold text-sand-700">
                      {model.correlation.toFixed(3)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-sand-100 pt-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5 text-[10px] font-medium text-sand-500">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    {model.params}
                  </span>
                  <span className="text-[10px] text-sand-300">|</span>
                  <span className="font-mono text-[10px] text-sand-400">
                    {model.inference}
                  </span>
                  <span className="hidden flex-1 sm:inline" />
                  <span className="text-[10px] text-sand-400 hidden sm:inline">
                    {model.bestFor}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function getModelIcon(key: string) {
  const icons: Record<string, React.ReactNode> = {
    linear: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 13L14 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    cnn: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="2" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    autoencoder: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 8L8 2L14 8L8 14L2 8Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
    vit: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 2V5M8 11V14M2 8H5M11 8H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    shallow: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  };
  return icons[key] || icons.linear;
}
