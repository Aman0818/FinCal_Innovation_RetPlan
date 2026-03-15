"use client";

import { motion } from "framer-motion";
import { useRetirementStore } from "@/store/useRetirementStore";
import SliderInput from "@/components/ui/SliderInput";
import TimelineBar from "@/components/ui/TimelineBar";
import { formatCurrency, formatPct } from "@/lib/format";
import { LuArrowLeft, LuArrowRight, LuInfo } from "react-icons/lu";

interface AssumptionsPanelProps {
  onAuthGate?: (onSuccess: () => void) => void;
}

export default function AssumptionsPanel({ onAuthGate }: AssumptionsPanelProps) {
  const { inputs, setInput, result, setStep, setShowResults } =
    useRetirementStore();

  const handleSeeMyPlan = () => {
    const reveal = () => {
      setShowResults(true);
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    };

    if (onAuthGate) {
      onAuthGate(reveal);
    } else {
      reveal();
    }
  };

  const handleBack = () => setStep(4);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full space-y-7"
      aria-label="Financial assumptions and parameters"
    >
      {/* ── Section header ── */}
      <div className="pb-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <p className="label-xs mb-1">Step 2 of 3</p>
        <h1 className="page-title">Assumptions &amp; Parameters</h1>
        <p
          className="text-[13px] mt-1.5 max-w-xl leading-relaxed"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Configure inflation expectations, return assumptions, and contribution strategy.
          All figures update in real time as you adjust the parameters.
        </p>
      </div>

      {/* ── Live summary metrics ── */}
      <div aria-live="polite" aria-label="Live projection summary">
        {/* Primary metrics row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded overflow-hidden"
             style={{ background: "var(--color-border)", border: "1px solid var(--color-border)" }}>
          {/* Estimated corpus */}
          <div className="px-5 py-4" style={{ background: "var(--color-card)" }}>
            <p className="label-xs mb-2">Estimated Corpus</p>
            <p
              className="text-[22px] font-bold tabular-nums tracking-tight"
              style={{ color: "var(--color-hdfc-blue)" }}
            >
              {formatCurrency(result.corpusWithBuffer)}
            </p>
            <p className="text-[11px] mt-1" style={{ color: "var(--color-muted-foreground)" }}>
              Total retirement fund required
            </p>
          </div>

          {/* Monthly SIP */}
          <div className="px-5 py-4" style={{ background: "var(--color-card)" }}>
            <p className="label-xs mb-2">Starting Monthly SIP</p>
            <p
              className="text-[22px] font-bold tabular-nums tracking-tight"
              style={{ color: "var(--color-hdfc-green)" }}
            >
              {formatCurrency(result.requiredMonthlySIP)}
            </p>
            <p className="text-[11px] mt-1" style={{ color: "var(--color-muted-foreground)" }}>
              Initial monthly contribution required
            </p>
          </div>

          {/* Blended inflation */}
          <div className="px-5 py-4" style={{ background: "var(--color-card)" }}>
            <p className="label-xs mb-2">Blended Inflation</p>
            <p
              className="text-[22px] font-bold tabular-nums tracking-tight"
              style={{ color: "var(--color-hdfc-amber)" }}
            >
              {formatPct(result.blendedInflation)}
            </p>
            <p className="text-[11px] mt-1" style={{ color: "var(--color-muted-foreground)" }}>
              Weighted average price escalation
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div
          className="mt-px rounded-b overflow-hidden"
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderTop: "none",
          }}
        >
          <div
            className="px-4 py-2"
            style={{ background: "var(--color-muted)", borderBottom: "1px solid var(--color-border)" }}
          >
            <p className="label-xs">Life Timeline</p>
          </div>
          <div className="p-5">
            <TimelineBar />
          </div>
        </div>
      </div>

      {/* ── Parameter groups ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Inflation parameters */}
        <div className="surface overflow-hidden">
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-muted)" }}
          >
            <div>
              <p className="section-title">Inflation Parameters</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                Expected rate of price escalation
              </p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <SliderInput
              label="General inflation"
              value={inputs.generalInflation * 100}
              min={3}
              max={12}
              step={0.5}
              unit="%"
              onChange={(v) => setInput("generalInflation", v / 100)}
              hint="Average CPI inflation in India has ranged between 5–7% over the past decade."
            />
            <div style={{ borderTop: "1px solid var(--color-border-subtle)" }} className="pt-6">
              <SliderInput
                label="Healthcare inflation"
                value={inputs.healthcareInflation * 100}
                min={5}
                max={15}
                step={0.5}
                unit="%"
                onChange={(v) => setInput("healthcareInflation", v / 100)}
                hint="Medical costs typically rise 8–12% annually, significantly outpacing general inflation."
              />
            </div>
            <div style={{ borderTop: "1px solid var(--color-border-subtle)" }} className="pt-6">
              <SliderInput
                label="Healthcare share of expenses"
                value={inputs.healthcarePct * 100}
                min={5}
                max={50}
                step={1}
                unit="%"
                onChange={(v) => setInput("healthcarePct", v / 100)}
                hint="Healthcare's share of total expenses typically increases significantly with age."
              />
            </div>
          </div>
        </div>

        {/* Returns & strategy */}
        <div className="surface overflow-hidden">
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-muted)" }}
          >
            <div>
              <p className="section-title">Returns &amp; Strategy</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                Investment return and contribution assumptions
              </p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <SliderInput
              label="Pre-retirement return"
              value={inputs.preRetirementReturn * 100}
              min={6}
              max={18}
              step={0.5}
              unit="%"
              onChange={(v) => setInput("preRetirementReturn", v / 100)}
              hint="Equity-heavy portfolios have historically delivered 10–14% annualised returns over long periods."
            />
            <div style={{ borderTop: "1px solid var(--color-border-subtle)" }} className="pt-6">
              <SliderInput
                label="Post-retirement return"
                value={inputs.postRetirementReturn * 100}
                min={4}
                max={12}
                step={0.5}
                unit="%"
                onChange={(v) => setInput("postRetirementReturn", v / 100)}
                hint="Typically lower during retirement due to a more conservative, income-oriented portfolio allocation."
              />
            </div>
            <div style={{ borderTop: "1px solid var(--color-border-subtle)" }} className="pt-6">
              <SliderInput
                label="Annual SIP step-up"
                value={inputs.annualStepUp * 100}
                min={0}
                max={25}
                step={1}
                unit="%"
                onChange={(v) => setInput("annualStepUp", v / 100)}
                hint="Increasing your SIP annually in line with salary increments keeps your plan on track."
              />
            </div>
            <div style={{ borderTop: "1px solid var(--color-border-subtle)" }} className="pt-6">
              <SliderInput
                label="Emergency buffer"
                value={inputs.emergencyBufferPct * 100}
                min={0}
                max={30}
                step={1}
                unit="%"
                onChange={(v) => setInput("emergencyBufferPct", v / 100)}
                hint="Additional corpus buffer for unforeseen medical emergencies, home repairs, or unexpected events."
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Disclaimer notice ── */}
      <div
        className="flex gap-3 rounded px-4 py-3.5"
        style={{
          background: "var(--color-muted)",
          border: "1px solid var(--color-border)",
        }}
      >
        <LuInfo
          className="w-3.5 h-3.5 shrink-0 mt-0.5"
          style={{ color: "var(--color-muted-foreground)" }}
        />
        <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>
          <span className="font-semibold" style={{ color: "var(--color-foreground)" }}>Disclosure: </span>
          All rates and assumptions are illustrative only. Actual results may vary based on market conditions.
          Not indicative of returns of any specific scheme of HDFC Mutual Fund.
        </p>
      </div>

      {/* ── Navigation ── */}
      <div
        className="flex items-center justify-between pt-4"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <button onClick={handleBack} className="btn-ghost">
          <LuArrowLeft className="w-3.5 h-3.5" />
          Edit Profile
        </button>
        <button
          onClick={handleSeeMyPlan}
          className="btn-primary"
          aria-label="View your estimated retirement projection"
        >
          View Projection
          <LuArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.section>
  );
}
