"use client";

import { useId } from "react";

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  min?: number;
  max?: number;
  ariaLabel?: string;
}

export default function CurrencyInput({
  label,
  value,
  onChange,
  hint,
  min = 0,
  max = 100_00_00_000,
  ariaLabel,
}: CurrencyInputProps) {
  const id = useId();

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, "");
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    } else if (cleaned === "") {
      onChange(0);
    }
  };

  return (
    <div className="w-full space-y-2">
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold"
        style={{ color: "var(--color-foreground)" }}
      >
        {label}
      </label>

      <div className="relative">
        {/* Rupee prefix */}
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-11 rounded-l"
          style={{
            background: "var(--color-muted)",
            border: "1px solid var(--color-border)",
            borderRight: "none",
          }}
        >
          <span
            className="text-[15px] font-bold"
            style={{ color: "var(--color-hdfc-blue)" }}
          >
            ₹
          </span>
        </div>

        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString("en-IN")}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0"
          className="w-full pl-12 pr-4 py-3 rounded text-[16px] font-bold tabular-nums outline-none transition-all"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            background: "var(--color-card)",
            color: "var(--color-foreground)",
            fontFamily: "var(--font-sans)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-hdfc-blue)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(34,76,135,0.09)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
          aria-label={ariaLabel || label}
        />
      </div>

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
