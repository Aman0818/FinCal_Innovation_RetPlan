"use client";

import { useEffect, useRef, useState } from "react";
import { useRetirementStore } from "@/store/useRetirementStore";
import { formatCurrency, formatPct, formatIndian } from "@/lib/format";
import DualPhaseChart from "@/components/DualPhaseChart";
import { LuChevronDown, LuChevronUp, LuPencil, LuSave } from "react-icons/lu";
import TaxEstimation from "@/components/TaxEstimation";
import NationalBenchmarks from "@/components/NationalBenchmarks";

/* ── Scroll reveal ── */
function useRevealOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, visible } = useRevealOnScroll();
  return (
    <div
      ref={ref}
      className="reveal-section"
      style={{
        transitionDelay: `${delay}ms`,
        ...(visible ? { opacity: 1, transform: "translateY(0)" } : {}),
      }}
    >
      {children}
    </div>
  );
}

export default function ResultsSection({
  onOpenPlans,
}: {
  onOpenPlans: () => void;
}) {
  const { inputs, result, setStep, setShowResults, currentPlanId } =
    useRetirementStore();
  const [showAllRows, setShowAllRows] = useState(false);

  const accRows = result.yearlyBreakdown.filter((r) => r.phase === "accumulation");
  const retRows = result.yearlyBreakdown.filter((r) => r.phase === "retirement");
  const visibleRows = showAllRows
    ? result.yearlyBreakdown
    : result.yearlyBreakdown.slice(0, 10);

  const handleEditAssumptions = () => {
    setShowResults(false);
    setStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      id="results-section"
      className="w-full space-y-6"
      aria-label="Retirement projection results"
    >
      {/* ── Section header ── */}
      <div className="pb-5" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-xs mb-1">Projection Output</p>
            <h1 className="page-title">Retirement Plan Projection</h1>
            <p
              className="text-[13px] mt-1.5 leading-relaxed"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Based on your inputs and assumptions. All figures are illustrative estimates.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={handleEditAssumptions}
              className="btn-ghost !text-[12px] !py-2 !px-3"
            >
              <LuPencil className="w-3.5 h-3.5" />
              Edit Assumptions
            </button>
            <button
              onClick={onOpenPlans}
              className="btn-primary !text-[12px] !py-2 !px-3"
            >
              <LuSave className="w-3.5 h-3.5" />
              {currentPlanId ? "Update Plan" : "Save Plan"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero numbers ── */}
      <Reveal>
        <div
          className="rounded overflow-hidden"
          style={{ border: "1px solid var(--color-hdfc-blue-dark)" }}
        >
          {/* Header bar */}
          <div
            className="px-6 py-3 flex items-center justify-between"
            style={{ background: "var(--color-hdfc-blue-dark)" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">
              Retirement Projection Summary
            </p>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
              Age {inputs.currentAge} → {inputs.retirementAge} → {inputs.lifeExpectancy}
            </span>
          </div>

          {/* Key metrics — 3-column grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3"
            style={{ background: "var(--color-hdfc-blue)" }}
            aria-live="polite"
          >
            {[
              {
                label: "Target Corpus",
                value: formatCurrency(result.corpusWithBuffer),
                sub: `Required by age ${inputs.retirementAge}`,
                accent: "rgba(255,255,255,0.9)",
              },
              {
                label: "Starting Monthly SIP",
                value: formatCurrency(result.requiredMonthlySIP),
                sub: `+${formatPct(inputs.annualStepUp)} annual step-up`,
                accent: "rgba(255,255,255,0.9)",
              },
              {
                label: "Monthly Spend at Retirement",
                value: formatCurrency(result.monthlyExpenseAtRetirement),
                sub: `≈ ${formatCurrency(result.todaysMoneyEquivalent)} in today's terms`,
                accent: "rgba(255,255,255,0.9)",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="px-6 py-6"
                style={{
                  borderRight:
                    idx < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                  borderTop:
                    idx > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                  {item.label}
                </p>
                <p
                  className="text-[24px] sm:text-[26px] font-bold tabular-nums tracking-tight"
                  style={{ color: item.accent }}
                >
                  {item.value}
                </p>
                <p className="text-[11px] text-white/40 mt-1.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Action bar at bottom */}
          <div
            className="px-6 py-3 flex items-center gap-4 sm:hidden"
            style={{
              background: "var(--color-hdfc-blue-dark)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              onClick={handleEditAssumptions}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-white/50 hover:text-white/80 transition-colors"
            >
              <LuPencil className="w-3 h-3" />
              Edit Assumptions
            </button>
            <span className="text-white/15">|</span>
            <button
              onClick={onOpenPlans}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-white/50 hover:text-white/80 transition-colors"
            >
              <LuSave className="w-3 h-3" />
              {currentPlanId ? "Update Plan" : "Save Plan"}
            </button>
          </div>
        </div>
      </Reveal>

      {/* ── Inflation context + Chart ── */}
      <Reveal delay={80}>
        <div className="surface overflow-hidden">
          {/* Chart header */}
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-muted)" }}
          >
            <p className="section-title">Corpus Growth &amp; Drawdown Projection</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--color-muted-foreground)" }}>
              Accumulation phase ({accRows.length} years) followed by retirement drawdown ({retRows.length} years)
            </p>
          </div>

          <div className="px-6 pt-5 pb-4">
            {/* Inflation insight */}
            <div
              className="rounded px-4 py-3 mb-5 text-[12.5px]"
              style={{
                background: "var(--color-muted)",
                border: "1px solid var(--color-border)",
                lineHeight: "1.6",
                color: "var(--color-muted-foreground)",
              }}
            >
              Current monthly expenditure of{" "}
              <span className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                {formatCurrency(inputs.monthlyExpenses)}
              </span>{" "}
              is projected to become{" "}
              <span className="font-bold" style={{ color: "var(--color-hdfc-red)" }}>
                {formatCurrency(result.monthlyExpenseAtRetirement)}
              </span>{" "}
              at retirement, reflecting a blended inflation rate of{" "}
              <span className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                {formatPct(result.blendedInflation)}
              </span>{" "}
              over {result.yearsToRetirement} years.
            </div>
            <DualPhaseChart />
          </div>
        </div>
      </Reveal>

      {/* ── Key metrics grid ── */}
      <Reveal delay={120}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Key Metrics</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Accumulation Period",
                value: `${result.yearsToRetirement} yrs`,
                color: "var(--color-hdfc-blue)",
                accentBorder: "var(--color-hdfc-blue)",
              },
              {
                label: "Distribution Period",
                value: `${result.retirementDuration} yrs`,
                color: "var(--color-hdfc-red)",
                accentBorder: "var(--color-hdfc-red)",
              },
              {
                label: "Savings Future Value",
                value: formatCurrency(result.existingSavingsFV),
                color: "var(--color-hdfc-green)",
                accentBorder: "var(--color-hdfc-green)",
              },
              {
                label: "Additional Corpus Required",
                value: formatCurrency(result.remainingCorpus),
                color: "var(--color-foreground)",
                accentBorder: "var(--color-hdfc-grey)",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="stat-card"
                style={{ borderLeft: `3px solid ${item.accentBorder}` }}
              >
                <p className="label-xs mb-2">{item.label}</p>
                <p
                  className="text-[18px] font-bold tabular-nums tracking-tight"
                  style={{ color: item.color }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── Assumptions applied ── */}
      <Reveal delay={160}>
        <div className="surface overflow-hidden">
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-muted)" }}
          >
            <p className="section-title">Assumptions Applied</p>
            <button
              onClick={handleEditAssumptions}
              className="btn-text"
            >
              <LuPencil className="w-3 h-3" />
              Edit
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-0">
              {[
                ["General Inflation", formatPct(inputs.generalInflation)],
                ["Healthcare Inflation", formatPct(inputs.healthcareInflation)],
                ["Blended Inflation", formatPct(result.blendedInflation)],
                ["Healthcare Share", formatPct(inputs.healthcarePct)],
                ["Pre-Retirement Return", formatPct(inputs.preRetirementReturn)],
                ["Post-Retirement Return", formatPct(inputs.postRetirementReturn)],
                ["Annual SIP Step-Up", formatPct(inputs.annualStepUp)],
                ["Emergency Buffer", formatPct(inputs.emergencyBufferPct)],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="py-3"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  <p
                    className="text-[11px] font-medium mb-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-[15px] font-bold tabular-nums"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {val}
                  </p>
                </div>
              ))}
            </div>
            <p
              className="text-[11px] leading-relaxed mt-4 pt-4"
              style={{
                color: "var(--color-muted-foreground)",
                borderTop: "1px solid var(--color-border-subtle)",
              }}
            >
              All assumptions are illustrative. Past performance may or may not be sustained in future.
              Not indicative of returns of any specific HDFC Mutual Fund scheme.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Year-by-Year Breakdown ── */}
      <Reveal delay={200}>
        <div className="surface overflow-hidden">
          {/* Table header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-muted)" }}
          >
            <div>
              <p className="section-title">Year-by-Year Breakdown</p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {accRows.length} accumulation years &nbsp;+&nbsp; {retRows.length} retirement years
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ background: "var(--color-hdfc-blue-light)" }}
                />
                <span className="text-[10px] font-medium" style={{ color: "var(--color-muted-foreground)" }}>
                  Working
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ background: "var(--color-hdfc-red-light)" }}
                />
                <span className="text-[10px] font-medium" style={{ color: "var(--color-muted-foreground)" }}>
                  Retired
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table" role="table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Age</th>
                  <th>Phase</th>
                  <th className="text-right">Monthly SIP</th>
                  <th className="text-right">Annual Withdrawal</th>
                  <th className="text-right">Corpus (End)</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr
                    key={row.year}
                    style={{
                      background:
                        row.phase === "retirement"
                          ? "var(--color-hdfc-red-light)"
                          : undefined,
                    }}
                  >
                    <td
                      className="tabular-nums"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {row.year}
                    </td>
                    <td className="font-semibold tabular-nums">{row.age}</td>
                    <td>
                      <span
                        className={`badge ${
                          row.phase === "accumulation" ? "badge-blue" : "badge-red"
                        }`}
                      >
                        {row.phase === "accumulation" ? "Working" : "Retired"}
                      </span>
                    </td>
                    <td className="text-right tabular-nums">
                      {row.sipMonthly > 0
                        ? `₹${formatIndian(row.sipMonthly)}`
                        : <span style={{ color: "var(--color-muted-foreground)" }}>—</span>}
                    </td>
                    <td
                      className="text-right tabular-nums font-medium"
                      style={{ color: row.annualWithdrawal > 0 ? "var(--color-hdfc-red)" : undefined }}
                    >
                      {row.annualWithdrawal > 0
                        ? `₹${formatIndian(row.annualWithdrawal)}`
                        : <span style={{ color: "var(--color-muted-foreground)" }}>—</span>}
                    </td>
                    <td className="text-right tabular-nums font-bold">
                      ₹{formatIndian(row.corpusEnd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.yearlyBreakdown.length > 10 && (
            <div
              className="px-6 py-3 text-center"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <button
                onClick={() => setShowAllRows(!showAllRows)}
                className="btn-ghost !text-[12px] !py-2"
                aria-expanded={showAllRows}
              >
                {showAllRows ? (
                  <>
                    Show fewer rows <LuChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Show all {result.yearlyBreakdown.length} years <LuChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </Reveal>

      {/* ── Tax Impact Estimation ── */}
      <Reveal delay={240}>
        <TaxEstimation />
      </Reveal>

      {/* ── National Benchmarks ── */}
      <Reveal delay={280}>
        <NationalBenchmarks />
      </Reveal>

      {/* ── Statutory disclaimer ── */}
      <Reveal delay={320}>
        <div
          className="rounded px-5 py-4 text-[11.5px] leading-relaxed"
          style={{
            background: "var(--color-muted)",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted-foreground)",
          }}
        >
          <strong className="font-bold" style={{ color: "var(--color-foreground)" }}>
            Disclaimer:
          </strong>{" "}
          This tool has been designed for information and educational purposes only. Actual results may
          vary depending on various factors involved in capital markets. Investors should not consider
          the above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or
          may not be sustained in future and is not a guarantee of any future returns. Mutual Fund
          investments are subject to market risks. Please read all scheme-related documents carefully
          before investing.
        </div>
      </Reveal>
    </section>
  );
}
