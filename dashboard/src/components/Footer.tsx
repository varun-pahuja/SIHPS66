"use client";

export function Footer() {
  return (
    <footer className="border-t border-stone-200/50 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-xs font-semibold text-white">
                OE
              </div>
              <span className="text-sm font-semibold text-stone-900">
                OceanEmbed
              </span>
            </div>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-stone-400">
              Satellite embedding-based reconstruction of subsurface ocean
              temperature. A prototype for the MoES / INCOIS Hackathon.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-400">
            <span>North Indian Ocean</span>
            <span>·</span>
            <span>15 Depths</span>
            <span>·</span>
            <span>0.25° Resolution</span>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-100 pt-6 text-xs text-stone-300">
          Built for research and educational purposes.
        </div>
      </div>
    </footer>
  );
}
