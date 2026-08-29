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
    <section id="depth" className="border-b border-slate-200 bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Depth-wise Performance
          </h2>
          <p className="mt-3 text-base text-slate-500">
            Best model (Linear) performance across 15 standard ocean depths.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* RMSE Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-5 text-sm font-medium text-slate-700">
              RMSE by Depth (°C)
            </h3>
            <div className="space-y-2.5">
              {data.map((d) => (
                <div key={d.depth} className="flex items-center gap-3">
                  <div className="w-12 text-right font-mono text-xs text-slate-400">
                    {d.depth}m
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all duration-500"
                        style={{
                          width: `${(d.rmse / maxRmse) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right font-mono text-xs font-medium text-slate-600">
                    {d.rmse.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correlation Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-5 text-sm font-medium text-slate-700">
              Correlation by Depth
            </h3>
            <div className="space-y-2.5">
              {data.map((d) => (
                <div key={d.depth} className="flex items-center gap-3">
                  <div className="w-12 text-right font-mono text-xs text-slate-400">
                    {d.depth}m
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{
                          width: `${((d.corr - minCorr) / (1 - minCorr)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right font-mono text-xs font-medium text-slate-600">
                    {d.corr.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone Analysis */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              zone: "Surface",
              range: "0–50m",
              avgRmse: "0.644",
              avgCorr: "0.946",
              note: "Strong satellite signal",
            },
            {
              zone: "Thermocline",
              range: "75–200m",
              avgRmse: "1.178",
              avgCorr: "0.863",
              note: "Rapid temperature change",
            },
            {
              zone: "Deep",
              range: "300–1000m",
              avgRmse: "2.489",
              avgCorr: "0.641",
              note: "Weak surface coupling",
            },
          ].map((zone) => (
            <div
              key={zone.zone}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  {zone.zone}
                </h4>
                <span className="font-mono text-xs text-slate-400">
                  {zone.range}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">Avg RMSE</div>
                  <div className="font-mono text-sm font-semibold text-slate-700">
                    {zone.avgRmse} °C
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">Avg Corr</div>
                  <div className="font-mono text-sm font-semibold text-slate-700">
                    {zone.avgCorr}
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                {zone.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
