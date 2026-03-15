"use client";

import { useRetirementStore } from "@/store/useRetirementStore";
import { formatCurrency, formatPct, formatIndian } from "@/lib/format";
import { LuDownload, LuLoader } from "react-icons/lu";
import { useState } from "react";

export default function PdfDownload() {
  const { inputs, result } = useRetirementStore();
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      // Dynamic import to avoid SSR issues
      const { default: jsPDF } = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 18;
      let y = 20;

      // ── Header ──
      doc.setFillColor(34, 76, 135); // #224c87
      doc.rect(0, 0, pageWidth, 38, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("HDFC Mutual Fund", margin, y);
      y += 8;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Retirement Planning Report", margin, y);
      y += 6;
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin, y);

      y = 48;

      // ── Hero Numbers ──
      doc.setTextColor(34, 76, 135);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Your Retirement Projection", margin, y);
      y += 10;

      // Three key metrics in boxes
      const boxWidth = (pageWidth - 2 * margin - 10) / 3;
      const metrics = [
        { label: "Target Corpus", value: formatCurrency(result.corpusWithBuffer) },
        { label: "Monthly SIP", value: formatCurrency(result.requiredMonthlySIP) },
        { label: "Future Monthly Expense", value: formatCurrency(result.monthlyExpenseAtRetirement) },
      ];

      metrics.forEach((m, i) => {
        const x = margin + i * (boxWidth + 5);
        doc.setFillColor(13, 19, 33); // dark card
        doc.roundedRect(x, y, boxWidth, 22, 2, 2, "F");

        doc.setTextColor(136, 146, 168); // muted
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(m.label.toUpperCase(), x + 5, y + 7);

        doc.setTextColor(237, 240, 247); // foreground
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(m.value, x + 5, y + 16);
      });

      y += 32;

      // ── Personal Details ──
      doc.setTextColor(34, 76, 135);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Personal Details", margin, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Parameter", "Value"]],
        body: [
          ["Current Age", `${inputs.currentAge} years`],
          ["Retirement Age", `${inputs.retirementAge} years`],
          ["Life Expectancy", `${inputs.lifeExpectancy} years`],
          ["Monthly Expenses", formatCurrency(inputs.monthlyExpenses)],
          ["Existing Savings", formatCurrency(inputs.existingSavings)],
          ["Working Period", `${result.yearsToRetirement} years`],
          ["Retirement Duration", `${result.retirementDuration} years`],
        ],
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [237, 240, 247],
          fillColor: [13, 19, 33],
          lineColor: [30, 39, 64],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [34, 76, 135],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [17, 24, 39],
        },
      });

      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

      // ── Assumptions ──
      doc.setTextColor(34, 76, 135);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Assumptions Applied", margin, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Assumption", "Rate"]],
        body: [
          ["General Inflation", formatPct(inputs.generalInflation)],
          ["Healthcare Inflation", formatPct(inputs.healthcareInflation)],
          ["Blended Inflation", formatPct(result.blendedInflation)],
          ["Healthcare Share", formatPct(inputs.healthcarePct)],
          ["Pre-Retirement Return", formatPct(inputs.preRetirementReturn)],
          ["Post-Retirement Return", formatPct(inputs.postRetirementReturn)],
          ["Annual SIP Step-Up", formatPct(inputs.annualStepUp)],
          ["Emergency Buffer", formatPct(inputs.emergencyBufferPct)],
        ],
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [237, 240, 247],
          fillColor: [13, 19, 33],
          lineColor: [30, 39, 64],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [34, 76, 135],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [17, 24, 39],
        },
      });

      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

      // ── Key Metrics ──
      doc.setTextColor(34, 76, 135);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Key Financial Metrics", margin, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Metric", "Value"]],
        body: [
          ["Target Corpus (with buffer)", formatCurrency(result.corpusWithBuffer)],
          ["Required Corpus (base)", formatCurrency(result.requiredCorpus)],
          ["Existing Savings Future Value", formatCurrency(result.existingSavingsFV)],
          ["Funding Gap", formatCurrency(result.remainingCorpus)],
          ["Required Monthly SIP", formatCurrency(result.requiredMonthlySIP)],
          ["Monthly Expense at Retirement", formatCurrency(result.monthlyExpenseAtRetirement)],
          ["Equivalent in Today's Money", formatCurrency(result.todaysMoneyEquivalent)],
        ],
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [237, 240, 247],
          fillColor: [13, 19, 33],
          lineColor: [30, 39, 64],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [34, 76, 135],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [17, 24, 39],
        },
      });

      // ── New Page for Yearly Breakdown ──
      doc.addPage();
      y = 20;

      doc.setFillColor(34, 76, 135);
      doc.rect(0, 0, pageWidth, 18, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Year-by-Year Breakdown", margin, 12);
      y = 26;

      const breakdownRows = result.yearlyBreakdown.map((row) => [
        String(row.year),
        String(row.age),
        row.phase === "accumulation" ? "Working" : "Retired",
        row.sipMonthly > 0 ? `₹${formatIndian(row.sipMonthly)}` : "—",
        row.annualWithdrawal > 0 ? `₹${formatIndian(row.annualWithdrawal)}` : "—",
        `₹${formatIndian(row.corpusEnd)}`,
      ]);

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Year", "Age", "Phase", "Monthly SIP", "Annual Withdrawal", "Corpus"]],
        body: breakdownRows,
        styles: {
          fontSize: 7,
          cellPadding: 2,
          textColor: [237, 240, 247],
          fillColor: [13, 19, 33],
          lineColor: [30, 39, 64],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [34, 76, 135],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7,
        },
        alternateRowStyles: {
          fillColor: [17, 24, 39],
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didParseCell: (data: any) => {
          // Red text for retirement phase rows
          const rowIndex = data.row.index;
          if (rowIndex < result.yearlyBreakdown.length) {
            const phase = result.yearlyBreakdown[rowIndex]?.phase;
            if (phase === "retirement" && data.column.index === 2) {
              data.cell.styles.textColor = [218, 56, 50]; // hdfc-red
            }
          }
        },
      });

      // ── Footer on every page ──
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.getHeight();

        // Disclaimer
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(145, 144, 144); // #919090
        const disclaimer = "Disclaimer: This tool has been designed for information purposes only. Actual results may vary depending on various factors involved in capital market. Investor should not consider above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or may not be sustained in future and is not a guarantee of any future returns.";
        const lines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
        doc.text(lines, margin, pageHeight - 14);

        doc.setTextColor(145, 144, 144);
        doc.setFontSize(7);
        doc.text(
          "Mutual Fund investments are subject to market risks. Read all scheme related documents carefully.",
          margin,
          pageHeight - 6
        );
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 25, pageHeight - 6);
      }

      // Download
      doc.save(`HDFC_Retirement_Plan_Age${inputs.currentAge}_to_${inputs.retirementAge}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="btn-ghost text-hdfc-blue-bright !text-[13px] disabled:opacity-50"
      aria-label="Download retirement plan as PDF report"
    >
      {generating ? (
        <LuLoader className="w-4 h-4 animate-spin" />
      ) : (
        <LuDownload className="w-4 h-4" />
      )}
      {generating ? "Generating..." : "Download PDF Report"}
    </button>
  );
}
