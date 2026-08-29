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

interface ModelCardsProps {
  models: Record<string, ModelInfo>;
  selected: string;
  onSelect: (key: string) => void;
}

export function ModelCards({ models, selected, onSelect }: ModelCardsProps) {
  const modelEntries = Object.entries(models);

  return (
    <section id="models" className="border-b border-slate-200 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Model Comparison
          </h2>
          <p className="mt-3 text-base text-slate-500">
            Five architectures evaluated on the same 2023 North Indian Ocean
            dataset.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modelEntries.map(([key, model]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`group relative w-full rounded-xl border p-5 text-left transition-all duration-200 ${
                selected === key
                  ? "border-blue-200 bg-blue-50/50 ring-1 ring-blue-200"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    selected === key
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  {getModelIcon(key)}
                </div>
                <span className="font-mono text-xs text-slate-400">
                  {model.params}
                </span>
              </div>

              <h3 className="mb-1 text-base font-semibold text-slate-900">
                {model.name}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-500">
                {model.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-400">RMSE</div>
                  <div className="font-mono text-sm font-medium text-slate-700">
                    {model.rmse.toFixed(3)}
                    <span className="text-slate-400"> °C</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Correlation</div>
                  <div className="font-mono text-sm font-medium text-slate-700">
                    {model.correlation.toFixed(3)}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                {model.inference} inference · {model.bestFor}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function getModelIcon(key: string) {
  const icons: Record<string, React.ReactNode> = {
    linear: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 14L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    cnn: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    autoencoder: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 8L8 2L14 8L8 14L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    vit: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 2V5M8 11V14M2 8H5M11 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    shallow: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };
  return icons[key] || icons.linear;
}
