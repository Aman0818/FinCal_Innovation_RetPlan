/** Format number as Indian currency (₹) with lakhs/crores */
export function formatCurrency(amount: number): string {
  if (amount < 0) return `-${formatCurrency(-amount)}`;
  if (amount >= 1_00_00_000) {
    const cr = amount / 1_00_00_000;
    return `₹${cr.toFixed(2)} Cr`;
  }
  if (amount >= 1_00_000) {
    const lakh = amount / 1_00_000;
    return `₹${lakh.toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

/** Format as short: 6.2 Cr, 45.3 L, etc. */
export function formatShort(amount: number): string {
  if (amount >= 1_00_00_000) {
    return `${(amount / 1_00_00_000).toFixed(1)} Cr`;
  }
  if (amount >= 1_00_000) {
    return `${(amount / 1_00_000).toFixed(1)} L`;
  }
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/** Format percentage for display */
export function formatPct(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`;
}

/** Format number with Indian comma grouping */
export function formatIndian(num: number): string {
  return num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
