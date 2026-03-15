"use client";

import { useState } from "react";
import { useRetirementStore } from "@/store/useRetirementStore";
import {
  calculateRetirement,
  type RetirementInputs,
} from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import type { IconType } from "react-icons";
import {
  LuClock,
  LuChartBar,
  LuPause,
  LuRocket,
  LuPiggyBank,
  LuShield,
} from "react-icons/lu";

interface WhatIfOption {
  id: string;
  icon: IconType;
  label: string;
  description: string;
  modify: (inputs: RetirementInputs) => RetirementInputs;
}

const WHAT_IF_OPTIONS: WhatIfOption[] = [
  {
    id: "retire-later",
    icon: LuClock,
    label: "Retire 3 yrs later",
    description: "What if you worked until age {retirementAge + 3}?",
    modify: (i) => ({ ...i, retirementAge: i.retirementAge + 3 }),
  },
  {
    id: "higher-inflation",
    icon: LuChartBar,
    label: "Inflation +2%",
    description: "What if general inflation turns out to be {inflation}%?",
    modify: (i) => ({ ...i, generalInflation: i.generalInflation + 0.02 }),
  },
  {
    id: "no-stepup",
    icon: LuPause,
    label: "No SIP step-up",
    description: "What if your SIP stays flat without annual increases?",
    modify: (i) => ({ ...i, annualStepUp: 0 }),
  },
  {
    id: "higher-stepup",
    icon: LuRocket,
    label: "15% step-up",
    description: "What if you increase SIP by 15% each year?",
    modify: (i) => ({ ...i, annualStepUp: 0.15 }),
  },
  {
    id: "more-savings",
    icon: LuPiggyBank,
    label: "₹10L savings",
    description: "What if you already had ₹10 Lakh saved?",
    modify: (i) => ({ ...i, existingSavings: 10_00_000 }),
  },
  {
    id: "lower-returns",
    icon: LuShield,
    label: "Conservative",
    description: "What if pre-retirement returns are only 10%?",
    modify: (i) => ({
      ...i,
      preRetirementReturn: 0.1,
      postRetirementReturn: 0.06,
    }),
  },
];

export default function ScenarioComparison() {
  const { inputs, result } = useRetirementStore();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const selectedWhatIf = WHAT_IF_OPTIONS.find((o) => o.id === activeScenario);
  const altInputs = selectedWhatIf ? selectedWhatIf.modify(inputs) : null;
  const altResult = altInputs ? calculateRetirement(altInputs) : null;

  return (
    <section className="w-full space-y-6" aria-label="What-if scenario comparison">
      {/* Header */}
      <div>
        <h3 className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">
          Scenario Analysis
        </h3>
        <p className="text-[12px] text-muted-foreground mt-1">
          Select a scenario to compare against your current projection.
        </p>
      </div>

      {/* Scenario grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {WHAT_IF_OPTIONS.map((option) => {
          const isActive = activeScenario === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() =>
                setActiveScenario(isActive ? null : option.id)
              }
              className={`surface-interactive px-5 py-4 text-left flex items-center gap-3.5 ${
                isActive
                  ? "!border-hdfc-blue !bg-hdfc-blue-light"
                  : ""
              }`}
              aria-pressed={isActive}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? "bg-hdfc-blue text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p
                className={`text-[13px] font-semibold leading-tight ${
                  isActive ? "text-hdfc-blue" : "text-foreground"
                }`}
              >
                {option.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Comparison table */}
      {altResult && selectedWhatIf && (
        <div className="surface p-6 space-y-5" aria-live="polite">
          <p className="text-[13px] text-muted-foreground text-center">
            {selectedWhatIf.description
              .replace(
                "{retirementAge + 3}",
                String(inputs.retirementAge + 3)
              )
              .replace(
                "{inflation}",
                String(
                  ((inputs.generalInflation + 0.02) * 100).toFixed(1)
                )
              )}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-[15px]" role="table">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-hdfc-blue uppercase tracking-wider">
                    Your Plan
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-hdfc-red uppercase tracking-wider">
                    {selectedWhatIf.label}
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Delta
                  </th>
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="Corpus needed"
                  base={result.corpusWithBuffer}
                  alt={altResult.corpusWithBuffer}
                />
                <CompareRow
                  label="Monthly SIP"
                  base={result.requiredMonthlySIP}
                  alt={altResult.requiredMonthlySIP}
                />
                <CompareRow
                  label="Expense at retirement"
                  base={result.monthlyExpenseAtRetirement}
                  alt={altResult.monthlyExpenseAtRetirement}
                />
                <tr className="border-t border-border/40">
                  <td className="px-5 py-3 text-muted-foreground">
                    Working yrs
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">
                    {result.yearsToRetirement}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">
                    {altResult.yearsToRetirement}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">
                    {altResult.yearsToRetirement -
                      result.yearsToRetirement >
                    0
                      ? "+"
                      : ""}
                    {altResult.yearsToRetirement -
                      result.yearsToRetirement}{" "}
                    yrs
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-muted-foreground/40 text-center">
            Comparison is illustrative. Subject to market risks.
          </p>
        </div>
      )}
    </section>
  );
}

function CompareRow({
  label,
  base,
  alt,
}: {
  label: string;
  base: number;
  alt: number;
}) {
  const diff = alt - base;
  const pctDiff = base > 0 ? (diff / base) * 100 : 0;
  const isUp = diff > 0;

  return (
    <tr className="border-t border-border/40">
      <td className="px-5 py-3 text-muted-foreground">{label}</td>
      <td className="px-5 py-3 text-right font-semibold tabular-nums">
        {formatCurrency(base)}
      </td>
      <td className="px-5 py-3 text-right font-semibold tabular-nums">
        {formatCurrency(alt)}
      </td>
      <td
        className={`px-5 py-3 text-right font-bold tabular-nums ${
          isUp ? "text-hdfc-red" : "text-hdfc-green"
        }`}
      >
        {isUp ? "+" : ""}
        {pctDiff.toFixed(1)}%
      </td>
    </tr>
  );
}
