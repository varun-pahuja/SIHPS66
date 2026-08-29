"use client";

import { Box, Layers, ArrowRight, Database, Satellite, BarChart3 } from "lucide-react";

export function Architecture() {
  return (
    <section id="architecture" className="border-b border-warm-200/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-warm-900">
            Architecture
          </h2>
          <p className="mt-3 text-warm-500">
            How surface satellite observations become subsurface temperature
            predictions.
          </p>
        </div>

        {/* Pipeline */}
        <div className="mb-12 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {/* Input */}
          <div className="rounded-2xl border border-warm-200/60 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-400 to-ocean-500 text-white shadow-lg shadow-ocean-500/20">
                <Satellite size={18} />
              </div>
              <h4 className="text-base font-bold text-warm-900">
                Surface Inputs
              </h4>
            </div>
            <div className="space-y-2">
              {[
                { name: "SST", source: "OSTIA", color: "bg-coral-100 text-coral-600" },
                { name: "SSH", source: "AVISO", color: "bg-ocean-100 text-ocean-600" },
                { name: "SSS", source: "OISSS", color: "bg-teal-100 text-teal-600" },
                { name: "Currents", source: "OSCAR", color: "bg-amber-100 text-amber-600" },
                { name: "Winds", source: "ERA5", color: "bg-warm-100 text-warm-600" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl bg-warm-50/80 px-3 py-2"
                >
                  <span className="text-sm font-medium text-warm-700">
                    {item.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.color}`}
                  >
                    {item.source}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 font-mono text-xs text-warm-400">
              7 channels × 64 × 64
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden justify-center md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-warm-400">
              <ArrowRight size={18} />
            </div>
          </div>

          {/* Model */}
          <div className="rounded-2xl border border-ocean-200 bg-gradient-to-br from-ocean-50 to-teal-50 p-6 shadow-lg shadow-ocean-500/10">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl ocean-gradient text-white shadow-lg shadow-ocean-500/20">
                <Box size={18} />
              </div>
              <h4 className="text-base font-bold text-ocean-900">
                ViT Encoder
              </h4>
            </div>
            <div className="space-y-2 font-mono text-sm text-ocean-700">
              <div className="rounded-lg bg-white/60 px-3 py-2">PatchEmbedding (patch=4)</div>
              <div className="rounded-lg bg-white/60 px-3 py-2">TransformerEncoder × 4</div>
              <div className="rounded-lg bg-white/60 px-3 py-2">4 heads, dim=128</div>
              <div className="border-t border-ocean-200 pt-2">
                MeanPool → Embedding(128)
              </div>
            </div>
            <div className="mt-4 border-t border-ocean-200 pt-4 text-xs font-medium text-ocean-600">
              943K parameters
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden justify-center md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-warm-400">
              <ArrowRight size={18} />
            </div>
          </div>

          {/* Output */}
          <div className="rounded-2xl border border-warm-200/60 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-lg shadow-teal-500/20">
                <BarChart3 size={18} />
              </div>
              <h4 className="text-base font-bold text-warm-900">
                Temperature Profile
              </h4>
            </div>
            <div className="space-y-1 font-mono text-sm text-warm-600">
              {[
                "2m", "5m", "10m", "20m", "30m", "50m", "75m", "100m",
                "125m", "150m", "200m", "300m", "500m", "700m", "1000m",
              ].map((depth) => (
                <div key={depth} className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-warm-50">
                  <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-ocean-400 to-teal-400" />
                  {depth}
                </div>
              ))}
            </div>
            <div className="mt-4 font-mono text-xs text-warm-400">
              15 depth predictions
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="rounded-2xl border border-warm-200/60 bg-white p-8 shadow-sm">
          <h3 className="mb-6 flex items-center gap-3 text-lg font-bold text-warm-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-100 text-warm-600">
              <Layers size={16} />
            </div>
            Data Sources
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "GLORYS12V1",
                type: "Training Target",
                desc: "Ocean reanalysis, 0.083° daily",
                color: "from-ocean-400 to-ocean-500",
              },
              {
                name: "OSTIA L4",
                type: "SST",
                desc: "Sea surface temperature, 0.05° daily",
                color: "from-coral-400 to-coral-500",
              },
              {
                name: "AVISO DUACS",
                type: "SSH",
                desc: "Sea surface height, 0.25° daily",
                color: "from-ocean-400 to-ocean-500",
              },
              {
                name: "OISSS L4",
                type: "SSS",
                desc: "Sea surface salinity, 0.25° 8-day",
                color: "from-teal-400 to-teal-500",
              },
              {
                name: "OSCAR",
                type: "Currents",
                desc: "Surface currents, 0.25° monthly",
                color: "from-amber-400 to-amber-500",
              },
              {
                name: "ERA5",
                type: "Winds",
                desc: "Surface winds, 0.25° hourly",
                color: "from-warm-400 to-warm-500",
              },
            ].map((source) => (
              <div
                key={source.name}
                className="group flex items-start gap-4 rounded-xl border border-warm-100 p-4 transition-all hover:border-ocean-200 hover:bg-ocean-50/30 hover:shadow-md"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${source.color} text-white shadow-md`}
                >
                  <Database size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-warm-900">
                    {source.name}
                  </div>
                  <div className="text-xs font-medium text-warm-400">
                    {source.type}
                  </div>
                  <div className="mt-1 text-xs text-warm-500">
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
