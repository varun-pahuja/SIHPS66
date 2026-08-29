"use client";

interface DepthDataPoint {
  depth: number;
  rmse: number;
  corr: number;
}

interface DepthProfileProps {
  data: DepthDataPoint[];
}

export function DepthProfile({ data }: DepthProfileProps) {
  const maxRmse = Math.max(...data.map((d) => d.rmse));
  const minCorr = Math.min(...data.map((d) => d.corr));

  return (
    <section id="depth-analysis" className="border-b border-warm-200/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-warm-900">
            Depth-wise Performance
          </h2>
          <p className="mt-3 text-warm-500">
            Best model (Linear) performance across 15 standard ocean depths.
            Performance degrades with depth as surface signals weaken.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* RMSE Chart */}
          <div className="rounded-2xl border border-warm-200/60 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-sm font-semibold text-warm-700">
              RMSE by Depth (°C)
            </h3>
            <div className="space-y-3">
              {data.map((d) => (
                <div key={d.depth} className="flex items-center gap-4">
                  <div className="w-16 text-right font-mono text-xs text-warm-400">
                    {d.depth}m
                  </div>
                  <div className="flex-1">
                    <div className="h-3 overflow-hidden rounded-full bg-warm-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-coral-400 to-coral-500 transition-all duration-700 ease-out"
                        style={{
                          width: `${(d.rmse / maxRmse) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-14 text-right font-mono text-sm font-semibold text-warm-700">
                    {d.rmse.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correlation Chart */}
          <div className="rounded-2xl border border-warm-200/60 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-sm font-semibold text-warm-700">
              Correlation by Depth
            </h3>
            <div className="space-y-3">
              {data.map((d) => (
                <div key={d.depth} className="flex items-center gap-4">
                  <div className="w-16 text-right font-mono text-xs text-warm-400">
                    {d.depth}m
                  </div>
                  <div className="flex-1">
                    <div className="h-3 overflow-hidden rounded-full bg-warm-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-700 ease-out"
                        style={{
                          width: `${((d.corr - minCorr) / (1 - minCorr)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-14 text-right font-mono text-sm font-semibold text-warm-700">
                    {d.corr.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone Analysis */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              zone: "Surface",
              range: "0–50m",
              avgRmse: "0.644",
              avgCorr: "0.946",
              note: "Strong satellite signal",
              color: "from-teal-400 to-teal-500",
              bgColor: "bg-teal-50",
            },
            {
              zone: "Thermocline",
              range: "75–200m",
              avgRmse: "1.178",
              avgCorr: "0.863",
              note: "Rapid temperature change",
              color: "from-ocean-400 to-ocean-500",
              bgColor: "bg-ocean-50",
            },
            {
              zone: "Deep",
              range: "300–1000m",
              avgRmse: "2.489",
              avgCorr: "0.641",
              note: "Weak surface coupling",
              color: "from-coral-400 to-coral-500",
              bgColor: "bg-coral-50",
            },
          ].map((zone) => (
            <div
              key={zone.zone}
              className="rounded-2xl border border-warm-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${zone.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    <span className="text-sm font-bold">
                      {zone.zone[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-warm-900">
                      {zone.zone}
                    </h4>
                    <span className="font-mono text-xs text-warm-400">
                      {zone.range}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-xl ${zone.bgColor} p-3`}>
                  <div className="text-xs font-medium text-warm-400">
                    Avg RMSE
                  </div>
                  <div className="font-mono text-lg font-bold text-warm-900">
                    {zone.avgRmse} °C
                  </div>
                </div>
                <div className={`rounded-xl ${zone.bgColor} p-3`}>
                  <div className="text-xs font-medium text-warm-400">
                    Avg Corr
                  </div>
                  <div className="font-mono text-lg font-bold text-warm-900">
                    {zone.avgCorr}
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-warm-100 pt-4 text-xs font-medium text-warm-500">
                {zone.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
