/* Business Asset Disposal Relief estimate: the £1 million limit before 6 April 2027 against the £500,000 limit from that date.
   Pure logic, no DOM. Works in the browser (window.Badr) and in Node (require).
   Figures checked 29 October 2026 against GOV.UK: the BADR lifetime limit policy paper, Budget 2026 Annex A and the Capital Gains Tax rates page. */
(function (root) {
  "use strict";
  var COMMON = { badrRate: 0.18, cgtBasic: 0.18, cgtHigher: 0.24, aea: 3000, basicBand: 37700, changeDate: "2027-04-06" };
  var RULES = {
    before: { label: "Before 6 April 2027", limit: 1000000, taxYear: "2026 to 2027" },
    after: { label: "On or after 6 April 2027", limit: 500000, taxYear: "2027 to 2028" }
  };
  var SOURCES = {
    paper: "https://www.gov.uk/government/publications/capital-gains-tax-reduction-in-the-business-asset-disposal-relief-lifetime-limit/capital-gains-tax-new-business-asset-disposal-relief-lifetime-limit",
    annexA: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances",
    cgtRates: "https://www.gov.uk/capital-gains-tax/rates",
    badr: "https://www.gov.uk/business-asset-disposal-relief"
  };
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { if (v === "" || v === undefined || v === null) return 0; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function taxUnder(rule, gain, used, income) {
    var limit = RULES[rule].limit, room = Math.max(0, limit - used);
    var relieved = Math.min(gain, room), other = gain - relieved;
    // Annual exempt amount goes against the gains taxed at the highest rate first.
    var aeaOther = Math.min(COMMON.aea, other), aeaRelieved = Math.min(COMMON.aea - aeaOther, relieved);
    var relievedTaxed = relieved - aeaRelieved, otherTaxed = other - aeaOther;
    // Relieved gains use up any basic rate band first; other gains get what is left.
    var bandLeft = Math.max(0, COMMON.basicBand - income - relievedTaxed);
    var atBasic = Math.min(otherTaxed, bandLeft), atHigher = otherTaxed - atBasic;
    var badrTax = relievedTaxed * COMMON.badrRate, otherTax = atBasic * COMMON.cgtBasic + atHigher * COMMON.cgtHigher;
    return { limit: limit, limitLeft: room, relieved: relieved, other: other, aeaUsed: aeaOther + aeaRelieved, atBasic: atBasic, atHigher: atHigher, badrTax: r2(badrTax), otherTax: r2(otherTax), tax: r2(badrTax + otherTax) };
  }
  function ruleForDate(d) {
    if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
    return d < COMMON.changeDate ? "before" : "after";
  }
  function calculate(input) {
    var gain = num(input.gain), used = num(input.used), income = num(input.income);
    if (isNaN(gain)) return { error: "Enter the gain as a number." };
    if (isNaN(used)) return { error: "Enter the relief you have already used as a number, or leave it blank." };
    if (isNaN(income)) return { error: "Enter your taxable income as a number, or leave it blank." };
    var b = taxUnder("before", gain, used, income), a = taxUnder("after", gain, used, income);
    return { error: false, gain: gain, used: used, income: income, before: b, after: a, difference: r2(a.tax - b.tax), rule: ruleForDate(input.date) };
  }
  var api = { COMMON: COMMON, RULES: RULES, SOURCES: SOURCES, taxUnder: taxUnder, ruleForDate: ruleForDate, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Badr = api;
})(this);
