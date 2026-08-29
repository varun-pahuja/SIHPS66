"use client";

import { Activity, Zap, Brain, Cpu, TrendingUp } from "lucide-react";

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

export function ModelCards({ models, selected, onSelect }: ModelCardsProps) {
  const modelEntries = Object.entries(models);

  return (
    <section id="models" className="border-b border-stone-200/50 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            Model Comparison
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Five architectures evaluated on the same 2023 North Indian Ocean dataset.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modelEntries.map(([key, model]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`group relative w-full rounded-xl border p-5 text-left transition-all ${
                selected === key
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    selected === key
                      ? "bg-white/10 text-white"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {MODEL_ICONS[key]}
                </div>
                <span
                  className={`font-mono text-xs ${
                    selected === key ? "text-white/60" : "text-stone-400"
                  }`}
                >
                  {model.params}
                </span>
              </div>

              <h3 className="mb-1 text-base font-semibold">{model.name}</h3>
              <p
                className={`mb-4 text-xs leading-relaxed ${
                  selected === key ? "text-white/70" : "text-stone-500"
                }`}
              >
                {model.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div
                    className={`text-xs ${
                      selected === key ? "text-white/50" : "text-stone-400"
                    }`}
                  >
                    RMSE
                  </div>
                  <div className="font-mono text-sm font-semibold">
                    {model.rmse.toFixed(3)} °C
                  </div>
                </div>
                <div>
                  <div
                    className={`text-xs ${
                      selected === key ? "text-white/50" : "text-stone-400"
                    }`}
                  >
                    Correlation
                  </div>
                  <div className="font-mono text-sm font-semibold">
                    {model.correlation.toFixed(3)}
                  </div>
                </div>
              </div>

              <div
                className={`mt-4 border-t pt-3 text-xs ${
                  selected === key
                    ? "border-white/10 text-white/60"
                    : "border-stone-100 text-stone-400"
                }`}
              >
                {model.inference} inference · {model.bestFor}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
