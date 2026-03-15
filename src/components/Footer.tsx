"use client";

export default function Footer() {
  return (
    <footer
      className="w-full mt-10"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <div
        className="px-6 sm:px-10 py-5 space-y-3"
        style={{ background: "var(--color-muted)" }}
      >
        {/* Statutory disclaimer */}
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <span className="font-bold" style={{ color: "var(--color-foreground)" }}>
            Disclaimer:
          </span>{" "}
          This tool has been designed for information and educational purposes only. Actual results may vary
          depending on various factors involved in capital markets. Investors should not consider the above
          as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or may not be sustained
          in future and is not a guarantee of any future returns.
        </p>

        {/* Legal footer row */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3"
          style={{
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          <p className="text-[10.5px]" style={{ color: "var(--color-muted-foreground)" }}>
            Mutual Fund investments are subject to market risks.
            Please read all scheme-related documents carefully before investing.
          </p>
          <p
            className="text-[10.5px] shrink-0 font-semibold"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Investor Education &amp; Awareness Initiative &mdash; HDFC Mutual Fund
          </p>
        </div>
      </div>
    </footer>
  );
}
