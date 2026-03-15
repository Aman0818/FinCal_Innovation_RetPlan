# HDFC Retirement Planning Calculator

> **HDFC Mutual Fund Hackathon — IIT BHU**
> Category: Retirement Planning Calculator
> Investor Education & Awareness Initiative

---

## Overview

A professional, enterprise-grade **Retirement Planning Calculator** built for the HDFC Mutual Fund Hackathon. The tool helps investors understand how much retirement corpus they need and what monthly SIP is required to achieve it — using industry-standard financial formulas, transparent assumptions, and a guided user experience.

Designed to align with HDFC brand guidelines, WCAG 2.1 AA accessibility standards, and SEBI/AMFI compliance requirements.

---

## Features

### Core Calculator
- **5-step guided input wizard** — current age, retirement age, monthly expenses, existing savings, life expectancy
- **Blended inflation model** — weighted average of general CPI inflation and healthcare inflation (user-configurable split)
- **Growing annuity corpus formula** — mathematically correct post-retirement corpus using present value of annuity
- **Step-up SIP calculation** — annual SIP increment compounded year-by-year (not a flat estimate)
- **Existing savings credit** — FV of current corpus reduces the net SIP required
- **Emergency buffer** — configurable percentage added to the base corpus
- **Live real-time recalculation** — all outputs update instantly as inputs change

### Results & Insights
- **Dual-phase projection chart** — visualises accumulation phase and retirement drawdown on a single chart
- **Year-by-year breakdown table** — every year from today to life expectancy with SIP, withdrawal, and corpus balance
- **Key metrics panel** — accumulation period, distribution period, savings future value, funding gap
- **Tax impact estimation** — illustrative tax considerations on SIP and withdrawals
- **National benchmarks** — contextualises the user's corpus vs national averages

### Advanced Features
- **Scenario comparison** — create and compare "what-if" scenarios side-by-side
- **Save & load plans** — authenticated users can persist multiple retirement plans to a MySQL database
- **PDF export** — download a complete projection report as a PDF
- **Full audit trail** — every calculation, save, load, and login is logged for compliance review

### Authentication & Security
- Email + password authentication via NextAuth (JWT sessions)
- bcrypt password hashing (12 rounds)
- User-owned data — all plans and scenarios scoped to the authenticated user
- Input validation at all API boundaries

---

## Judging Criteria Alignment

| Criterion | Implementation |
|---|---|
| **Financial Logic (25%)** | Industry-standard growing annuity formula, blended inflation, step-up SIP, year-by-year compounding. All assumptions disclosed and editable. |
| **Compliance (20%)** | HDFC brand colors, Montserrat/Arial/Verdana fonts, mandatory SEBI disclaimer, non-promotional language, no guarantee language, illustrative-only framing throughout. |
| **Accessibility (15%)** | WCAG 2.1 AA — skip link, `aria-live` regions, ARIA roles, keyboard navigation, accessible labels, focus-visible indicators, semantic HTML. |
| **UX Clarity (15%)** | Guided wizard, progress stepper, live estimates, annotated rationale per step, visual chart, expandable table, mobile-responsive layout. |
| **Technical Quality (15%)** | Next.js + TypeScript, Prisma ORM, MySQL, NextAuth, Zustand, Recharts, jsPDF, full REST API, audit logging. |
| **Responsiveness (10%)** | Mobile-first layout, collapsible sidebar, responsive grids, touch-friendly inputs on all screen sizes. |

---

## Financial Formulas

### 1. Blended Inflation
```
blendedInflation = (healthcarePct × healthcareInflation) + ((1 − healthcarePct) × generalInflation)
```

### 2. Inflation-Adjusted Retirement Expense
```
retirementMonthlyExpense = currentMonthlyExpense × (1 + blendedInflation)^yearsToRetirement
```

### 3. Retirement Corpus (Growing Annuity / Present Value of Annuity)
```
If postReturnRate ≈ inflationRate:
  corpus = annualExpense × retirementDuration / (1 + postReturnRate)

Otherwise:
  corpus = annualExpense × [1 − ((1 + g) / (1 + r))^t] / (r − g)

  where:
    g = blendedInflation (post-retirement)
    r = postRetirementReturn
    t = retirementDuration (years)
```

### 4. Existing Savings Future Value
```
existingSavingsFV = existingSavings × (1 + preRetirementReturn)^yearsToRetirement
```

### 5. Net Corpus Required
```
remainingCorpus = max(0, corpusRequired − existingSavingsFV)
corpusWithBuffer = remainingCorpus × (1 + emergencyBufferPct)
```

### 6. Required Monthly SIP (with Annual Step-Up)
Computed iteratively: each year's SIP is stepped up by `annualStepUp`, compounded monthly at the pre-retirement return rate, summing forward to retirement.

```
For year y (0 to yearsToRetirement − 1):
  sipThisYear = startingSIP × (1 + annualStepUp)^y
  FV contribution = sipThisYear × ((1 + monthlyRate)^12(yearsToRetirement−y) − 1) / monthlyRate × (1 + monthlyRate)

Total FV = Σ FV contributions = corpusWithBuffer
Solve for startingSIP
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15+ (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| State Management | Zustand |
| Database | MySQL / MariaDB via Prisma ORM |
| Authentication | NextAuth v5 (Credentials provider, JWT) |
| Charts | Recharts |
| Animation | Framer Motion |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Icons | React Icons (Lucide) |
| Security | bcryptjs (12 rounds) |

---

## Getting Started

### Prerequisites
- Node.js 22.x
- MySQL 8.x or MariaDB 10.x
- npm 10.x

### 1. Clone and install
```bash
git clone <repository-url>
cd retirement-calculator
npm install
```

### 2. Configure environment
Create a `.env` file in the project root:
```env
DATABASE_URL="mysql://user:password@localhost:3306/retirement_db"
AUTH_SECRET="your-nextauth-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up the database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth + signup + profile
│   │   ├── calculate/     # Stateless calculation endpoint
│   │   └── plans/         # CRUD for saved plans + scenarios
│   ├── globals.css        # HDFC brand design system
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                # SliderInput, CurrencyInput, TimelineBar
│   ├── StepInputFlow.tsx  # Guided 5-step input wizard
│   ├── AssumptionsPanel.tsx
│   ├── ResultsSection.tsx
│   ├── DualPhaseChart.tsx
│   ├── ScenarioComparison.tsx
│   ├── SavedPlans.tsx
│   ├── AuthModal.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── ...
├── lib/
│   ├── calculations.ts    # Pure financial calculation engine
│   ├── format.ts          # Indian number/currency formatting
│   ├── auth.ts            # NextAuth configuration
│   └── prisma.ts
└── store/
    └── useRetirementStore.ts  # Zustand global state
```

---

## Compliance Statement

This tool has been designed for **information purposes only**. Actual results may vary depending on various factors involved in capital markets. Investors should not consider the above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or may not be sustained in future and is not a guarantee of any future returns.

**Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.**

---

## Brand Guidelines

| Element | Value |
|---|---|
| Primary Blue | `#224c87` |
| Accent Red | `#da3832` |
| Neutral Grey | `#919090` |
| Primary Font | Montserrat |
| Fallback Fonts | Arial, Verdana |

---

*Investor Education & Awareness Initiative — HDFC Mutual Fund*
*Built for HDFC Hackathon — IIT BHU*
