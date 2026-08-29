"use client";

import {
  Activity,
  Zap,
  Brain,
  Cpu,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

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

const MODEL_ICONS: Record<string, React.ReactNode> = {
  linear: <TrendingUp size={18} />,
  cnn: <Activity size={18} />,
  autoencoder: <Zap size={18} />,
  vit: <Brain size={18} />,
  shallow: <Cpu size={18} />,
};

const MODEL_COLORS: Record<string, string> = {
  linear: "from-ocean-500 to-ocean-600",
  cnn: "from-teal-500 to-teal-600",
  autoencoder: "from-coral-400 to-coral-500",
  vit: "from-amber-400 to-amber-500",
  shallow: "from-warm-400 to-warm-500",
};

export function ModelCards({ models, selected, onSelect }: ModelCardsProps) {
  const modelEntries = Object.entries(models);

  return (
    <section id="models" className="border-b border-warm-200/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-warm-900">
            Model Comparison
          </h2>
          <p className="mt-3 text-warm-500">
            Five architectures evaluated on the same 2023 North Indian Ocean
            dataset.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modelEntries.map(([key, model]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`group relative w-full rounded-2xl border p-6 text-left transition-all duration-300 ${
                selected === key
                  ? "border-ocean-300 bg-gradient-to-br from-ocean-50 to-teal-50 shadow-xl shadow-ocean-500/10"
                  : "border-warm-200/60 bg-white hover:border-ocean-200 hover:shadow-lg hover:shadow-ocean-500/5"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${MODEL_COLORS[key]} text-white shadow-lg ${
                    selected === key
                      ? "shadow-ocean-500/30"
                      : "shadow-warm-500/10"
                  }`}
                >
                  {MODEL_ICONS[key]}
                </div>
                <span className="font-mono text-xs text-warm-400">
                  {model.params}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-bold text-warm-900">
                {model.name}
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-warm-500">
                {model.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-warm-50/80 p-3">
                  <div className="text-xs font-medium text-warm-400">RMSE</div>
                  <div className="font-mono text-lg font-bold text-warm-900">
                    {model.rmse.toFixed(3)}
                    <span className="text-xs font-normal text-warm-400">
                      {" "}
                      °C
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-warm-50/80 p-3">
                  <div className="text-xs font-medium text-warm-400">
                    Correlation
                  </div>
                  <div className="font-mono text-lg font-bold text-warm-900">
                    {model.correlation.toFixed(3)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-warm-100 pt-4">
                <span className="text-xs text-warm-400">
                  {model.inference} inference
                </span>
                <span className="text-xs font-medium text-warm-500">
                  {model.bestFor}
                </span>
              </div>

              {selected === key && (
                <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-white">
                  <ArrowUpRight size={12} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
