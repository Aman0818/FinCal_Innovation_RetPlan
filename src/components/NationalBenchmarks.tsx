"use client";

import { useRetirementStore } from "@/store/useRetirementStore";
import { formatCurrency, formatPct } from "@/lib/format";
import { LuChartBar, LuChevronUp, LuChevronDown, LuMinus } from "react-icons/lu";

/* ── National benchmark data (India-specific, sourced from AMFI / RBI / NPS / public surveys) ── */
const BENCHMARKS = {
  avgSavingsRate: 0.23, // India household savings rate ~23% of GDP (RBI)
  medianRetirementCorpus: 1_20_00_000, // ₹1.2 Cr median target (industry surveys)
  avgMonthlySIP: 4500, // ~₹4,500 avg SIP in India (AMFI data 2024)
  avgRetirementAge: 58, // Most Indian retirees exit at 58-60
  avgLifeExpectancy: 73, // India avg life expectancy ~73 yrs (WHO 2024)
  avgStartAge: 32, // Avg age when Indians start retirement planning
  npsAvgReturn: 0.098, // NPS avg return ~9.8% (10-yr average)
  epfRate: 0.0815, // EPF interest rate 8.15% (2023-24)
  fdRate: 0.07, // Average FD rate ~7% (major banks)
  inflationAvg: 0.057, // India avg inflation ~5.7% (10yr CPI avg)
};

type CompareResult = "better" | "worse" | "similar";

function compare(user: number, benchmark: number, higherIsBetter: boolean): CompareResult {
  const ratio = user / benchmark;
  if (ratio > 1.05) return higherIsBetter ? "better" : "worse";
  if (ratio < 0.95) return higherIsBetter ? "worse" : "better";
  return "similar";
}

function Badge({ result }: { result: CompareResult }) {
  if (result === "better")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-600">
        <LuChevronUp className="w-3 h-3" /> Above Average
      </span>
    );
  if (result === "worse")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-hdfc-red-light text-hdfc-red">
        <LuChevronDown className="w-3 h-3" /> Below Average
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-hdfc-blue-light text-hdfc-blue">
      <LuMinus className="w-3 h-3" /> On Par
    </span>
  );
}

