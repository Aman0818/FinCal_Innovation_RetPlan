// ──────────────────────────────────────────────────
// Pure Calculation Engine — Retirement Planning
// All functions are pure: input → output, no side effects
// ──────────────────────────────────────────────────

export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlyExpenses: number;
  existingSavings: number;
  generalInflation: number; // decimal e.g. 0.06
  healthcareInflation: number; // decimal e.g. 0.10
  healthcarePct: number; // decimal e.g. 0.15
  preRetirementReturn: number; // decimal e.g. 0.12
  postRetirementReturn: number; // decimal e.g. 0.08
  annualStepUp: number; // decimal e.g. 0.10
  emergencyBufferPct: number; // decimal e.g. 0.10
}

export interface RetirementResult {
  yearsToRetirement: number;
  retirementDuration: number;
  blendedInflation: number;
  annualExpenseAtRetirement: number;
  monthlyExpenseAtRetirement: number;
  requiredCorpus: number;
  corpusWithBuffer: number;
  existingSavingsFV: number;
  remainingCorpus: number;
  requiredMonthlySIP: number;
  todaysMoneyEquivalent: number;
  yearlyBreakdown: YearlyData[];
}

export interface YearlyData {
  year: number;
  age: number;
  phase: "accumulation" | "retirement";
  sipMonthly: number;
  annualContribution: number;
  annualWithdrawal: number;
  corpusStart: number;
  corpusEnd: number;
  growth: number;
}

/** Blended inflation rate combining general + healthcare inflation */
export function calcBlendedInflation(
  generalInflation: number,
  healthcareInflation: number,
  healthcarePct: number
): number {
  return healthcarePct * healthcareInflation + (1 - healthcarePct) * generalInflation;
}

/** Inflate current annual expense to retirement year */
export function calcInflatedExpense(
  currentAnnualExpense: number,
  blendedInflation: number,
  years: number
): number {
  return currentAnnualExpense * Math.pow(1 + blendedInflation, years);
}

/**
 * Retirement Corpus — Present Value of Growing Annuity
 * Accounts for expenses continuing to inflate during retirement
 */
export function calcRetirementCorpus(
  annualExpenseAtRetirement: number,
  postRetirementReturn: number,
  blendedInflation: number,
  retirementDuration: number
): number {
  const r = postRetirementReturn;
  const g = blendedInflation;
  const t = retirementDuration;

  if (Math.abs(r - g) < 0.0001) {
    // When return ≈ inflation, use limit formula
    return annualExpenseAtRetirement * t / (1 + r);
  }

  // Growing annuity: PV = PMT × [1 - ((1+g)/(1+r))^t] / (r - g)
  return (
    annualExpenseAtRetirement *
    (1 - Math.pow((1 + g) / (1 + r), t)) /
    (r - g)
  );
}

/** Future value of existing savings compounded at pre-retirement return */
export function calcExistingSavingsFV(
  existingSavings: number,
  preRetirementReturn: number,
  years: number
): number {
  return existingSavings * Math.pow(1 + preRetirementReturn, years);
}

/**
 * Solve for base monthly SIP with annual step-up
 * such that total accumulation = target corpus
 *
 * Uses iterative year-wise compounding:
 * Each year's SIP = baseSIP × (1 + stepUp)^(year-1)
 * Each year's FV contribution = monthlySIP × [((1+r)^12 - 1)/r] × (1+r)
 * compounded forward to retirement
 */
export function calcRequiredSIP(
  targetCorpus: number,
  preRetirementReturn: number,
  annualStepUp: number,
  yearsToRetirement: number
): number {
  if (yearsToRetirement <= 0 || targetCorpus <= 0) return 0;

  const monthlyRate = preRetirementReturn / 12;

  // Calculate how much ₹1/month base SIP with step-up grows to
  let totalFVPerRupee = 0;

  for (let year = 1; year <= yearsToRetirement; year++) {
    const stepUpMultiplier = Math.pow(1 + annualStepUp, year - 1);
    const remainingYears = yearsToRetirement - year;

    // FV of this year's monthly SIP at end of this year
    const yearEndFV =
      1 * stepUpMultiplier *
      ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) *
      (1 + monthlyRate);

    // Compound forward to retirement
    const fvAtRetirement = yearEndFV * Math.pow(1 + preRetirementReturn, remainingYears);
    totalFVPerRupee += fvAtRetirement;
  }

  return totalFVPerRupee > 0 ? targetCorpus / totalFVPerRupee : 0;
}

