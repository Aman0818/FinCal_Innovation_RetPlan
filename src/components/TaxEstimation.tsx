"use client";

import { useState } from "react";
import { useRetirementStore } from "@/store/useRetirementStore";
import { formatCurrency } from "@/lib/format";
import { LuInfo } from "react-icons/lu";

/* ────────────────────────────────────────────
   Tax Estimation — Old vs New Regime
   Section 80C deduction on SIP investments
   Illustrative only, not tax advice
   ──────────────────────────────────────────── */

// FY 2024-25 Old Regime slabs
const OLD_SLABS = [
  { upto: 2_50_000, rate: 0 },
  { upto: 5_00_000, rate: 0.05 },
  { upto: 10_00_000, rate: 0.20 },
  { upto: Infinity, rate: 0.30 },
];

// FY 2024-25 New Regime slabs (Budget 2024)
const NEW_SLABS = [
  { upto: 3_00_000, rate: 0 },
  { upto: 7_00_000, rate: 0.05 },
  { upto: 10_00_000, rate: 0.10 },
  { upto: 12_00_000, rate: 0.15 },
  { upto: 15_00_000, rate: 0.20 },
  { upto: Infinity, rate: 0.30 },
];

function calcTax(income: number, slabs: typeof OLD_SLABS): number {
  let tax = 0;
  let prev = 0;
  for (const slab of slabs) {
    if (income <= prev) break;
    const taxable = Math.min(income, slab.upto) - prev;
    tax += taxable * slab.rate;
    prev = slab.upto;
  }
  // Add 4% health & education cess
  return tax * 1.04;
}

interface TaxBreakdown {
  regime: string;
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  tax: number;
  effectiveRate: number;
}

function computeTaxComparison(
  annualIncome: number,
  annualSIP: number,
  otherDeductions: number
): { old: TaxBreakdown; new: TaxBreakdown; savings: number } {
  // Old regime: 80C deduction (max 1.5L) + standard deduction 50k
  const sec80c = Math.min(annualSIP + otherDeductions, 1_50_000);
  const oldStdDeduction = 50_000;
  const oldDeductions = sec80c + oldStdDeduction;
  const oldTaxable = Math.max(0, annualIncome - oldDeductions);
  const oldTax = calcTax(oldTaxable, OLD_SLABS);

  // New regime: standard deduction 75k only, no 80C
  const newStdDeduction = 75_000;
  const newDeductions = newStdDeduction;
  const newTaxable = Math.max(0, annualIncome - newDeductions);
  let newTax = calcTax(newTaxable, NEW_SLABS);
  // Section 87A rebate for new regime (income up to 7L)
  if (newTaxable <= 7_00_000) newTax = 0;

  return {
    old: {
      regime: "Old Regime",
      grossIncome: annualIncome,
      deductions: oldDeductions,
      taxableIncome: oldTaxable,
      tax: oldTax,
      effectiveRate: annualIncome > 0 ? oldTax / annualIncome : 0,
    },
    new: {
      regime: "New Regime",
      grossIncome: annualIncome,
      deductions: newDeductions,
      taxableIncome: newTaxable,
      tax: newTax,
      effectiveRate: annualIncome > 0 ? newTax / annualIncome : 0,
    },
    savings: Math.abs(oldTax - newTax),
  };
}

const INCOME_PRESETS = [
  { label: "₹5L", value: 5_00_000 },
  { label: "₹8L", value: 8_00_000 },
  { label: "₹10L", value: 10_00_000 },
  { label: "₹15L", value: 15_00_000 },
  { label: "₹20L", value: 20_00_000 },
  { label: "₹25L", value: 25_00_000 },
];

