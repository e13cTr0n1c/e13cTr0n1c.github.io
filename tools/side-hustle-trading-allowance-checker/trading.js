/* Trading allowance checker: 2026 to 2027 against 2027 to 2028.
   Pure logic, no DOM. Works in the browser (window.Trading) and in Node (require).
   Figures checked 29 October 2026 against GOV.UK: the trading allowance policy paper, Budget 2026 OOTLAR section 1.5 and the guidance on tax free allowances. */
(function (root) {
  "use strict";
  var YEARS = {
    "2026": { label: "2026 to 2027", allowance: 1000, reportOver: 1000 },
    "2027": { label: "2027 to 2028", allowance: 3000, reportOver: 3000 }
  };
  var SOURCES = {
    paper: "https://www.gov.uk/government/publications/income-tax-increasing-the-trading-allowance/increasing-the-trading-allowance",
    ootlar: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar",
    allowances: "https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income",
    platforms: "https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform"
  };
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { if (v === "" || v === undefined || v === null) return 0; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function calculate(input) {
    var y = YEARS[String(input.year)];
    if (!y) return { error: "Pick a tax year." };
    var gross = num(input.gross), expenses = num(input.expenses);
    if (isNaN(gross)) return { error: "Enter your income as a number." };
    if (isNaN(expenses)) return { error: "Enter your costs as a number, or leave them blank." };
    var covered = gross <= y.allowance;
    var withAllowance = r2(Math.max(0, gross - y.allowance));
    var withExpenses = r2(gross - expenses);
    var best = covered ? "allowance" : (withExpenses < withAllowance ? "expenses" : "allowance");
    return {
      error: false, year: String(input.year), label: y.label, allowance: y.allowance, gross: gross, expenses: expenses,
      covered: covered, mustReport: gross > y.reportOver,
      withAllowance: withAllowance, withExpenses: withExpenses, best: best,
      taxableProfit: covered ? 0 : Math.max(0, Math.min(withAllowance, withExpenses)),
      saving: covered ? 0 : r2(Math.abs(withAllowance - withExpenses))
    };
  }
  var api = { YEARS: YEARS, SOURCES: SOURCES, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Trading = api;
})(this);