/** Generate year-by-year breakdown for accumulation + decumulation */
export function calcYearlyBreakdown(
  inputs: RetirementInputs,
  result: Pick<
    RetirementResult,
    | "requiredMonthlySIP"
    | "blendedInflation"
    | "corpusWithBuffer"
    | "yearsToRetirement"
    | "retirementDuration"
    | "annualExpenseAtRetirement"
  >
): YearlyData[] {
  const breakdown: YearlyData[] = [];
  let corpus = 0;

  // ── Accumulation Phase ──
  for (let y = 1; y <= result.yearsToRetirement; y++) {
    const age = inputs.currentAge + y;
    const sipMonthly =
      result.requiredMonthlySIP * Math.pow(1 + inputs.annualStepUp, y - 1);
    const monthlyRate = inputs.preRetirementReturn / 12;
    const annualContribution = sipMonthly * 12;

    // Also include existing savings growth in year 1
    const corpusStart = corpus;

    // Growth on existing corpus
    const growthOnExisting = corpusStart * inputs.preRetirementReturn;

    // FV of this year's SIP contributions
    const sipFV =
      sipMonthly *
      ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) *
      (1 + monthlyRate);

    corpus = corpusStart + growthOnExisting + sipFV;

    // Add existing savings in year 1
    if (y === 1) {
      corpus += inputs.existingSavings * (1 + inputs.preRetirementReturn);
    }

    breakdown.push({
      year: y,
      age,
      phase: "accumulation",
      sipMonthly: Math.round(sipMonthly),
      annualContribution: Math.round(annualContribution),
      annualWithdrawal: 0,
      corpusStart: Math.round(corpusStart),
      corpusEnd: Math.round(corpus),
      growth: Math.round(growthOnExisting + sipFV - annualContribution),
    });
  }

  // ── Decumulation Phase ──
  let annualWithdrawal = result.annualExpenseAtRetirement;

  for (let y = 1; y <= result.retirementDuration; y++) {
    const age = inputs.retirementAge + y;
    const corpusStart = corpus;

    // Growth on corpus
    const growth = corpusStart * inputs.postRetirementReturn;

    // Withdrawal (inflation-adjusted each year)
    if (y > 1) {
      annualWithdrawal *= 1 + result.blendedInflation;
    }

    corpus = corpusStart + growth - annualWithdrawal;
    if (corpus < 0) corpus = 0;

    breakdown.push({
      year: result.yearsToRetirement + y,
      age,
      phase: "retirement",
      sipMonthly: 0,
      annualContribution: 0,
      annualWithdrawal: Math.round(annualWithdrawal),
      corpusStart: Math.round(corpusStart),
      corpusEnd: Math.round(Math.max(corpus, 0)),
      growth: Math.round(growth),
    });

    if (corpus <= 0) break;
  }

  return breakdown;
}

/** Master calculation — computes everything from inputs */
export function calculateRetirement(inputs: RetirementInputs): RetirementResult {
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const retirementDuration = inputs.lifeExpectancy - inputs.retirementAge;

  // Step 1: Blended inflation
  const blendedInflation = calcBlendedInflation(
    inputs.generalInflation,
    inputs.healthcareInflation,
    inputs.healthcarePct
  );

  // Step 2: Inflate expenses
  const currentAnnualExpense = inputs.monthlyExpenses * 12;
  const annualExpenseAtRetirement = calcInflatedExpense(
    currentAnnualExpense,
    blendedInflation,
    yearsToRetirement
  );
  const monthlyExpenseAtRetirement = annualExpenseAtRetirement / 12;

  // Step 3: Required corpus (growing annuity)
  const requiredCorpus = calcRetirementCorpus(
    annualExpenseAtRetirement,
    inputs.postRetirementReturn,
    blendedInflation,
    retirementDuration
  );

  // Step 4: Add emergency buffer
  const corpusWithBuffer = requiredCorpus * (1 + inputs.emergencyBufferPct);

  // Step 5: Offset existing savings
  const existingSavingsFV = calcExistingSavingsFV(
    inputs.existingSavings,
    inputs.preRetirementReturn,
    yearsToRetirement
  );
  const remainingCorpus = Math.max(corpusWithBuffer - existingSavingsFV, 0);

  // Step 6: Required monthly SIP with step-up
  const requiredMonthlySIP = calcRequiredSIP(
    remainingCorpus,
    inputs.preRetirementReturn,
    inputs.annualStepUp,
    yearsToRetirement
  );

  // "In today's money" — what the retirement expense feels like today
  const todaysMoneyEquivalent = monthlyExpenseAtRetirement / Math.pow(1 + blendedInflation, yearsToRetirement);

  const partialResult = {
    requiredMonthlySIP,
    blendedInflation,
    corpusWithBuffer,
    yearsToRetirement,
    retirementDuration,
    annualExpenseAtRetirement,
  };

  const yearlyBreakdown = calcYearlyBreakdown(inputs, partialResult);

  return {
    yearsToRetirement,
    retirementDuration,
    blendedInflation,
    annualExpenseAtRetirement,
    monthlyExpenseAtRetirement,
    requiredCorpus,
    corpusWithBuffer,
    existingSavingsFV,
    remainingCorpus,
    requiredMonthlySIP,
    todaysMoneyEquivalent,
    yearlyBreakdown,
  };
}