export default function TaxEstimation() {
  const { result } = useRetirementStore();
  const [annualIncome, setAnnualIncome] = useState(10_00_000);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const annualSIP = result.requiredMonthlySIP * 12;
  const comparison = computeTaxComparison(annualIncome, annualSIP, otherDeductions);
  const betterRegime = comparison.old.tax <= comparison.new.tax ? "old" : "new";

  return (
    <section className="w-full space-y-5" aria-label="Tax impact estimation">
      <div>
        <h3 className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">
          Tax Impact Estimation
        </h3>
        <p className="text-[12px] text-muted-foreground mt-1">
          Compare old vs new tax regime to understand your SIP&apos;s Section 80C benefit.
        </p>
      </div>

      {/* Income selector */}
      <div className="surface p-5 space-y-4">
        <div>
          <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Annual Gross Income
          </label>
          <div className="flex flex-wrap gap-2">
            {INCOME_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setAnnualIncome(preset.value)}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all border ${
                  annualIncome === preset.value
                    ? "bg-hdfc-blue text-white border-hdfc-blue"
                    : "bg-white text-muted-foreground border-border hover:border-hdfc-blue/40"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[12px] text-muted-foreground">Custom:</span>
            <div className="relative flex-1 max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hdfc-blue text-[13px] font-semibold">₹</span>
              <input
                type="text"
                inputMode="numeric"
                value={annualIncome === 0 ? "" : annualIncome.toLocaleString("en-IN")}
                onChange={(e) => {
                  const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                  if (!isNaN(num)) setAnnualIncome(num);
                  else if (e.target.value === "") setAnnualIncome(0);
                }}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-white text-foreground text-[13px] font-bold tabular-nums focus:border-hdfc-blue focus:ring-1 focus:ring-hdfc-blue/20 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Other 80C Investments (PPF, ELSS, LIC, etc.)
          </label>
          <div className="relative max-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hdfc-blue text-[13px] font-semibold">₹</span>
            <input
              type="text"
              inputMode="numeric"
              value={otherDeductions === 0 ? "" : otherDeductions.toLocaleString("en-IN")}
              onChange={(e) => {
                const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                if (!isNaN(num)) setOtherDeductions(num);
                else if (e.target.value === "") setOtherDeductions(0);
              }}
              placeholder="0"
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-white text-foreground text-[13px] font-bold tabular-nums focus:border-hdfc-blue focus:ring-1 focus:ring-hdfc-blue/20 focus:outline-none transition-all shadow-sm placeholder:text-muted-foreground/30"
            />
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" role="table">
            <thead>
              <tr className="bg-muted/30 border-b border-border/30">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Component
                </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-hdfc-blue uppercase tracking-wider">
                  Old Regime
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-hdfc-green uppercase tracking-wider">
                  New Regime
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border/30">
                <td className="px-5 py-2.5 text-muted-foreground">Gross Income</td>
                <td className="px-5 py-2.5 text-right tabular-nums font-medium">{formatCurrency(comparison.old.grossIncome)}</td>
                <td className="px-5 py-2.5 text-right tabular-nums font-medium">{formatCurrency(comparison.new.grossIncome)}</td>
              </tr>
              <tr className="border-t border-border/30">
                <td className="px-5 py-2.5 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    Deductions
                    <span className="text-[10px] text-muted-foreground/60">(80C + Std.)</span>
                  </span>
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums font-medium text-hdfc-green">
                  −{formatCurrency(comparison.old.deductions)}
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums font-medium text-hdfc-green">
                  −{formatCurrency(comparison.new.deductions)}
                </td>
              </tr>
              <tr className="border-t border-border/30">
                <td className="px-5 py-2.5 text-muted-foreground">Taxable Income</td>
                <td className="px-5 py-2.5 text-right tabular-nums font-medium">{formatCurrency(comparison.old.taxableIncome)}</td>
                <td className="px-5 py-2.5 text-right tabular-nums font-medium">{formatCurrency(comparison.new.taxableIncome)}</td>
              </tr>
              <tr className="border-t border-border/30 bg-muted/20">
                <td className="px-5 py-3 font-semibold text-foreground">Tax Payable</td>
                <td className={`px-5 py-3 text-right tabular-nums font-bold text-lg ${betterRegime === "old" ? "text-hdfc-green" : "text-hdfc-red"}`}>
                  {formatCurrency(Math.round(comparison.old.tax))}
                </td>
                <td className={`px-5 py-3 text-right tabular-nums font-bold text-lg ${betterRegime === "new" ? "text-hdfc-green" : "text-hdfc-red"}`}>
                  {formatCurrency(Math.round(comparison.new.tax))}
                </td>
              </tr>
              <tr className="border-t border-border/30">
                <td className="px-5 py-2.5 text-muted-foreground">Effective Rate</td>
                <td className="px-5 py-2.5 text-right tabular-nums font-medium">
                  {(comparison.old.effectiveRate * 100).toFixed(1)}%
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums font-medium">
                  {(comparison.new.effectiveRate * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Verdict */}
      <div className={`surface p-5 border-l-4 ${betterRegime === "old" ? "border-l-hdfc-blue" : "border-l-hdfc-green"}`}>
        <div className="flex items-start gap-3">
          <div className="flex flex-col">
            <p className="text-[14px] font-semibold text-foreground">
              {betterRegime === "old" ? "Old Regime" : "New Regime"} is better for you
            </p>
            <p className="text-[13px] text-muted-foreground mt-1">
              You save{" "}
              <span className="font-bold text-hdfc-green">{formatCurrency(Math.round(comparison.savings))}</span>{" "}
              per year. Your annual SIP of{" "}
              <span className="font-semibold text-foreground">{formatCurrency(Math.round(annualSIP))}</span>{" "}
              {betterRegime === "old"
                ? `qualifies for Section 80C deduction (₹${Math.min(Math.round(annualSIP + otherDeductions), 1_50_000).toLocaleString("en-IN")} of ₹1,50,000 limit used).`
                : "does not provide 80C benefit under the new regime, but lower slab rates compensate."}
            </p>
          </div>
        </div>
      </div>

      {/* SIP 80C detail */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="stat-card">
          <p className="label-xs mb-1">Annual SIP</p>
          <p className="text-lg font-semibold text-foreground tabular-nums">{formatCurrency(Math.round(annualSIP))}</p>
        </div>
        <div className="stat-card">
          <p className="label-xs mb-1">80C Eligible</p>
          <p className="text-lg font-semibold text-hdfc-blue tabular-nums">
            {formatCurrency(Math.min(Math.round(annualSIP), 1_50_000))}
          </p>
        </div>
        <div className="stat-card">
          <p className="label-xs mb-1">Tax Saved (Old)</p>
          <p className="text-lg font-semibold text-hdfc-green tabular-nums">
            {formatCurrency(Math.round(comparison.old.grossIncome > 0 ? calcTax(comparison.old.grossIncome - 50_000, OLD_SLABS) - comparison.old.tax : 0))}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">via 80C deduction</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-2 items-start">
        <LuInfo className="w-3.5 h-3.5 text-muted-foreground/60 mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
          Tax calculations are illustrative based on FY 2024-25 slabs (including 4% cess).
          ELSS mutual fund SIPs qualify under Section 80C. Actual tax liability depends on your
          complete income profile. Consult a qualified tax advisor. This is not tax advice.
        </p>
      </div>
    </section>
  );
}
