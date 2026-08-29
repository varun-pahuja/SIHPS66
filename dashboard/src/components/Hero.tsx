"use client";

export function Hero() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            MoES / INCOIS Hackathon
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Reconstructing subsurface ocean temperature from satellite
            observations
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-slate-500">
            A deep learning framework that predicts temperature profiles at 15
            depths across the North Indian Ocean using only surface satellite
            data. 0.25° daily resolution.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <a
              href="#models"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              View Results
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M7 3V11M7 11L3 7M7 11L11 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              Architecture
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 md:grid-cols-4">
          {[
            { label: "Region", value: "North Indian Ocean" },
            { label: "Depths", value: "15 (2–1000m)" },
            { label: "Resolution", value: "0.25° Daily" },
            { label: "Best RMSE", value: "0.701 °C" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {stat.label}
              </div>
              <div className="mt-1.5 text-lg font-semibold text-slate-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