function BarCompare({
  label,
  userVal,
  benchVal,
  userLabel,
  benchLabel,
  higherIsBetter,
}: {
  label: string;
  userVal: number;
  benchVal: number;
  userLabel: string;
  benchLabel: string;
  higherIsBetter: boolean;
}) {
  const maxVal = Math.max(userVal, benchVal) || 1;
  const userPct = (userVal / maxVal) * 100;
  const benchPct = (benchVal / maxVal) * 100;
  const result = compare(userVal, benchVal, higherIsBetter);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">{label}</span>
        <Badge result={result} />
      </div>

      {/* User bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground/70">You</span>
          <span className="font-medium text-foreground">{userLabel}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-hdfc-blue transition-all duration-700"
            style={{ width: `${Math.min(userPct, 100)}%` }}
          />
        </div>
      </div>

      {/* National avg bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground/60">National Average</span>
          <span className="font-medium text-muted-foreground">{benchLabel}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-muted-foreground/40 transition-all duration-700"
            style={{ width: `${Math.min(benchPct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function NationalBenchmarks() {
  const { inputs, result } = useRetirementStore();

  // Compute user's effective savings rate:  SIP * 12 / estimated annual income
  // Estimate income from monthly expenses (expenses ~ 50-60% of income)
  const estimatedAnnualIncome = inputs.monthlyExpenses * 12 / 0.55;
  const userAnnualSIP = result.requiredMonthlySIP * 12;
  const userSavingsRate = userAnnualSIP / estimatedAnnualIncome;

  // Score out of 100
  const scores = [
    compare(result.corpusWithBuffer, BENCHMARKS.medianRetirementCorpus, true) === "better"
      ? 25
      : compare(result.corpusWithBuffer, BENCHMARKS.medianRetirementCorpus, true) === "similar"
      ? 15
      : 5,
    compare(result.requiredMonthlySIP, BENCHMARKS.avgMonthlySIP, true) === "better"
      ? 25
      : compare(result.requiredMonthlySIP, BENCHMARKS.avgMonthlySIP, true) === "similar"
      ? 15
      : 5,
    compare(inputs.currentAge, BENCHMARKS.avgStartAge, false) === "better"
      ? 25
      : compare(inputs.currentAge, BENCHMARKS.avgStartAge, false) === "similar"
      ? 15
      : 5,
    compare(inputs.lifeExpectancy, BENCHMARKS.avgLifeExpectancy, true) === "better"
      ? 25
      : compare(inputs.lifeExpectancy, BENCHMARKS.avgLifeExpectancy, true) === "similar"
      ? 15
      : 5,
  ];
  const totalScore = scores.reduce((a, b) => a + b, 0);

  const getScoreColor = (s: number) => {
    if (s >= 75) return "text-emerald-600";
    if (s >= 50) return "text-hdfc-blue";
    if (s >= 25) return "text-amber-500";
    return "text-hdfc-red";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 75) return "Excellent";
    if (s >= 50) return "Good";
    if (s >= 25) return "Needs Improvement";
    return "At Risk";
  };

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <LuChartBar className="w-5 h-5 text-hdfc-blue" />
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          National Benchmarks
        </h3>
      </div>

      {/* Readiness score */}
      <div className="professional-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Retirement Readiness Score
            </p>
            <p className={`text-3xl font-bold tracking-tight ${getScoreColor(totalScore)}`}>
              {totalScore}/100
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-sm font-semibold px-3 py-1 rounded ${getScoreColor(totalScore)} bg-surface-2`}
            >
              {getScoreLabel(totalScore)}
            </span>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              totalScore >= 75
                ? "bg-emerald-500"
                : totalScore >= 50
                ? "bg-hdfc-blue"
                : totalScore >= 25
                ? "bg-amber-500"
                : "bg-hdfc-red"
            }`}
            style={{ width: `${totalScore}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Based on corpus target, SIP commitment, planning start age, and longevity provision
        </p>
      </div>

      {/* Comparison bars */}
      <div className="professional-card p-5 space-y-6">
        <BarCompare
          label="Target Retirement Corpus"
          userVal={result.corpusWithBuffer}
          benchVal={BENCHMARKS.medianRetirementCorpus}
          userLabel={formatCurrency(result.corpusWithBuffer)}
          benchLabel={formatCurrency(BENCHMARKS.medianRetirementCorpus)}
          higherIsBetter={true}
        />

        <BarCompare
          label="Monthly SIP Commitment"
          userVal={result.requiredMonthlySIP}
          benchVal={BENCHMARKS.avgMonthlySIP}
          userLabel={formatCurrency(result.requiredMonthlySIP)}
          benchLabel={formatCurrency(BENCHMARKS.avgMonthlySIP)}
          higherIsBetter={true}
        />

        <BarCompare
          label="Planning Start Age"
          userVal={inputs.currentAge}
          benchVal={BENCHMARKS.avgStartAge}
          userLabel={`${inputs.currentAge} yrs`}
          benchLabel={`${BENCHMARKS.avgStartAge} yrs`}
          higherIsBetter={false}
        />

        <BarCompare
          label="Retirement Age"
          userVal={inputs.retirementAge}
          benchVal={BENCHMARKS.avgRetirementAge}
          userLabel={`${inputs.retirementAge} yrs`}
          benchLabel={`${BENCHMARKS.avgRetirementAge} yrs`}
          higherIsBetter={true}
        />

        <BarCompare
          label="Effective Savings Rate"
          userVal={userSavingsRate}
          benchVal={BENCHMARKS.avgSavingsRate}
          userLabel={formatPct(userSavingsRate)}
          benchLabel={formatPct(BENCHMARKS.avgSavingsRate)}
          higherIsBetter={true}
        />
      </div>

      {/* Return benchmarks */}
      <div className="professional-card p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          How your assumed returns compare
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Your Pre-Retirement",
              value: formatPct(inputs.preRetirementReturn),
              highlight: true,
            },
            { label: "NPS (10yr avg)", value: formatPct(BENCHMARKS.npsAvgReturn), highlight: false },
            { label: "EPF (2023-24)", value: formatPct(BENCHMARKS.epfRate), highlight: false },
            { label: "Bank FD (avg)", value: formatPct(BENCHMARKS.fdRate), highlight: false },
          ].map((item, i) => (
            <div
              key={i}
              className={`text-center p-3 rounded-lg ${
                item.highlight ? "bg-hdfc-blue/10 border border-hdfc-blue/30" : "bg-surface-2"
              }`}
            >
              <p
                className={`text-lg font-bold ${
                  item.highlight ? "text-hdfc-blue" : "text-foreground"
                }`}
              >
                {item.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/60 mt-3">
          Note: Equity mutual fund SIPs have historically delivered 12-15% CAGR over 15+ year periods.
          Past performance is not indicative of future results.
        </p>
      </div>

      {/* Data source attribution */}
      <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
        Benchmark data sourced from AMFI, RBI, NPS Trust, and public financial surveys (2024).
        National averages are approximate and used for illustrative comparison only.
      </p>
    </div>
  );
}
