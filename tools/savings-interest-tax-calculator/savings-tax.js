/* Savings interest tax estimate, 2026 to 2027 against 2027 to 2028 (Budget 2026).
   Pure logic, no DOM. Works in the browser (window.SavingsTax) and in Node (require).
   Figures checked 28 October 2026 against Budget 2026 OOTLAR Annex A. England, Wales and Northern Ireland bands for earnings. */
(function (root) {
  "use strict";
  var COMMON = { personalAllowance: 12570, taperStart: 100000, basicBand: 37700, higherLimit: 125140, startingRateLimit: 5000, psaBasic: 1000, psaHigher: 500, psaAdditional: 0, isaAllowance: 20000 };
  var YEARS = {
    "2026-27": { label: "2026 to 2027", main: [0.20, 0.40, 0.45], savings: [0.20, 0.40, 0.45] },
    "2027-28": { label: "2027 to 2028", main: [0.20, 0.40, 0.45], savings: [0.24, 0.44, 0.49] }
  };
  var SOURCES = {
    annexA: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances",
    ootlar: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar",
    budget: "https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html"
  };
  function r2(n) { return Math.round(n * 100) / 100; }
  function personalAllowance(total) {
    var cut = Math.max(0, Math.floor((total - COMMON.taperStart) / 2));
    return Math.max(0, COMMON.personalAllowance - cut);
  }
  // Tax a slice of taxable income from position `from` (0 = first pound above allowances) at band rates.
  function bandTax(from, amount, rates) {
    var tax = 0, pos = from, left = amount, edges = [COMMON.basicBand, COMMON.higherLimit, Infinity];
    for (var i = 0; i < 3 && left > 0; i++) {
      var room = Math.max(0, edges[i] - pos), take = Math.min(room, left);
      tax += take * rates[i]; pos += take; left -= take;
    }
    return tax;
  }
  function incomeTax(year, salary, interest) {
    var y = YEARS[year], total = salary + interest, pa = personalAllowance(total);
    var nsTaxable = Math.max(0, salary - pa), paLeft = Math.max(0, pa - salary);
    var svTaxable = Math.max(0, interest - paLeft), totalTaxable = nsTaxable + svTaxable;
    var band = totalTaxable > COMMON.higherLimit ? "additional" : totalTaxable > COMMON.basicBand ? "higher" : "basic";
    var psa = band === "additional" ? COMMON.psaAdditional : band === "higher" ? COMMON.psaHigher : COMMON.psaBasic;
    var start = Math.min(svTaxable, Math.max(0, COMMON.startingRateLimit - nsTaxable));
    var psaUsed = Math.min(svTaxable - start, psa);
    var charged = svTaxable - start - psaUsed;
    var nsTax = bandTax(0, nsTaxable, y.main);
    var svTax = bandTax(nsTaxable + start + psaUsed, charged, y.savings);
    return { personalAllowance: pa, band: band, psa: psa, startingRateUsed: start, psaUsed: psaUsed, savingsCharged: charged, nonSavingsTax: r2(nsTax), savingsTax: r2(svTax), total: r2(nsTax + svTax) };
  }
  // Extra tax your interest causes (includes any Personal Allowance taper effect).
  function interestTax(year, salary, interest) {
    var withI = incomeTax(year, salary, interest), without = incomeTax(year, salary, 0);
    return { detail: withI, extra: r2(withI.total - without.total) };
  }
  function num(v) { if (v === "" || v === undefined || v === null) return 0; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function calculate(input) {
    var salary = num(input.salary), interest = num(input.interest), isaCash = num(input.isaCash), isaRate = num(input.isaRate);
    if (isNaN(salary)) return { error: "Enter your yearly pay before tax as a number." };
    if (isNaN(interest)) return { error: "Enter the interest you get in a year as a number." };
    if (isNaN(isaCash) || isNaN(isaRate)) return { error: "Enter the ISA amount and rate as numbers, or leave them blank." };
    var moved = Math.min(isaCash, COMMON.isaAllowance), movedInterest = Math.min(interest, r2(moved * isaRate / 100));
    var out = { salary: salary, interest: interest, isaMoved: moved, isaCapped: isaCash > COMMON.isaAllowance, movedInterest: movedInterest, years: {} };
    Object.keys(YEARS).forEach(function (k) {
      var a = interestTax(k, salary, interest), b = interestTax(k, salary, interest - movedInterest);
      out.years[k] = { tax: a.extra, detail: a.detail, taxAfterIsa: b.extra, isaSaving: r2(a.extra - b.extra) };
    });
    out.rise = r2(out.years["2027-28"].tax - out.years["2026-27"].tax);
    out.error = false;
    return out;
  }
  var api = { COMMON: COMMON, YEARS: YEARS, SOURCES: SOURCES, personalAllowance: personalAllowance, incomeTax: incomeTax, interestTax: interestTax, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.SavingsTax = api;
})(this);
