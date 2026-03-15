"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRetirementStore } from "@/store/useRetirementStore";
import SliderInput from "@/components/ui/SliderInput";
import CurrencyInput from "@/components/ui/CurrencyInput";
import TimelineBar from "@/components/ui/TimelineBar";
import { formatCurrency } from "@/lib/format";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

interface StepDef {
  key: string;
  title: string;
  subtitle: string;
  rationale: string;
  note: string;
}

const STEPS: StepDef[] = [
  {
    key: "currentAge",
    title: "Current Age",
    subtitle: "Your present age establishes the investment horizon available for wealth accumulation.",
    rationale:
      "Your current age determines the compounding period. An additional 2–3 years of early participation can materially reduce the required monthly contribution due to the exponential effect of compounding.",
    note:
      "Typical entry age in India is 25–30 years. Earlier participation substantially lowers periodic investment requirements.",
  },
  {
    key: "retirementAge",
    title: "Target Retirement Age",
    subtitle: "The age at which you intend to cease active employment and begin corpus drawdown.",
    rationale:
      "An extended working period increases the compounding runway. Even 3 additional years can reduce the required SIP by 20–30%, making the retirement plan significantly more achievable.",
    note:
      "Standard retirement age in India is 60. Early retirement at 55 requires a materially higher savings rate and larger corpus.",
  },
  {
    key: "monthlyExpenses",
    title: "Monthly Household Expenditure",
    subtitle: "Total monthly outflow including housing, utilities, EMIs, and discretionary spending.",
    rationale:
      "Current lifestyle expenditure serves as the baseline. Inflation adjustments project future expenditure requirements in nominal terms, determining the corpus needed to sustain your standard of living.",
    note:
      "An approximate estimate is sufficient at this stage. All assumptions can be refined in the parameters section.",
  },
  {
    key: "existingSavings",
    title: "Existing Retirement Corpus",
    subtitle: "Aggregate value of all investments earmarked for retirement — mutual funds, PPF, EPF, NPS, FDs.",
    rationale:
      "Existing investments continue to compound independently, reducing the net additional monthly investment required. This creates an important head-start in the accumulation phase.",
    note:
      "Enter zero if beginning with no prior retirement savings. Include only investments specifically designated for retirement.",
  },
  {
    key: "lifeExpectancy",
    title: "Planning Horizon",
    subtitle: "The age until which your accumulated corpus must sustain scheduled withdrawals.",
    rationale:
      "Life expectancy in India continues to rise. Planning until age 85 provides an adequate margin of safety against longevity risk — the risk of outliving your corpus.",
    note:
      "A planning horizon of 80–85 years is recommended. Under-estimation poses a significant risk of corpus depletion.",
  },
];

