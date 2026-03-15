"use client";

import { useRetirementStore } from "@/store/useRetirementStore";
import { LuBriefcase, LuSunset } from "react-icons/lu";

export default function TimelineBar() {
  const { inputs, result } = useRetirementStore();

  const totalYears = inputs.lifeExpectancy - inputs.currentAge;
  const workingPct =
    totalYears > 0 ? (result.yearsToRetirement / totalYears) * 100 : 60;

  return (
    <div
      className="w-full"
      role="img"
      aria-label={`Timeline: ${result.yearsToRetirement} working years followed by ${result.retirementDuration} retirement years`}
    >
      {/* Phase info row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-hdfc-blue-light">
          <LuBriefcase className="w-3 h-3 text-hdfc-blue" />
          <span className="text-[12px] font-semibold text-hdfc-blue">
            {result.yearsToRetirement} yrs working
          </span>
        </div>
        <div className="flex-1 border-t border-dashed border-border/40" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-hdfc-red-light">
          <LuSunset className="w-3 h-3 text-hdfc-red" />
          <span className="text-[12px] font-semibold text-hdfc-red">
            {result.retirementDuration} yrs retired
          </span>
        </div>
      </div>

      {/* Visual timeline track */}
      <div className="relative">
        {/* Track background */}
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div className="flex h-full">
            <div
              className="h-full bg-gradient-to-r from-hdfc-blue to-hdfc-blue-bright transition-all duration-500 ease-out rounded-l-full"
              style={{ width: `${workingPct}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-hdfc-red to-hdfc-red/70 transition-all duration-500 ease-out rounded-r-full"
              style={{ width: `${100 - workingPct}%` }}
            />
          </div>
        </div>

        {/* Retirement marker — diamond */}
        <div
          className="absolute top-1/2 z-10 transition-all duration-500 ease-out"
          style={{ left: `${workingPct}%`, transform: `translateX(-50%) translateY(-50%)` }}
        >
          <div className="w-5 h-5 rotate-45 rounded-sm bg-white border-2 border-hdfc-blue shadow-md" />
        </div>
      </div>

      {/* Age labels */}
      <div className="flex justify-between mt-3">
        <div className="flex flex-col items-start">
          <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide font-medium">Now</span>
          <span className="text-[14px] font-semibold text-foreground tabular-nums">
            Age {inputs.currentAge}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[11px] text-hdfc-blue uppercase tracking-wide font-medium">Retire</span>
          <span className="text-[14px] font-semibold text-hdfc-blue tabular-nums">
            Age {inputs.retirementAge}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide font-medium">Plan until</span>
          <span className="text-[14px] font-semibold text-foreground tabular-nums">
            Age {inputs.lifeExpectancy}
          </span>
        </div>
      </div>
    </div>
  );
}
