"use client";

import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="border-t border-sand-200/60 py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sand-800 text-[8px] font-bold text-sand-50">
                OE
              </div>
              <span className="text-sm font-semibold text-sand-700">
                OceanEmbed
              </span>
            </div>
            <p className="mt-2.5 max-w-xs text-xs leading-relaxed text-sand-400">
              Satellite embedding-based reconstruction of subsurface ocean
              temperature. A prototype for the MoES / INCOIS Hackathon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10px] text-sand-400">
            <span className="rounded-full bg-sand-100 px-2.5 py-1 font-medium">
              North Indian Ocean
            </span>
            <span className="rounded-full bg-sand-100 px-2.5 py-1 font-medium">
              15 Depths
            </span>
            <span className="rounded-full bg-sand-100 px-2.5 py-1 font-medium">
              0.25° Resolution
            </span>
          </div>
        </div>

        <div className="mt-10 border-t border-sand-200/40 pt-6 text-[10px] text-sand-300">
          Built for research and educational purposes.
        </div>
      </div>
    </footer>
  );
}
