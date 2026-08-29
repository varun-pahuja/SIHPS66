"use client";

import { motion } from "framer-motion";

const STATS = [
  { label: "Region", value: "North Indian Ocean" },
  { label: "Depths", value: "15 (2 \u2013 1000m)" },
  { label: "Resolution", value: "0.25\u00b0 Daily" },
  { label: "Best RMSE", value: "0.511 \u00b0C" },
];

const DEPTH_BARS = [
  { depth: "2m", temp: "25.8\u00b0", width: 88 },
  { depth: "10m", temp: "25.6\u00b0", width: 85 },
  { depth: "30m", temp: "24.9\u00b0", width: 78 },
  { depth: "75m", temp: "20.1\u00b0", width: 68 },
  { depth: "150m", temp: "16.3\u00b0", width: 55 },
  { depth: "300m", temp: "11.2\u00b0", width: 42 },
  { depth: "500m", temp: "8.4\u00b0", width: 35 },
  { depth: "1000m", temp: "4.1\u00b0", width: 28 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-ocean-100/30 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-deep-100/20 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Main grid */}
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sand-200 bg-sand-100/60 px-3.5 py-1.5 text-xs font-medium tracking-wide text-sand-600">
                <span className="h-1.5 w-1.5 rounded-full bg-ocean-500" />
                MoES / INCOIS Hackathon
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl font-semibold tracking-tight text-sand-900 sm:text-4xl md:text-5xl lg:text-[3.2rem] lg:leading-[1.1]"
            >
              Reconstructing subsurface ocean temperature from satellite
              observations
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-lg text-base leading-relaxed text-sand-500 sm:text-lg"
            >
              A deep learning framework that predicts temperature profiles at 15
              depths across the North Indian Ocean using only surface satellite
              data.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="#models"
                className="group inline-flex items-center gap-2.5 rounded-full bg-sand-800 px-6 py-2.5 text-sm font-medium text-sand-50 transition-all duration-200 hover:bg-sand-700 active:scale-[0.98]"
              >
                View Results
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="transition-transform duration-200 group-hover:translate-y-0.5"
                >
                  <path
                    d="M6 2V10M6 10L2 6M6 10L10 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a
                href="#architecture"
                className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white/60 px-5 py-2.5 text-sm font-medium text-sand-600 backdrop-blur-sm transition-all duration-200 hover:border-sand-300 hover:bg-white active:scale-[0.98]"
              >
                Architecture
              </a>
            </motion.div>
          </div>

          {/* Right: Depth visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-2 lg:mt-4"
          >
            <div className="relative overflow-hidden rounded-2xl border border-sand-200/60 bg-gradient-to-br from-ocean-50 via-deep-50 to-sand-100 p-5 sm:p-6 lg:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-ocean-100),_transparent_60%)] opacity-50" />

              <div className="relative">
                <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ocean-600">
                  Depth Profile Preview
                </div>

                {/* Depth bars */}
                <div className="space-y-2">
                  {DEPTH_BARS.map((item, i) => (
                    <motion.div
                      key={item.depth}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.5 + i * 0.08,
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-center gap-2 sm:gap-3"
                    >
                      <div className="w-12 shrink-0 text-right font-mono text-[10px] text-ocean-500/70 sm:w-14 sm:text-[11px]">
                        {item.depth}
                      </div>
                      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/60 sm:h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.width}%` }}
                          transition={{
                            delay: 0.7 + i * 0.08,
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ocean-400 to-ocean-500"
                        />
                      </div>
                      <div className="w-9 shrink-0 text-right font-mono text-[10px] font-medium text-sand-700 sm:w-10 sm:text-[11px]">
                        {item.temp}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-4 border-t border-ocean-200/40 pt-4">
                  <div className="text-[10px] font-medium text-sand-500">
                    Simulated temperature at depth
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-ocean-400" />
                    <span className="text-[10px] font-medium text-sand-500">
                      r = 0.94
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-sand-200/60 bg-sand-200/40 sm:mt-16 md:grid-cols-4"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-sand-50/80 p-4 backdrop-blur-sm sm:p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">
                {stat.label}
              </div>
              <div className="mt-1.5 font-mono text-base font-semibold text-sand-800 sm:text-lg">
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
