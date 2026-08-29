"use client";

import { motion } from "framer-motion";

const DATA_SOURCES = [
  {
    name: "GLORYS12V1",
    type: "Training Target",
    desc: "Ocean reanalysis, 0.083\u00b0 daily",
  },
  {
    name: "OSTIA L4",
    type: "SST",
    desc: "Sea surface temperature, 0.05\u00b0 daily",
  },
  {
    name: "AVISO DUACS",
    type: "SSH",
    desc: "Sea surface height, 0.25\u00b0 daily",
  },
  {
    name: "OISSS L4",
    type: "SSS",
    desc: "Sea surface salinity, 0.25\u00b0 8-day",
  },
  {
    name: "OSCAR",
    type: "Currents",
    desc: "Surface currents, 0.25\u00b0 monthly",
  },
  {
    name: "ERA5",
    type: "Winds",
    desc: "Surface winds, 0.25\u00b0 hourly",
  },
];

const PIPELINE_STEPS = [
  { label: "Surface Inputs", sub: "7 channels", detail: "64 \u00d7 64" },
  { label: "ViT Encoder", sub: "943K params", detail: "4 layers, 4 heads" },
  { label: "Temperature Profile", sub: "15 depths", detail: "2 \u2013 1000m" },
];

export function Architecture() {
  return (
    <section id="architecture" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 max-w-2xl"
        >
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ocean-600">
            System Design
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-sand-900 md:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-base text-sand-500">
            Surface satellite observations are encoded into a latent
            representation, then decoded into a full-depth temperature profile.
          </p>
        </motion.div>

        {/* Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 overflow-hidden rounded-2xl border border-sand-200/60 bg-white/70 p-6 backdrop-blur-sm lg:p-8"
        >
          <div className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-sand-400">
            Inference Pipeline
          </div>

          <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {/* Input */}
            <div className="rounded-2xl border border-sand-200/60 bg-sand-50/50 p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ocean-100 text-ocean-600">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 10L7 3L12 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 3V12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-sand-800">
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
                    className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2"
                  >
                    <span className="text-sm text-sand-600">{item.name}</span>
                    <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[10px] font-medium text-sand-500">
                      {item.source}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 font-mono text-[10px] text-sand-400">
                7 channels \u00d7 64 \u00d7 64
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden items-center justify-center md:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-sand-400">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 5H9M9 5L6 2M9 5L6 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Model */}
            <div className="rounded-2xl border border-ocean-200/60 bg-ocean-50/30 p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ocean-100 text-ocean-600">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5 5H9M5 7H9M5 9H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-sand-800">
                  ViT Encoder
                </h4>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-sand-600">
                <div className="rounded-xl bg-white/60 px-3 py-2">
                  PatchEmbedding (patch=4)
                </div>
                <div className="rounded-xl bg-white/60 px-3 py-2">
                  TransformerEncoder \u00d7 4
                </div>
                <div className="rounded-xl bg-white/60 px-3 py-2">
                  4 heads, dim=128
                </div>
                <div className="border-t border-ocean-100/60 pt-2">
                  MeanPool \u2192 Embedding(128)
                </div>
              </div>
              <div className="mt-4 border-t border-ocean-100/60 pt-3 text-[10px] font-medium text-sand-500">
                943K parameters
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden items-center justify-center md:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-sand-400">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 5H9M9 5L6 2M9 5L6 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Output */}
            <div className="rounded-2xl border border-sand-200/60 bg-sand-50/50 p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ocean-100 text-ocean-600">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 12V6M5 12V3M8 12V5M11 12V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-sand-800">
                  Temperature Profile
                </h4>
              </div>
              <div className="space-y-0.5 font-mono text-[11px] text-sand-600">
                {[
                  "2m", "5m", "10m", "20m", "30m", "50m", "75m", "100m",
                  "125m", "150m", "200m", "300m", "500m", "700m", "1000m",
                ].map((depth) => (
                  <div
                    key={depth}
                    className="flex items-center gap-2 rounded-xl px-3 py-1 transition-colors hover:bg-white/60"
                  >
                    <div className="h-1 w-1 rounded-full bg-ocean-300" />
                    {depth}
                  </div>
                ))}
              </div>
              <div className="mt-4 font-mono text-[10px] text-sand-400">
                15 depth predictions
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-sand-200/60 bg-white/70 p-6 backdrop-blur-sm lg:p-8"
        >
          <h3 className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-sand-400">
            Data Sources
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DATA_SOURCES.map((source) => (
              <div
                key={source.name}
                className="flex items-start gap-3 rounded-xl border border-sand-100/60 bg-sand-50/30 p-3.5 transition-colors hover:bg-sand-50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sand-100 text-sand-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="1.5" y="1.5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-sand-800">
                    {source.name}
                  </div>
                  <div className="text-[10px] font-medium text-ocean-600">
                    {source.type}
                  </div>
                  <div className="mt-0.5 text-xs text-sand-400">
                    {source.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
