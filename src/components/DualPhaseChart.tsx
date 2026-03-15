"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useRetirementStore } from "@/store/useRetirementStore";
import { formatCurrency, formatShort } from "@/lib/format";

interface ChartDataPoint {
  age: number;
  corpus: number;
  phase: string;
  accumulation: number | null;
  retirement: number | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;

  const d = payload[0].payload;
  return (
    <div className="surface-raised px-4 py-3 text-[13px] space-y-1 border border-border/40">
      <p className="font-bold text-foreground">Age {d.age}</p>
      <p className="tabular-nums">
        <span className="text-muted-foreground">Corpus: </span>
        <span className="font-semibold text-foreground">
          {formatCurrency(d.corpus)}
        </span>
      </p>
      <span
        className={`badge ${
          d.phase === "accumulation" ? "badge-blue" : "badge-red"
        }`}
      >
        {d.phase === "accumulation" ? "Working" : "Retired"}
      </span>
    </div>
  );
}

export default function DualPhaseChart() {
  const { inputs, result } = useRetirementStore();

  const data: ChartDataPoint[] = result.yearlyBreakdown.map((yr) => ({
    age: yr.age,
    corpus: yr.corpusEnd,
    phase: yr.phase,
    accumulation: yr.phase === "accumulation" ? yr.corpusEnd : null,
    retirement: yr.phase === "retirement" ? yr.corpusEnd : null,
  }));

  const retireIdx = data.findIndex((d) => d.phase === "retirement");
  if (retireIdx > 0) {
    data[retireIdx].accumulation = data[retireIdx - 1]?.corpus ?? null;
  }

  const peakCorpus = Math.max(...data.map((d) => d.corpus));

  const chartAriaLabel = `Dual phase retirement chart. During accumulation from age ${inputs.currentAge} to ${inputs.retirementAge}, corpus grows to an estimated ${formatCurrency(peakCorpus)}. During retirement, corpus gradually depletes.`;

  return (
    <div className="w-full" role="img" aria-label={chartAriaLabel}>
      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-hdfc-blue" />
          <span className="text-[12px] text-muted-foreground font-medium">
            Accumulation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-hdfc-red" />
          <span className="text-[12px] text-muted-foreground font-medium">
            Retirement
          </span>
        </div>
        <span className="text-[12px] text-muted-foreground/70 ml-auto tabular-nums font-medium">
          Peak: {formatCurrency(peakCorpus)}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#224c87" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#224c87" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#da3832" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#da3832" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="age"
            tick={{ fontSize: 12, fill: "#878787" }}
            tickLine={false}
            axisLine={{ stroke: "#e0e0e0" }}
          />

          <YAxis
            tickFormatter={(v: number) => formatShort(v)}
            tick={{ fontSize: 12, fill: "#878787" }}
            tickLine={false}
            axisLine={false}
            width={60}
          />

          <Tooltip content={<CustomTooltip />} />

          <ReferenceLine
            x={inputs.retirementAge}
            stroke="#224c87"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{
              value: `Retire ${inputs.retirementAge}`,
              position: "top",
              style: { fontSize: 10, fill: "#224c87", fontWeight: 600 },
            }}
          />

          <Area
            type="monotone"
            dataKey="accumulation"
            stroke="#224c87"
            strokeWidth={2}
            fill="url(#blueGrad)"
            connectNulls={false}
            dot={false}
            activeDot={{
              r: 4,
              fill: "#224c87",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />

          <Area
            type="monotone"
            dataKey="retirement"
            stroke="#da3832"
            strokeWidth={2}
            fill="url(#redGrad)"
            connectNulls={false}
            dot={false}
            activeDot={{
              r: 4,
              fill: "#da3832",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-[10px] text-muted-foreground/50 text-center mt-4">
        Illustrative projection. Actual values may vary. Subject to market risks.
      </p>
    </div>
  );
}