export default function StepInputFlow() {
  const {
    currentStep,
    inputs,
    result,
    setInput,
    nextStep,
    prevStep,
    setStep,
  } = useRetirementStore();

  const TOTAL_STEPS = STEPS.length;
  const isLastStep = currentStep >= TOTAL_STEPS - 1;
  const isFirstStep = currentStep === 0;

  const scrollToTop = () => {
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (isLastStep) {
      setStep(TOTAL_STEPS);
    } else {
      nextStep();
    }
    scrollToTop();
  };

  const handlePrev = () => {
    prevStep();
    scrollToTop();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleNext();
  };

  const renderStepInput = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <SliderInput
            label="Your current age"
            value={inputs.currentAge}
            min={18}
            max={65}
            unit=" years"
            onChange={(v) => setInput("currentAge", v)}
            hint="Starting early significantly reduces monthly investment requirements — time is the most powerful variable in compounding."
          />
        );
      case 1:
        return (
          <SliderInput
            label="Desired retirement age"
            value={inputs.retirementAge}
            min={Math.max(inputs.currentAge + 5, 40)}
            max={75}
            unit=" years"
            onChange={(v) => setInput("retirementAge", v)}
            hint="Even 3 additional working years can reduce the required monthly SIP by 20–30%."
          />
        );
      case 2:
        return (
          <CurrencyInput
            label="Monthly household expenses"
            value={inputs.monthlyExpenses}
            onChange={(v) => setInput("monthlyExpenses", v)}
            hint="Include all recurring outflows: rent, groceries, utilities, transport, insurance premiums, and EMIs."
          />
        );
      case 3:
        return (
          <CurrencyInput
            label="Existing retirement savings"
            value={inputs.existingSavings}
            onChange={(v) => setInput("existingSavings", v)}
            hint="Include mutual funds, PPF, EPF, NPS, or any fixed deposits earmarked exclusively for retirement."
          />
        );
      case 4:
        return (
          <SliderInput
            label="Plan until age"
            value={inputs.lifeExpectancy}
            min={inputs.retirementAge + 5}
            max={100}
            unit=" years"
            onChange={(v) => setInput("lifeExpectancy", v)}
            hint="India's life expectancy is rising. Planning until age 85 provides a prudent safety margin against longevity risk."
          />
        );
      default:
        return null;
    }
  };

  return (
    <section
      className="w-full"
      aria-label="Personal information inputs"
      onKeyDown={handleKeyDown}
    >
      {/* ── Section header ── */}
      <div className="mb-8 pb-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="label-xs mb-1">Personal Information</p>
            <h1 className="page-title">Retirement Profile</h1>
            <p className="text-[13px] mt-1.5" style={{ color: "var(--color-muted-foreground)" }}>
              Provide your personal details to calculate your retirement corpus requirement.
            </p>
          </div>
          <div className="hidden sm:block shrink-0">
            <span className="badge badge-blue">Personal Information</span>
          </div>
        </div>
      </div>

      {/* ── Progress stepper ── */}
      <div className="mb-8">
        {/* Step label + counter */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-semibold" style={{ color: "#224c87" }}>
            {STEPS[currentStep].title}
          </p>
          <p className="text-[11px] font-medium tabular-nums" style={{ color: "#9ca3af" }}>
            {currentStep + 1} / {TOTAL_STEPS}
          </p>
        </div>

        {/* Dot + connector track */}
        <div className="relative flex items-center">
          {/* Background track */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5"
            style={{ background: "#e5e7eb" }}
          />
          {/* Filled track */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-0.5 left-0 transition-all duration-400 ease-out"
            style={{
              width: `${(currentStep / (TOTAL_STEPS - 1)) * 100}%`,
              background: "#224c87",
            }}
          />

          {/* Step dots */}
          <div className="relative flex items-center justify-between w-full">
            {STEPS.map((s, i) => {
              const isActive = i === currentStep;
              const isDone   = i < currentStep;
              return (
                <button
                  key={i}
                  onClick={() => (isDone || isActive) && setStep(i)}
                  disabled={!isDone && !isActive}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  aria-current={isActive ? "step" : undefined}
                  className="relative flex flex-col items-center group"
                  style={{ cursor: isDone ? "pointer" : isActive ? "default" : "not-allowed" }}
                >
                  {/* Circle */}
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 z-10"
                    style={{
                      background: isActive ? "#224c87" : isDone ? "#224c87" : "#ffffff",
                      color:      isActive ? "#ffffff"  : isDone ? "#ffffff" : "#d1d5db",
                      border:     isActive ? "2px solid #224c87"
                                : isDone   ? "2px solid #224c87"
                                :            "2px solid #d1d5db",
                      boxShadow:  isActive ? "0 0 0 4px rgba(34,76,135,0.12)" : "none",
                    }}
                  >
                    {isDone ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>

                  {/* Label below dot */}
                  <span
                    className="absolute top-10 text-[9.5px] font-semibold text-center whitespace-nowrap hidden sm:block"
                    style={{
                      color: isActive ? "#224c87" : isDone ? "#6b7280" : "#d1d5db",
                    }}
                  >
                    {s.title.split(" ").slice(0, 2).join(" ")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacer for the labels below dots */}
        <div className="hidden sm:block h-6 mt-1" />
      </div>

      {/* ── Animated step content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {currentStep < TOTAL_STEPS && (
            <div className="space-y-5">
              {/* Step heading */}
              <div>
                <h2
                  className="text-[18px] sm:text-[20px] font-bold tracking-tight"
                  style={{ color: "var(--color-foreground)", letterSpacing: "-0.015em" }}
                >
                  {STEPS[currentStep].title}
                </h2>
                <p
                  className="text-[13px] mt-1.5 leading-relaxed max-w-xl"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {STEPS[currentStep].subtitle}
                </p>
              </div>

              {/* Input card */}
              <div className="surface p-6 sm:p-7">
                {renderStepInput(currentStep)}
              </div>

              {/* Rationale — note style */}
              <div className="notice-box">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-hdfc-blue)" }}
                >
                  Why this matters
                </p>
                <p
                  className="text-[12.5px] leading-relaxed"
                  style={{ color: "var(--color-foreground)", opacity: 0.75 }}
                >
                  {STEPS[currentStep].rationale}
                </p>
              </div>

              {/* Note */}
              <div
                className="flex items-start gap-2 px-4 py-3 rounded"
                style={{
                  background: "var(--color-muted)",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-widest shrink-0 mt-0.5"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Note:
                </span>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {STEPS[currentStep].note}
                </p>
              </div>

              {/* Live estimate metrics */}
              <div
                className="rounded"
                style={{ border: "1px solid var(--color-border)" }}
              >
                <div
                  className="px-4 py-2.5 flex items-center gap-2"
                  style={{
                    background: "var(--color-muted)",
                    borderBottom: "1px solid var(--color-border)",
                    borderRadius: "5px 5px 0 0",
                  }}
                >
                  <p className="label-xs">Live Estimate</p>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    Updates as you adjust inputs
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  {[
                    {
                      label: "Accumulation Period",
                      value: `${result.yearsToRetirement} yrs`,
                      color: "var(--color-foreground)",
                    },
                    {
                      label: "Target Corpus",
                      value: formatCurrency(result.corpusWithBuffer),
                      color: "var(--color-hdfc-blue)",
                    },
                    {
                      label: "Est. Monthly SIP",
                      value: formatCurrency(result.requiredMonthlySIP),
                      color: "var(--color-hdfc-green)",
                    },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3"
                      style={{ borderRight: idx < 2 ? "1px solid var(--color-border)" : "none" }}
                    >
                      <p className="label-xs mb-1.5">{m.label}</p>
                      <p
                        className="text-[14px] font-bold tabular-nums"
                        style={{ color: m.color }}
                      >
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="surface p-5">
                <TimelineBar />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      {currentStep < TOTAL_STEPS && (
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
          <button
            onClick={handlePrev}
            disabled={isFirstStep}
            className="btn-ghost"
            aria-label="Previous step"
          >
            <LuArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="flex items-center gap-4">
            <p
              className="hidden sm:block text-[11px]"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Press{" "}
              <kbd
                className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                style={{
                  background: "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              >
                Enter
              </kbd>{" "}
              to continue
            </p>
            <button
              onClick={handleNext}
              className="btn-primary"
              aria-label={isLastStep ? "Continue to assumptions" : "Next step"}
            >
              {isLastStep ? "Proceed to Parameters" : "Continue"}
              <LuArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
