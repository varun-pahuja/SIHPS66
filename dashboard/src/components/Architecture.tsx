"use client";

export function Architecture() {
  return (
    <section id="architecture" className="border-b border-slate-200 bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Architecture
          </h2>
          <p className="mt-3 text-base text-slate-500">
            How surface satellite observations become subsurface temperature
            predictions.
          </p>
        </div>

        {/* Pipeline */}
        <div className="mb-8 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {/* Input */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8L8 2L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Surface Inputs
              </h4>
            </div>
            <div className="space-y-1.5">
              {[
                { name: "SST", source: "OSTIA" },
                { name: "SSH", source: "AVISO" },
                { name: "SSS", source: "OISSS" },
                { name: "Currents", source: "OSCAR" },
                { name: "Winds", source: "ERA5" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{item.name}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
                    {item.source}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 font-mono text-xs text-slate-400">
              7 channels × 64 × 64
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden items-center justify-center md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Model */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 6H10M6 8H10M6 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                ViT Encoder
              </h4>
            </div>
            <div className="space-y-1.5 font-mono text-xs text-slate-600">
              <div className="rounded-lg bg-white/60 px-3 py-2">
                PatchEmbedding (patch=4)
              </div>
              <div className="rounded-lg bg-white/60 px-3 py-2">
                TransformerEncoder × 4
              </div>
              <div className="rounded-lg bg-white/60 px-3 py-2">
                4 heads, dim=128
              </div>
              <div className="border-t border-blue-100 pt-2">
                MeanPool → Embedding(128)
              </div>
            </div>
            <div className="mt-4 border-t border-blue-100 pt-3 text-xs font-medium text-slate-500">
              943K parameters
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden items-center justify-center md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Output */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14V8M6 14V4M10 14V6M14 14V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Temperature Profile
              </h4>
            </div>
            <div className="space-y-1 font-mono text-xs text-slate-600">
              {[
                "2m", "5m", "10m", "20m", "30m", "50m", "75m", "100m",
                "125m", "150m", "200m", "300m", "500m", "700m", "1000m",
              ].map((depth) => (
                <div
                  key={depth}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-slate-50"
                >
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  {depth}
                </div>
              ))}
            </div>
            <div className="mt-4 font-mono text-xs text-slate-400">
              15 depth predictions
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-5 text-sm font-semibold text-slate-900">
            Data Sources
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "GLORYS12V1",
                type: "Training Target",
                desc: "Ocean reanalysis, 0.083° daily",
              },
              {
                name: "OSTIA L4",
                type: "SST",
                desc: "Sea surface temperature, 0.05° daily",
              },
              {
                name: "AVISO DUACS",
                type: "SSH",
                desc: "Sea surface height, 0.25° daily",
              },
              {
                name: "OISSS L4",
                type: "SSS",
                desc: "Sea surface salinity, 0.25° 8-day",
              },
              {
                name: "OSCAR",
                type: "Currents",
                desc: "Surface currents, 0.25° monthly",
              },
              {
                name: "ERA5",
                type: "Winds",
                desc: "Surface winds, 0.25° hourly",
              },
            ].map((source) => (
              <div
                key={source.name}
                className="flex items-start gap-3 rounded-lg border border-slate-100 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">
                    {source.name}
                  </div>
                  <div className="text-xs text-slate-400">{source.type}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {source.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
