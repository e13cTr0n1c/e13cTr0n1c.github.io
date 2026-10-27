/* Will I pay tax on my State Pension? Pure logic, no DOM.
 * Browser: window.StatePensionTax. Node: require.
 * Reuses Income Tax bands and Personal Allowance taper from
 * ../take-home-pay-calculator/pay.js. No National Insurance:
 * people over State Pension age do not pay employee NI.
 *
 * Sources, checked 27 October 2026:
 *  Personal Allowance £12,570 (frozen): https://www.gov.uk/income-tax-rates
 *  How State Pension is taxed: https://www.gov.uk/guidance/how-your-state-pension-is-taxed
 *  Full new State Pension 2026/27 £241.30 a week: https://www.gov.uk/new-state-pension/what-youll-get
 *  Expected full new State Pension 2027/28 £13,036 a year: one config const below.
 *  Budget 2025 (HC 1492) para 4.167 and Budget speech: sole income basic/new State Pension
 *    and Simple Assessment from 2027-28. Mechanism still being explored.
 *    https://www.gov.uk/government/publications/budget-2025-document/budget-2025-html
 *    https://assets.publishing.service.gov.uk/media/6929b353345e31ab14ecf735/E03444720_Budget_2025_Web_Accessible.pdf
 *    https://www.gov.uk/government/speeches/budget-2025-speech
 *  Scottish Income Tax: https://www.gov.uk/scottish-income-tax
 */
