"use client";

import { Box, Layers, ArrowRight, Database, Satellite, BarChart3 } from "lucide-react";

export function Architecture() {
  return (
    <section
      id="architecture"
      className="border-b border-stone-200/50 bg-stone-50 py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            Architecture
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            How surface satellite observations become subsurface temperature
            predictions.
          </p>
        </div>

        {/* Pipeline */}
        <div className="mb-12 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {/* Input */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Satellite size={16} className="text-stone-500" />
              <h4 className="text-sm font-semibold text-stone-900">
                Surface Inputs
              </h4>
            </div>
            <div className="space-y-2">
              {["SST (OSTIA)", "SSH (AVISO)", "SSS (OISSS)", "Currents (OSCAR)", "Winds (ERA5)"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-md bg-stone-50 px-2.5 py-1.5 text-xs text-stone-600"
                  >
                    <div className="h-1 w-1 rounded-full bg-stone-400" />
                    {item}
                  </div>
                )
              )}
            </div>
            <div className="mt-3 font-mono text-xs text-stone-400">
              7 channels × 64 × 64
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden justify-center md:flex">
            <ArrowRight size={20} className="text-stone-300" />
          </div>

          {/* Model */}
          <div className="rounded-xl border border-stone-900 bg-stone-900 p-5 text-white">
            <div className="mb-3 flex items-center gap-2">
              <Box size={16} className="text-white/70" />
              <h4 className="text-sm font-semibold">ViT Encoder</h4>
            </div>
            <div className="space-y-1.5 font-mono text-xs text-white/70">
              <div>PatchEmbedding (patch=4)</div>
              <div>TransformerEncoder × 4</div>
              <div>4 heads, dim=128</div>
              <div className="border-t border-white/10 pt-1.5">
                MeanPool → Embedding(128)
              </div>
            </div>
            <div className="mt-3 border-t border-white/10 pt-3 text-xs text-white/50">
              943K parameters
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden justify-center md:flex">
            <ArrowRight size={20} className="text-stone-300" />
          </div>

          {/* Output */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-stone-500" />
              <h4 className="text-sm font-semibold text-stone-900">
                Temperature Profile
              </h4>
            </div>
            <div className="space-y-1.5 font-mono text-xs text-stone-600">
              {[
                "2m", "5m", "10m", "20m", "30m", "50m", "75m", "100m",
                "125m", "150m", "200m", "300m", "500m", "700m", "1000m",
              ].map((depth) => (
                <div key={depth} className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-stone-400" />
                  {depth}
                </div>
              ))}
            </div>
            <div className="mt-3 font-mono text-xs text-stone-400">
              15 depth predictions
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900">
            <Layers size={16} className="text-stone-500" />
            Data Sources
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                className="flex items-start gap-3 rounded-lg border border-stone-100 p-3"
              >
                <Database size={14} className="mt-0.5 text-stone-400" />
                <div>
                  <div className="text-xs font-medium text-stone-900">
                    {source.name}
                  </div>
                  <div className="text-xs text-stone-400">{source.type}</div>
                  <div className="mt-0.5 text-xs text-stone-500">
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
