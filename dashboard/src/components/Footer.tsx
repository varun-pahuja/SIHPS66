"use client";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-semibold text-white">
                OE
              </div>
              <span className="text-sm font-semibold text-slate-900">
                OceanEmbed
              </span>
            </div>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-400">
              Satellite embedding-based reconstruction of subsurface ocean
              temperature. A prototype for the MoES / INCOIS Hackathon.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>North Indian Ocean</span>
            <span className="text-slate-200">|</span>
            <span>15 Depths</span>
            <span className="text-slate-200">|</span>
            <span>0.25° Resolution</span>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-300">
          Built for research and educational purposes.
        </div>
      </div>
    </footer>
  );
}