(function (root) {
  "use strict";

  var Pay = (typeof module !== "undefined" && module.exports)
    ? require("../take-home-pay-calculator/pay.js")
    : root.Pay;

  // Expected full new State Pension for 2027/28. One place to update when GOV.UK confirms it.
  var EXPECTED_FULL_NEW_SP_2027_28 = 13036;

  var FULL_NEW_SP_2026_27_WEEKLY = 241.30;
  var FULL_NEW_SP_2026_27_YEARLY = Math.round(FULL_NEW_SP_2026_27_WEEKLY * 52 * 100) / 100; // 12547.60

  /* Flip on Budget day (28 October 2026) once GOV.UK confirms what happens.
   * mode: "compare" shows Scenario A and Scenario B side by side (default until Budget).
   *       "A" or "B" shows only that scenario once confirmed or ruled out.
   * Scenario A = current law, no change.
   * Scenario B = reported State Pension only relief (tax £0 if no other income;
   *   if other income, tax that other income in the normal way against the frozen
   *   Personal Allowance, treating the State Pension as covered). Not confirmed as fact.
   */
  var SP_ONLY_RELIEF_2027_28 = {
    mode: "compare", // "compare" | "A" | "B"
    pendingBudgetDate: "28 October 2026",
    budgetPara: "4.167",
    officialStatus: "exploring",
    officialSummary: "Budget 2025 said the government will ease the administrative burden so pensioners whose sole income is the basic or new State Pension without increments do not have to pay small amounts of tax via Simple Assessment from 2027/28 if the State Pension exceeds the Personal Allowance. It said the government is exploring the best way to achieve this and will set out more detail later.",
    sources: {
      budgetHtml: "https://www.gov.uk/government/publications/budget-2025-document/budget-2025-html",
      budgetPdf: "https://assets.publishing.service.gov.uk/media/6929b353345e31ab14ecf735/E03444720_Budget_2025_Web_Accessible.pdf",
      budgetSpeech: "https://www.gov.uk/government/speeches/budget-2025-speech"
    }
  };

  var YEARS = {
    "2026-27": {
      id: "2026-27",
      label: "2026/27",
      period: "6 April 2026 to 5 April 2027",
      fullNewSP: FULL_NEW_SP_2026_27_YEARLY,
      fullNewSPWeekly: FULL_NEW_SP_2026_27_WEEKLY,
      fullNewSPStatus: "confirmed",
      fullNewSPNote: "Full new State Pension £241.30 a week (£12,547.60 a year) on GOV.UK.",
      showReliefScenarios: false
    },
    "2027-28": {
      id: "2027-28",
      label: "2027/28",
      period: "6 April 2027 to 5 April 2028",
      fullNewSP: EXPECTED_FULL_NEW_SP_2027_28,
      fullNewSPWeekly: Math.round((EXPECTED_FULL_NEW_SP_2027_28 / 52) * 100) / 100,
      fullNewSPStatus: "expected",
      fullNewSPNote: "Expected full new State Pension £13,036 a year. Not yet confirmed on GOV.UK as a 2027/28 rate.",
      showReliefScenarios: true
    }
  };

  var SOURCES = [
    { label: "Income Tax rates and Personal Allowances (GOV.UK)", href: "https://www.gov.uk/income-tax-rates" },
    { label: "Income Tax rates and allowances, current and past (GOV.UK)", href: "https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past" },
    { label: "How your State Pension is taxed (GOV.UK)", href: "https://www.gov.uk/guidance/how-your-state-pension-is-taxed" },
    { label: "New State Pension: what you will get (GOV.UK)", href: "https://www.gov.uk/new-state-pension/what-youll-get" },
    { label: "Budget 2025 HTML, including para 4.167 on State Pension and Simple Assessment (GOV.UK)", href: SP_ONLY_RELIEF_2027_28.sources.budgetHtml },
    { label: "Budget 2025 PDF (HC 1492) para 4.167 (GOV.UK assets)", href: SP_ONLY_RELIEF_2027_28.sources.budgetPdf },
    { label: "Budget 2025 speech (GOV.UK / HM Treasury)", href: SP_ONLY_RELIEF_2027_28.sources.budgetSpeech },
    { label: "Scottish Income Tax (GOV.UK)", href: "https://www.gov.uk/scottish-income-tax" }
  ];

  function r2(n) { return Math.round((n + (n >= 0 ? 1e-9 : -1e-9)) * 100) / 100; }
  function num(v) {
    if (v === "" || v === null || v === undefined) return null;
    var n = Number(String(v).replace(/[£,\s]/g, ""));
    return isFinite(n) ? n : NaN;
  }

  function payConfig() { return Pay.CONFIGS[0]; }

  function taxOn(region, gross) {
    var it = Pay.incomeTax(payConfig(), region, gross, 0);
    return {
      personalAllowance: it.personalAllowance,
      taxable: r2(it.taxable),
      bands: it.parts,
      taxYear: r2(it.tax),
      taxMonth: r2(it.tax / 12)
    };
  }

  // Scenario A: current law. Tax State Pension plus other income in the normal way.
  function scenarioA(region, sp, other) {
    var total = r2(sp + other);
    var t = taxOn(region, total);
    var note;
    if (other === 0 && t.taxYear > 0.004) {
      note = "Current rules, no change. State Pension alone is taxed in the normal way against the frozen Personal Allowance of £12,570. HMRC usually collects any tax due by Simple Assessment when the State Pension is someone's only income.";
    } else if (other === 0) {
      note = "Current rules, no change. State Pension alone is within the frozen Personal Allowance of £12,570, so this estimate shows no Income Tax.";
    } else {
      note = "Current rules, no change. State Pension plus other taxable income are taxed in the normal way against the frozen Personal Allowance of £12,570.";
    }
    return {
      id: "A",
      label: "Scenario A: no change",
      pending: true,
      note: note,
      totalIncome: total,
      personalAllowance: t.personalAllowance,
      taxable: t.taxable,
      bands: t.bands,
      taxYear: t.taxYear,
      taxMonth: t.taxMonth,
      reliefApplied: false
    };
  }

  // Scenario B: reported State Pension only relief. Not confirmed as fact.
  // Sole income (other = 0): tax £0.
  // With other income: tax only the other income against the frozen Personal Allowance
  // (as if the State Pension were covered by a matched allowance, as some news reports describe).
  // Official Budget text covers sole income basic/new State Pension without increments;
  // the exact mechanism is still being explored.
  function scenarioB(region, sp, other) {
    var total = r2(sp + other);
    var sole = other === 0;
    var t, reliefApplied = true, note;
    if (sole) {
      t = { personalAllowance: sp, taxable: 0, bands: [], taxYear: 0, taxMonth: 0 };
      note = "Reported relief if State Pension is your only income: this estimate shows £0 Income Tax. Budget 2025 said people on the basic or new State Pension alone should not have to pay small amounts of tax via Simple Assessment from 2027/28. The exact mechanism is still being explored.";
    } else {
      t = taxOn(region, other);
      note = "Reported approach when you also have other taxable income: this estimate taxes only that other income against the frozen Personal Allowance, treating the State Pension as covered. That matches how some news reports describe raising the allowance to match the State Pension. It is not confirmed on GOV.UK as the chosen mechanism.";
    }
    return {
      id: "B",
      label: "Scenario B: reported State Pension only relief",
      pending: true,
      note: note,
      totalIncome: total,
      personalAllowance: t.personalAllowance,
      taxable: t.taxable,
      bands: t.bands,
      taxYear: t.taxYear,
      taxMonth: t.taxMonth,
      reliefApplied: reliefApplied,
      soleIncome: sole
    };
  }

  function scenariosFor(year, region, sp, other) {
    var y = YEARS[year];
    if (!y.showReliefScenarios) {
      var only = scenarioA(region, sp, other);
      only.pending = false;
      only.label = "Income Tax under current rules";
      return { mode: "single", list: [only] };
    }
    var mode = SP_ONLY_RELIEF_2027_28.mode;
    var a = scenarioA(region, sp, other);
    var b = scenarioB(region, sp, other);
    if (mode === "A") return { mode: "A", list: [a] };
    if (mode === "B") return { mode: "B", list: [b] };
    return { mode: "compare", list: [a, b] };
  }

  // input: { year, statePension, otherIncome, region: 'ruk'|'scotland' }
  function calculate(input) {
    input = input || {};
    var errors = {};
    var year = YEARS[input.year] ? input.year : "2027-28";
    var y = YEARS[year];
    var region = input.region === "scotland" ? "scotland" : "ruk";

    var spRaw = input.statePension, sp;
    if (spRaw === "" || spRaw === null || spRaw === undefined) sp = y.fullNewSP;
    else {
      sp = num(spRaw);
      if (isNaN(sp) || sp < 0 || sp > 1000000) errors.statePension = "Enter a yearly State Pension between £0 and £1,000,000.";
    }

    var otherRaw = input.otherIncome, other;
    if (otherRaw === "" || otherRaw === null || otherRaw === undefined) other = 0;
    else {
      other = num(otherRaw);
      if (isNaN(other) || other < 0 || other > 10000000) errors.otherIncome = "Enter other taxable income between £0 and £10,000,000.";
    }

    if (Object.keys(errors).length) return { error: true, errors: errors };

    var pack = scenariosFor(year, region, sp, other);
    var primary = pack.list[0];

    return {
      error: false,
      errors: {},
      year: year,
      yearLabel: y.label,
      period: y.period,
      region: region,
      statePension: r2(sp),
      otherIncome: r2(other),
      totalIncome: r2(sp + other),
      statePensionOnly: other === 0,
      fullNewSP: y.fullNewSP,
      fullNewSPWeekly: y.fullNewSPWeekly,
      fullNewSPStatus: y.fullNewSPStatus,
      fullNewSPNote: y.fullNewSPNote,
      showReliefScenarios: !!y.showReliefScenarios,
      scenarioMode: pack.mode,
      scenarios: pack.list,
      // convenience: primary / Scenario A figures for simple callers
      personalAllowance: primary.personalAllowance,
      taxable: primary.taxable,
      bands: primary.bands,
      taxYear: primary.taxYear,
      taxMonth: primary.taxMonth,
      overAllowance: primary.taxable > 0.004,
      relief: SP_ONLY_RELIEF_2027_28
    };
  }

  var api = {
    EXPECTED_FULL_NEW_SP_2027_28: EXPECTED_FULL_NEW_SP_2027_28,
    FULL_NEW_SP_2026_27_WEEKLY: FULL_NEW_SP_2026_27_WEEKLY,
    FULL_NEW_SP_2026_27_YEARLY: FULL_NEW_SP_2026_27_YEARLY,
    SP_ONLY_RELIEF_2027_28: SP_ONLY_RELIEF_2027_28,
    YEARS: YEARS,
    SOURCES: SOURCES,
    calculate: calculate,
    scenarioA: scenarioA,
    scenarioB: scenarioB
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.StatePensionTax = api;
})(typeof window !== "undefined" ? window : this);
