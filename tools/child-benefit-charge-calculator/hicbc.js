/* High Income Child Benefit Charge engine for Plain Sums.
 *
 * All rates and thresholds live in CONFIG, one entry per tax year, so they are easy to update
 * (for example after the Budget on 28 October 2026).
 *
 * Sources, checked 20 October 2026:
 *  Child Benefit weekly rates by tax year (eldest or only child / each other child):
 *    2024/25 £25.60 / £16.95, 2025/26 £26.05 / £17.25, 2026/27 £27.05 / £17.90
 *    https://www.gov.uk/government/publications/rates-and-allowances-tax-credits-child-benefit-and-guardians-allowance/tax-credits-child-benefit-and-guardians-allowance
 *  2026/27 confirmed: written statement HCWS1100, 26 November 2025, and DWP "Benefit and pension rates 2026 to 2027"
 *    ("proposed" removed 16 February 2026); current rates also on https://www.gov.uk/child-benefit/what-youll-get
 *    https://questions-statements.parliament.uk/written-statements/detail/2025-11-26/hcws1100
 *    https://www.gov.uk/government/publications/benefit-and-pension-rates-2026-to-2027
 *  Charge: 1% for every £200 of adjusted net income over £60,000, full at £80,000, from 2024/25 onwards
 *    https://www.gov.uk/child-benefit-tax-charge
 *  Yearly amount = weekly rate x 52 (HMRC's own yearly figures, e.g. £26.05 = £1,354.60 a year)
 *    https://www.gov.uk/government/news/child-benefit-boost-for-millions-of-families
 */
(function (root) {
  "use strict";
  var CONFIG = {
    "2024-25": { label: "2024/25", eldestWeekly: 25.60, otherWeekly: 16.95, weeks: 52, threshold: 60000, stepIncome: 200, stepPct: 1, confirmed: true },
    "2025-26": { label: "2025/26", eldestWeekly: 26.05, otherWeekly: 17.25, weeks: 52, threshold: 60000, stepIncome: 200, stepPct: 1, confirmed: true },
    "2026-27": { label: "2026/27", eldestWeekly: 27.05, otherWeekly: 17.90, weeks: 52, threshold: 60000, stepIncome: 200, stepPct: 1, confirmed: true }
  };
  var YEARS = Object.keys(CONFIG);
  var BASIC_RELIEF = 0.2; // relief at source: you pay 80% of the gross contribution

  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { if (v === "" || v === null || v === undefined) return null; var n = Number(v); return isFinite(n) ? n : NaN; }

  function benefit(children, c) {
    if (children < 1) return 0;
    return r2((c.eldestWeekly + (children - 1) * c.otherWeekly) * c.weeks);
  }
  function fullAt(c) { return c.threshold + c.stepIncome * (100 / c.stepPct); }
  function percent(ani, c) {
    if (ani <= c.threshold) return 0;
    return Math.min(100, Math.floor((ani - c.threshold) / c.stepIncome) * c.stepPct);
  }

  function calculate(input) {
    input = input || {};
    var errors = {};
    var year = input.year || "2025-26", c = CONFIG[year];
    if (!c) errors.year = "Choose a tax year.";
    var children = num(input.children), income = num(input.income), pension = num(input.pension), gift = num(input.giftAid);
    if (children === null || isNaN(children) || children < 1 || children > 20 || Math.floor(children) !== children) errors.children = "Enter a whole number of children from 1 to 20.";
    if (income === null) errors.income = "Enter the higher earner's income.";
    else if (isNaN(income) || income < 0) errors.income = "Enter an amount of £0 or more.";
    if (pension === null) pension = 0; else if (isNaN(pension) || pension < 0) errors.pension = "Enter an amount of £0 or more.";
    if (gift === null) gift = 0; else if (isNaN(gift) || gift < 0) errors.giftAid = "Enter an amount of £0 or more.";
    if (Object.keys(errors).length) return { error: true, errors: errors };

    var ani = Math.max(0, income - pension - gift);
    var cb = benefit(children, c);
    var pct = percent(ani, c);
    var charge = Math.floor(r2(cb * pct / 100)); // HMRC rounds the charge down to whole pounds
    var gross = Math.max(0, r2(ani - c.threshold));
    return {
      error: false, errors: {}, year: year, config: c, children: children,
      income: income, pension: pension, giftAid: gift, ani: ani,
      benefit: cb, percent: pct, charge: charge, keep: r2(cb - charge),
      fullAt: fullAt(c),
      pensionGrossToThreshold: gross,
      pensionNetToThreshold: r2(gross * (1 - BASIC_RELIEF)),
      pensionSaving: charge
    };
  }

  var api = { CONFIG: CONFIG, YEARS: YEARS, calculate: calculate, benefit: benefit, percent: percent };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.HICBC = api;
})(this);
