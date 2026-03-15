"use client";

import { useId } from "react";

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  prefix?: string;
  hint?: string;
  onChange: (value: number) => void;
  formatDisplay?: (value: number) => string;
  ariaLabel?: string;
}

export default function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  prefix = "",
  hint,
  onChange,
  formatDisplay,
  ariaLabel,
}: SliderInputProps) {
  const id = useId();

  const displayValue = formatDisplay
    ? formatDisplay(value)
    : `${prefix}${value.toLocaleString("en-IN")}${unit}`;

  const pctFilled = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="w-full space-y-3">
      {/* Label + value badge */}
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[13px] font-semibold leading-tight"
          style={{ color: "var(--color-foreground)" }}
        >
          {label}
        </label>
        <span
          className="px-2.5 py-1 rounded text-[12px] font-bold tabular-nums shrink-0"
          style={{
            background: "var(--color-hdfc-blue-light)",
            color: "var(--color-hdfc-blue)",
            border: "1px solid rgba(34,76,135,0.12)",
          }}
          aria-live="polite"
          aria-label={`${label}: ${displayValue}`}
        >
          {displayValue}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative py-1">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          aria-label={ariaLabel || label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={displayValue}
          style={{
            background: `linear-gradient(
              to right,
              var(--color-hdfc-blue) 0%,
              var(--color-hdfc-blue) ${pctFilled}%,
              #dde1e8 ${pctFilled}%,
              #dde1e8 100%
            )`,
          }}
        />

        {/* Min / Max labels */}
        <div className="flex justify-between mt-1.5">
          <span
            className="text-[10px] tabular-nums font-medium"
            style={{ color: "var(--color-muted-foreground)", opacity: 0.6 }}
          >
            {prefix}{min.toLocaleString("en-IN")}{unit}
          </span>
          <span
            className="text-[10px] tabular-nums font-medium"
            style={{ color: "var(--color-muted-foreground)", opacity: 0.6 }}
          >
            {prefix}{max.toLocaleString("en-IN")}{unit}
          </span>
        </div>
      </div>

      {/* Hint */}
      {hint && (
        <p
          className="text-[11.5px] leading-relaxed"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
