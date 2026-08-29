"use client";

import { Waves, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-warm-200/60 bg-warm-50/80 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl ocean-gradient text-sm font-bold text-white shadow-lg shadow-ocean-500/20">
                OE
              </div>
              <span className="text-lg font-bold text-warm-900">
                OceanEmbed
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-warm-500">
              Satellite embedding-based reconstruction of subsurface ocean
              temperature. A prototype for the MoES / INCOIS Hackathon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-ocean-50 px-4 py-2 text-xs font-medium text-ocean-700">
              <Waves size={14} />
              North Indian Ocean
            </div>
            <div className="flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-xs font-medium text-teal-700">
              15 Depths
            </div>
            <div className="flex items-center gap-2 rounded-full bg-warm-100 px-4 py-2 text-xs font-medium text-warm-600">
              0.25° Resolution
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-warm-200/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-warm-400">
            Built for research and educational purposes.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-warm-400 transition-colors hover:text-ocean-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Source Code
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-xs text-warm-400 transition-colors hover:text-ocean-600"
            >
              <ExternalLink size={14} />
              Documentation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
