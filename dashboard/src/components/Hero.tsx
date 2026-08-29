"use client";

import { ArrowDown, Waves, Thermometer, Globe, BarChart3 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-warm-200/60">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-ocean-50/80 via-warm-50 to-teal-50/60" />

      {/* Decorative elements */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-ocean-200/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 px-4 py-1.5 text-xs font-medium text-ocean-700">
            <span className="flex h-2 w-2 items-center justify-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-teal-500 opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-teal-500" />
            </span>
            MoES / INCOIS Hackathon Prototype
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-warm-900 md:text-5xl lg:text-6xl">
            Reconstructing{" "}
            <span className="gradient-text">subsurface ocean temperature</span>{" "}
            from satellite observations
          </h1>

          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-warm-600">
            A deep learning framework that predicts temperature profiles at 15
            standard depths (2–1000m) across the North Indian Ocean using only
            surface satellite data. 0.25° daily resolution.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#models"
              className="inline-flex items-center gap-2 rounded-xl ocean-gradient px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-ocean-500/25 transition-all hover:shadow-xl hover:shadow-ocean-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              View Results
              <ArrowDown size={16} />
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 rounded-xl border border-warm-200 bg-white px-6 py-3 text-sm font-semibold text-warm-700 transition-all hover:border-ocean-300 hover:bg-ocean-50 hover:text-ocean-700 hover:-translate-y-0.5 active:translate-y-0"
            >
              Technical Details
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              icon: <Globe className="text-ocean-500" size={20} />,
              label: "Target Region",
              value: "North Indian Ocean",
            },
            {
              icon: <Waves className="text-teal-500" size={20} />,
              label: "Depths",
              value: "15 (2–1000m)",
            },
            {
              icon: <BarChart3 className="text-coral-500" size={20} />,
              label: "Resolution",
              value: "0.25° Daily",
            },
            {
              icon: <Thermometer className="text-amber-500" size={20} />,
              label: "Best RMSE",
              value: "0.701 °C",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-warm-200/60 bg-white/80 p-5 backdrop-blur-sm transition-all hover:border-ocean-200 hover:bg-white hover:shadow-lg hover:shadow-ocean-500/5"
            >
              <div className="mb-3 flex items-center gap-2">
                {stat.icon}
                <div className="text-xs font-semibold uppercase tracking-wider text-warm-400">
                  {stat.label}
                </div>
              </div>
              <div className="text-xl font-bold text-warm-900">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
