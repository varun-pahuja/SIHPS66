"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
} from "recharts";

interface DepthDataPoint {
  depth: number;
  rmse: number;
  corr: number;
}

interface DepthProfileProps {
  data: DepthDataPoint[];
}

const ZONES = [
  {
    zone: "Surface",
    range: "0 - 50m",
    avgRmse: "0.644",
    avgCorr: "0.946",
    note: "Strong satellite signal",
    color: "bg-ocean-50 text-ocean-700 border-ocean-200/50",
  },
  {
    zone: "Thermocline",
    range: "75 - 200m",
    avgRmse: "1.178",
    avgCorr: "0.863",
    note: "Rapid temperature change",
    color: "bg-deep-50 text-deep-700 border-deep-200/50",
  },
  {
    zone: "Deep",
    range: "300 - 1000m",
    avgRmse: "2.489",
    avgCorr: "0.641",
    note: "Weak surface coupling",
    color: "bg-sand-100 text-sand-700 border-sand-200/50",
  },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-sand-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sand-400">
        Depth: {label}m
      </div>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-sand-500">{entry.name}:</span>
          <span className="font-mono font-medium text-sand-800">
            {entry.name === "RMSE"
              ? `${entry.value.toFixed(3)} °C`
              : entry.value.toFixed(3)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DepthProfile({ data }: DepthProfileProps) {
  return (
    <section id="depth" className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 max-w-2xl sm:mb-14"
        >
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ocean-600">
            Depth Analysis
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-sand-900 sm:text-3xl md:text-4xl">
            Performance across the water column
          </h2>
          <p className="mt-3 text-sm text-sand-500 sm:text-base">
            Best model (Linear) evaluated at 15 standard ocean depths. RMSE
            increases with depth as surface signal weakens.
          </p>
        </motion.div>

        {/* Interactive Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 overflow-hidden rounded-2xl border border-sand-200/60 bg-white/70 p-4 backdrop-blur-sm sm:p-6 lg:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-sand-700">
              Depth-wise RMSE and Correlation
            </h3>
            <div className="flex items-center gap-4 text-[10px] text-sand-400">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-4 rounded-full bg-ocean-400" />
                RMSE
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 rounded-full bg-sand-800" />
                Correlation
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="rmseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4da2a0" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4da2a0" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eae8e3" vertical={false} />
              <XAxis
                dataKey="depth"
                tick={{ fontSize: 11, fontFamily: "Geist Mono", fill: "#8a8478" }}
                axisLine={{ stroke: "#eae8e3" }}
                tickLine={false}
                label={{
                  value: "Depth (m)",
                  position: "insideBottom",
                  offset: -5,
                  style: { fontSize: 10, fill: "#b0aba0" },
                }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fontFamily: "Geist Mono", fill: "#8a8478" }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "RMSE (°C)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { fontSize: 10, fill: "#b0aba0" },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 1]}
                tick={{ fontSize: 11, fontFamily: "Geist Mono", fill: "#8a8478" }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Correlation",
                  angle: 90,
                  position: "insideRight",
                  offset: 10,
                  style: { fontSize: 10, fill: "#b0aba0" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId="left"
                dataKey="rmse"
                name="RMSE"
                fill="url(#rmseGradient)"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="corr"
                name="Correlation"
                stroke="#2d2a22"
                strokeWidth={2}
                dot={{ r: 3, fill: "#2d2a22", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#2d2a22", strokeWidth: 2, stroke: "#fff" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Zone Analysis Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {ZONES.map((zone, i) => (
            <motion.div
              key={zone.zone}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`rounded-2xl border p-5 ${zone.color}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold">{zone.zone}</h4>
                <span className="font-mono text-xs opacity-60">{zone.range}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/60 px-3 py-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wider opacity-50">
                    Avg RMSE
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-semibold">
                    {zone.avgRmse} °C
                  </div>
                </div>
                <div className="rounded-xl bg-white/60 px-3 py-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wider opacity-50">
                    Avg Corr
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-semibold">
                    {zone.avgCorr}
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-current/10 pt-3 text-xs opacity-50">
                {zone.note}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
