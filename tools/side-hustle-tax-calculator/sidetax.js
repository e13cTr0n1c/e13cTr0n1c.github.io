/* Side hustle tax engine for Plain Sums: Income Tax and Class 4 National Insurance on side profit on top of a salary.
   England, Wales and Northern Ireland bands only. Pure logic, no DOM.
   Checked 3 November 2026 on GOV.UK:
   https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past
   https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions
   https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income */
(function (root) {
  "use strict";
  var YEARS = {
    "2025-26": { label: "2025/26", pa: 12570, taper: 100000, basic: 37700, addl: 125140, lpl: 12570, upl: 50270, c4main: 0.06, c4upper: 0.02, spt: 6845, c2week: 3.50, allowance: 1000 },
    "2026-27": { label: "2026/27", pa: 12570, taper: 100000, basic: 37700, addl: 125140, lpl: 12570, upl: 50270, c4main: 0.06, c4upper: 0.02, spt: 7105, c2week: 3.65, allowance: 1000 }
  };
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { if (v === "" || v === undefined || v === null) return null; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function personalAllowance(income, y) { return Math.max(0, y.pa - Math.floor(Math.max(0, income - y.taper) / 2)); }
  function incomeTax(income, y) {
    var taxable = Math.max(0, income - personalAllowance(income, y));
    var b = Math.min(taxable, y.basic);
    var addlStart = y.addl - 0; // additional rate on taxable income over £125,140
    var h = Math.max(0, Math.min(taxable, addlStart) - y.basic);
    var a = Math.max(0, taxable - addlStart);
    return r2(b * 0.2 + h * 0.4 + a * 0.45);
  }
  function class4(p, y) { return r2(Math.max(0, Math.min(p, y.upl) - y.lpl) * y.c4main + Math.max(0, p - y.upl) * y.c4upper); }
  function calculate(input) {
    input = input || {};
    var y = YEARS[input.year];
    if (!y) return { error: "Pick a tax year." };
    var salary = num(input.salary), gross = num(input.gross), exp = num(input.expenses);
    if (gross === null) return { error: "Enter your side hustle takings to see the tax." };
    if (isNaN(salary) || isNaN(gross) || isNaN(exp)) return { error: "Enter amounts as numbers of £0 or more." };
    salary = salary || 0; exp = exp || 0;
    var covered = gross <= y.allowance;
    var withAllowance = r2(Math.max(0, gross - y.allowance)), withCosts = r2(Math.max(0, gross - exp));
    var method = covered ? "allowance" : (withCosts < withAllowance ? "costs" : "allowance");
    var profit = covered ? 0 : Math.min(withAllowance, withCosts);
    var taxBefore = incomeTax(salary, y), taxAfter = incomeTax(salary + profit, y);
    var extraTax = r2(taxAfter - taxBefore);
    var c4 = class4(profit, y);
    var total = r2(extraTax + c4);
    var marginal = profit > 0 ? r2(total / profit * 100) : 0;
    return {
      error: false, year: input.year, label: y.label, allowance: y.allowance, salary: salary, gross: gross, expenses: exp,
      covered: covered, mustRegister: gross > y.allowance, withAllowance: withAllowance, withCosts: withCosts, method: method,
      profit: profit, paBefore: personalAllowance(salary, y), paAfter: personalAllowance(salary + profit, y),
      extraTax: extraTax, class4: c4, total: total, effective: marginal,
      setAsidePct: gross > 0 ? r2(total / gross * 100) : 0,
      class2Credited: profit >= y.spt, spt: y.spt, c2year: r2(y.c2week * 52),
      poaLikely: total >= 1000,
      keep: r2(gross - exp - total)
    };
  }
  var api = { YEARS: YEARS, incomeTax: incomeTax, class4: class4, personalAllowance: personalAllowance, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.SideTax = api;
})(this);
