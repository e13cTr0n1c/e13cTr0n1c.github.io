/* Will I pay tax on my State Pension? Pure logic, no DOM.
 * Browser: window.StatePensionTax. Node: require.
 * Reuses Income Tax bands and Personal Allowance taper from
 * ../take-home-pay-calculator/pay.js. No National Insurance:
 * people over State Pension age do not pay employee NI.
 *
 * Sources, checked 27 October 2026:
 *  Personal Allowance £12,570 (frozen): https://www.gov.uk/income-tax-rates
 *    and https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past
 *  How State Pension is taxed (tax code / Simple Assessment):
 *    https://www.gov.uk/guidance/how-your-state-pension-is-taxed
 *  Full new State Pension 2026/27 £241.30 a week:
 *    https://www.gov.uk/new-state-pension/what-youll-get
 *  Expected full new State Pension 2027/28 £13,036 a year: one config const below.
 *    Built from ONS earnings growth (triple lock). Not yet on GOV.UK as a 2027/28 rate.
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

  var YEARS = {
    "2026-27": {
      id: "2026-27",
      label: "2026/27",
      period: "6 April 2026 to 5 April 2027",
      fullNewSP: FULL_NEW_SP_2026_27_YEARLY,
      fullNewSPWeekly: FULL_NEW_SP_2026_27_WEEKLY,
      fullNewSPStatus: "confirmed",
      fullNewSPNote: "Full new State Pension £241.30 a week (£12,547.60 a year) on GOV.UK."
    },
    "2027-28": {
      id: "2027-28",
      label: "2027/28",
      period: "6 April 2027 to 5 April 2028",
      fullNewSP: EXPECTED_FULL_NEW_SP_2027_28,
      fullNewSPWeekly: Math.round((EXPECTED_FULL_NEW_SP_2027_28 / 52) * 100) / 100,
      fullNewSPStatus: "expected",
      fullNewSPNote: "Expected full new State Pension £13,036 a year. Not yet confirmed on GOV.UK as a 2027/28 rate."
    }
  };

  var SOURCES = [
    { label: "Income Tax rates and Personal Allowances (GOV.UK)", href: "https://www.gov.uk/income-tax-rates" },
    { label: "Income Tax rates and allowances, current and past (GOV.UK)", href: "https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past" },
    { label: "How your State Pension is taxed (GOV.UK)", href: "https://www.gov.uk/guidance/how-your-state-pension-is-taxed" },
    { label: "New State Pension: what you will get (GOV.UK)", href: "https://www.gov.uk/new-state-pension/what-youll-get" },
    { label: "Scottish Income Tax (GOV.UK)", href: "https://www.gov.uk/scottish-income-tax" }
  ];

  function r2(n) { return Math.round((n + (n >= 0 ? 1e-9 : -1e-9)) * 100) / 100; }
  function num(v) {
    if (v === "" || v === null || v === undefined) return null;
    var n = Number(String(v).replace(/[£,\s]/g, ""));
    return isFinite(n) ? n : NaN;
  }

  function payConfig() {
    return Pay.CONFIGS[0];
  }

  // input: { year, statePension, otherIncome, region: 'ruk'|'scotland' }
  // Amounts are yearly. statePension defaults to the full new State Pension for the year.
  function calculate(input) {
    input = input || {};
    var errors = {};
    var year = YEARS[input.year] ? input.year : "2027-28";
    var y = YEARS[year];
    var region = input.region === "scotland" ? "scotland" : "ruk";

    var spRaw = input.statePension;
    var sp;
    if (spRaw === "" || spRaw === null || spRaw === undefined) {
      sp = y.fullNewSP;
    } else {
      sp = num(spRaw);
      if (isNaN(sp) || sp < 0 || sp > 1000000) errors.statePension = "Enter a yearly State Pension between £0 and £1,000,000.";
    }

    var otherRaw = input.otherIncome;
    var other;
    if (otherRaw === "" || otherRaw === null || otherRaw === undefined) {
      other = 0;
    } else {
      other = num(otherRaw);
      if (isNaN(other) || other < 0 || other > 10000000) errors.otherIncome = "Enter other taxable income between £0 and £10,000,000.";
    }

    if (Object.keys(errors).length) return { error: true, errors: errors };

    var total = r2(sp + other);
    var cfg = payConfig();
    var it = Pay.incomeTax(cfg, region, total, 0);
    var tax = r2(it.tax);

    return {
      error: false,
      errors: {},
      year: year,
      yearLabel: y.label,
      period: y.period,
      region: region,
      statePension: r2(sp),
      otherIncome: r2(other),
      totalIncome: total,
      personalAllowance: it.personalAllowance,
      taxable: r2(it.taxable),
      bands: it.parts,
      taxYear: tax,
      taxMonth: r2(tax / 12),
      fullNewSP: y.fullNewSP,
      fullNewSPWeekly: y.fullNewSPWeekly,
      fullNewSPStatus: y.fullNewSPStatus,
      fullNewSPNote: y.fullNewSPNote,
      overAllowance: total > it.personalAllowance,
      statePensionOnly: other === 0
    };
  }

  var api = {
    EXPECTED_FULL_NEW_SP_2027_28: EXPECTED_FULL_NEW_SP_2027_28,
    FULL_NEW_SP_2026_27_WEEKLY: FULL_NEW_SP_2026_27_WEEKLY,
    FULL_NEW_SP_2026_27_YEARLY: FULL_NEW_SP_2026_27_YEARLY,
    YEARS: YEARS,
    SOURCES: SOURCES,
    calculate: calculate
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.StatePensionTax = api;
})(typeof window !== "undefined" ? window : this);
