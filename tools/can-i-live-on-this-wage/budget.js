/* Can I live on this wage? Monthly budget engine for Plain Sums. Pure logic, no DOM.
 * Tax and National Insurance come from the take home pay calculator engine (../take-home-pay-calculator/pay.js),
 * 2026/27 rates checked against GOV.UK.
 * National Living Wage from 1 April 2026: £12.71 an hour, aged 21 and over
 *   https://www.gov.uk/national-minimum-wage-rates
 * JRF Minimum Income Standard 2026 (published 8 September 2026), food for a single working age adult:
 *   £79.71 a week in April 2026 prices, which is £345.41 a month (x 52 / 12), shown as £345
 *   https://www.jrf.org.uk/income-savings-and-debt/a-minimum-income-standard-for-the-united-kingdom-in-2026
 * Checked 21 October 2026.
 */
(function (root) {
  "use strict";
  var Pay = (typeof module !== "undefined" && module.exports) ? require("../take-home-pay-calculator/pay.js") : root.Pay;
  var WAGE = { nlw: 12.71, hours: 37.5, jrfFoodWeek: 79.71, jrfFoodMonth: 345, checked: "21 October 2026" };
  var LINES = ["rent", "bills", "councilTax", "transport", "food", "other"];
  function r2(n) { return Math.round((n + (n >= 0 ? 1e-9 : -1e-9)) * 100) / 100; }
  function num(v) { if (v === "" || v === null || v === undefined) return null; var n = Number(String(v).replace(/[£,\s]/g, "")); return isFinite(n) ? n : NaN; }

  // Yearly gross and take home from an hourly rate and weekly hours (52 weeks). region: 'ruk' or 'scotland'.
  function pay(hourly, hours, region) {
    var h = num(hourly), w = num(hours), errors = {};
    if (h === null) errors.hourly = "Enter your hourly rate.";
    else if (isNaN(h) || h <= 0 || h > 1000) errors.hourly = "Enter an hourly rate between £0 and £1,000.";
    if (w === null) errors.hours = "Enter your hours a week.";
    else if (isNaN(w) || w <= 0 || w > 100) errors.hours = "Enter between 0 and 100 hours a week.";
    if (Object.keys(errors).length) return { ok: false, errors: errors };
    var gross = h * w * 52;
    var c = Pay.calculate({ salary: gross, region: region === "scotland" ? "scotland" : "ruk", plan: "none", pensionPct: 0 });
    return { ok: true, errors: {}, region: c.region, gross: r2(gross), incomeTax: r2(c.incomeTax), ni: r2(c.ni), takeHome: r2(c.takeHome),
      monthlyGross: r2(gross / 12), monthlyTax: r2(c.incomeTax / 12), monthlyNi: r2(c.ni / 12), monthly: r2(c.takeHome / 12) };
  }

  // input: { hourly, hours, region, rent, bills, councilTax, transport, food, other, jrfFood: bool }
  function check(input) {
    var p = pay(input.hourly, input.hours, input.region), errors = p.ok ? {} : p.errors, costs = {}, total = 0;
    LINES.forEach(function (k) {
      if (k === "food" && input.jrfFood) { costs.food = WAGE.jrfFoodMonth; total += costs.food; return; }
      var v = num(input[k]);
      if (v === null) v = 0;
      if (isNaN(v) || v < 0 || v > 1e6) { errors[k] = "Enter an amount between £0 and £1,000,000."; return; }
      costs[k] = r2(v); total += v;
    });
    if (Object.keys(errors).length) return { ok: false, errors: errors };
    var diff = r2(p.monthly - total);
    return { ok: true, errors: {}, pay: p, costs: costs, totalCosts: r2(total), difference: diff,
      surplus: diff > 0 ? diff : 0, shortfall: diff < 0 ? -diff : 0, verdict: diff > 0 ? "surplus" : diff < 0 ? "shortfall" : "even",
      jrfFood: !!input.jrfFood };
  }
  var api = { WAGE: WAGE, LINES: LINES, pay: pay, check: check, r2: r2 };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.WageBudget = api;
})(typeof window !== "undefined" ? window : this);
