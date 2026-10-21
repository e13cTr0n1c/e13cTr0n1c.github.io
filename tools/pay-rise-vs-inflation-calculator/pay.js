/* Pay rise vs inflation engine for Plain Sums.
 * CPI, 12 months to September 2026: 3.5%
 *   https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/september2026
 * Checked 21 October 2026.
 */
(function (root) {
  "use strict";
  var PAY_CPI = { cpi: 3.5, period: "the 12 months to September 2026", checked: "21 October 2026" };
  var PERIODS = { annual: "a year", monthly: "a month", hourly: "an hour" };
  function r2(n) { return Math.round((n + (n >= 0 ? 1e-9 : -1e-9)) * 100) / 100; }
  function r1(n) { return Math.round((n + (n >= 0 ? 1e-9 : -1e-9)) * 10) / 10; }
  function num(v) { if (v === "" || v === null || v === undefined) return null; var n = Number(v); return isFinite(n) ? n : NaN; }
  function check(n, label) {
    if (n === null) return "Enter your " + label + " pay.";
    if (isNaN(n) || n <= 0) return "Enter an amount above £0.";
    if (n > 1e8) return "Enter an amount under £100,000,000.";
    return "";
  }
  // oldPay and newPay in the same units. period: annual, monthly or hourly.
  function compare(oldPay, newPay, period, c) {
    c = c || PAY_CPI; period = PERIODS[period] ? period : "annual";
    var o = num(oldPay), n = num(newPay), errors = {}, e;
    if ((e = check(o, "old"))) errors.oldPay = e;
    if ((e = check(n, "new"))) errors.newPay = e;
    if (Object.keys(errors).length) return { ok: false, errors: errors };
    var f = 1 + c.cpi / 100, needed = o * f, gap = n - needed;
    var level = Math.abs(gap) < 0.005;
    return { ok: true, errors: {}, period: period, per: PERIODS[period], cpi: c.cpi, oldPay: r2(o), newPay: r2(n),
      riseCash: r2(n - o), risePct: r1((n / o - 1) * 100),
      needed: r2(needed), neededRise: r2(needed - o),
      gap: level ? 0 : r2(gap), shortfall: gap < 0 && !level ? r2(-gap) : 0,
      realPct: level ? 0 : r1(((n / o) / f - 1) * 100),
      beats: !level && gap > 0, verdict: level ? "level" : gap > 0 ? "yes" : "no" };
  }
  var api = { PAY_CPI: PAY_CPI, PERIODS: PERIODS, compare: compare, r2: r2 };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.PAYCPI = api;
})(this);
