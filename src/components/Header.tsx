"use client";

import { useRetirementStore } from "@/store/useRetirementStore";
import { LuRotateCcw, LuFolder } from "react-icons/lu";
import ThemeToggle from "./ThemeToggle";

const STEPS = [
  { id: "details", label: "Details" },
  { id: "assumptions", label: "Assumptions" },
  { id: "plan", label: "Your Plan" },
] as const;

export default function Header({
  onOpenPlans,
}: {
  onOpenPlans: () => void;
}) {
  const { currentStep, showResults, setShowResults, setStep } =
    useRetirementStore();

  const activeIdx = showResults ? 2 : currentStep >= 5 ? 1 : 0;

  const handleReset = () => {
    setShowResults(false);
    setStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (idx: number) => {
    if (idx === 0) {
      setShowResults(false);
      setStep(0);
    } else if (idx === 1 && activeIdx >= 1) {
      setShowResults(false);
      setStep(5);
    } else if (idx === 2 && activeIdx >= 2) {
      setShowResults(true);
    }
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-hdfc-blue flex items-center justify-center">
              <span className="text-white font-bold text-base tracking-tight">H</span>
            </div>
            <div>
              <p className="text-[15px] font-bold text-foreground leading-none">
                HDFC Mutual Fund
              </p>
              <p className="text-[12px] text-muted-foreground leading-none mt-1">
                Retirement Planner
              </p>
            </div>
          </div>

          {/* Progress stepper */}
          <nav className="flex items-center gap-1.5" aria-label="Progress">
            {STEPS.map((step, i) => {
              const isActive = i === activeIdx;
              const isDone = i < activeIdx;
              const isClickable = i <= activeIdx;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => handleStepClick(i)}
                    disabled={!isClickable}
                    className={`relative px-4 py-2 rounded-lg text-[14px] font-semibold transition-all ${
                      isActive
                        ? "text-hdfc-blue bg-hdfc-blue-light shadow-sm"
                        : isDone
                        ? "text-hdfc-blue hover:bg-hdfc-blue-light"
                        : "text-muted-foreground/40 cursor-default"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center ${
                          isActive
                            ? "bg-hdfc-blue text-white"
                            : isDone
                            ? "bg-hdfc-blue/20 text-hdfc-blue"
                            : "bg-muted text-muted-foreground/40"
                        }`}
                      >
                        {isDone ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : i + 1}
                      </span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-1 rounded-full ${
                        i < activeIdx ? "bg-hdfc-blue/40" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onOpenPlans}
              className="btn-ghost !px-3 !py-2 text-hdfc-blue"
              aria-label="My saved plans"
            >
              <LuFolder className="w-5 h-5" />
              <span className="hidden sm:inline text-[14px]">My Plans</span>
            </button>
            <button
              onClick={handleReset}
              className="btn-ghost !px-3 !py-2"
              aria-label="Start over"
            >
              <LuRotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
