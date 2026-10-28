/* Landlord property income tax estimate, 2026 to 2027 against 2027 to 2028 (Budget 2026).
   Pure logic, no DOM. Works in the browser (window.PropertyTax) and in Node (require).
   England, Wales and Northern Ireland. Figures checked 28 October 2026 against Budget 2026 OOTLAR Annex A. */
(function (root) {
  "use strict";
  var COMMON = { personalAllowance: 12570, taperStart: 100000, basicBand: 37700, higherLimit: 125140 };
  var YEARS = {
    "2026-27": { label: "2026 to 2027", main: [0.20, 0.40, 0.45], property: [0.20, 0.40, 0.45], financeCredit: 0.20, creditConfirmed: true },
    "2027-28": { label: "2027 to 2028", main: [0.20, 0.40, 0.45], property: [0.24, 0.44, 0.49], financeCredit: 0.24, creditConfirmed: false }
  };
  var SOURCES = {
    annexA: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances",
    ootlar: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar",
    finance: "https://www.gov.uk/guidance/changes-to-tax-relief-for-residential-landlords-how-its-worked-out-including-case-studies"
  };
  function r2(n) { return Math.round(n * 100) / 100; }
  function personalAllowance(total) { return Math.max(0, COMMON.personalAllowance - Math.max(0, Math.floor((total - COMMON.taperStart) / 2))); }
  function bandTax(from, amount, rates) {
    var tax = 0, pos = from, left = amount, edges = [COMMON.basicBand, COMMON.higherLimit, Infinity];
    for (var i = 0; i < 3 && left > 0; i++) { var take = Math.min(Math.max(0, edges[i] - pos), left); tax += take * rates[i]; pos += take; left -= take; }
    return tax;
  }
  function incomeTax(year, salary, profit, finance) {
    var y = YEARS[year], pa = personalAllowance(salary + profit);
    var ns = Math.max(0, salary - pa), paLeft = Math.max(0, pa - salary), pr = Math.max(0, profit - paLeft);
    var gross = bandTax(0, ns, y.main) + bandTax(ns, pr, y.property);
    var credit = Math.min(gross, y.financeCredit * Math.min(finance, profit));
    return { personalAllowance: pa, propertyTaxable: pr, gross: r2(gross), credit: r2(credit), total: r2(gross - credit) };
  }
  function num(v) { if (v === "" || v === undefined || v === null) return 0; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function calculate(input) {
    var s = num(input.salary), p = num(input.profit), f = num(input.finance);
    if (isNaN(s)) return { error: "Enter your other yearly income before tax as a number." };
    if (isNaN(p)) return { error: "Enter your rental profit as a number." };
    if (isNaN(f)) return { error: "Enter your mortgage interest as a number, or leave it blank." };
    var out = { error: false, salary: s, profit: p, finance: f, years: {} };
    Object.keys(YEARS).forEach(function (k) {
      var a = incomeTax(k, s, p, f), b = incomeTax(k, s, 0, 0);
      out.years[k] = { tax: r2(a.total - b.total), detail: a };
    });
    out.rise = r2(out.years["2027-28"].tax - out.years["2026-27"].tax);
    return out;
  }
  var api = { COMMON: COMMON, YEARS: YEARS, SOURCES: SOURCES, incomeTax: incomeTax, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.PropertyTax = api;
})(this);
