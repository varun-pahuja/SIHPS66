"use client";

import { ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-stone-200/50 bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,113,108,0.08),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            MoES / INCOIS Hackathon Prototype
          </div>

          <h1 className="mb-6 text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl lg:text-6xl">
            Reconstructing subsurface ocean temperature from satellite
            observations
          </h1>

          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-stone-500">
            A deep learning framework that predicts temperature profiles at 15
            standard depths (2–1000m) across the North Indian Ocean using only
            surface satellite data. 0.25° daily resolution.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#models"
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-stone-800 active:scale-[0.98]"
            >
              View Results
              <ArrowDown size={14} />
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 active:scale-[0.98]"
            >
              Technical Details
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-stone-200 bg-stone-200 md:grid-cols-4">
          {[
            { label: "Target Region", value: "North Indian Ocean" },
            { label: "Depths", value: "15 (2–1000m)" },
            { label: "Resolution", value: "0.25° Daily" },
            { label: "Best RMSE", value: "0.701 °C" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-stone-400">
                {stat.label}
              </div>
              <div className="mt-1 text-lg font-semibold text-stone-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
