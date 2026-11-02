/* Minimum wage pay rise engine for Plain Sums. Pure logic, no DOM.
 * Take home pay reuses the Can I live on this wage? engine (../can-i-live-on-this-wage/budget.js),
 * which runs on the 2026/27 take home pay engine (../take-home-pay-calculator/pay.js).
 * Current rates from 1 April 2026: https://www.gov.uk/national-minimum-wage-rates
 * New rates from 1 April 2027 confirmed in the Budget on 28 October 2026 (Budget 2026 (HTML), HM Treasury):
 *   National Living Wage £13.21 (3.9%), 18 to 20 rate £11.27 (3.9%), 16 to 17 and apprentice rate £8.31,
 *   accommodation offset £11.53 a day. The government accepted the Low Pay Commission recommendations in full.
 *   https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html
 *   Earlier figure in this file was £13.20 for the 21 and over rate, as reported before the Budget.
 *   Budget 2026 OOTLAR Annex A keeps the Personal Allowance, bands and employee NI the same for 2027/28,
 *   so working out both sides on 2026/27 tax and NI gives the same answer as 2027/28.
 */
(function (root) {
  "use strict";
  var W = (typeof module !== "undefined" && module.exports) ? require("../can-i-live-on-this-wage/budget.js") : root.WageBudget;
  var MIN_WAGE = {
    checked: "28 October 2026",
    newStatus: "confirmed in the Budget on 28 October 2026",
    source: "https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html",
    bands: {
      "21plus": { label: "21 and over", name: "National Living Wage", current: 12.71, next: 13.21 },
      "18to20": { label: "18 to 20", name: "18 to 20 year old rate", current: 10.85, next: 11.27 }
    }
  };
  function r2(n) { return Math.round((n + (n >= 0 ? 1e-9 : -1e-9)) * 100) / 100; }
  function r1(n) { return Math.round((n + (n >= 0 ? 1e-9 : -1e-9)) * 10) / 10; }
  function side(p, rate) {
    return { hourly: rate, weeklyGross: r2(p.gross / 52), monthlyGross: p.monthlyGross, annualGross: p.gross,
      incomeTax: p.incomeTax, ni: p.ni, weeklyTake: r2(p.takeHome / 52), monthlyTake: p.monthly, annualTake: p.takeHome };
  }
  // input: { band: '21plus' or '18to20', hours, region: 'ruk' or 'scotland' }
  function compare(input, cfg) {
    cfg = cfg || MIN_WAGE;
    var b = cfg.bands[input.band] ? input.band : "21plus", band = cfg.bands[b];
    var a = W.pay(band.current, input.hours, input.region), n = W.pay(band.next, input.hours, input.region);
    if (!a.ok) return { ok: false, errors: a.errors };
    var o = side(a, band.current), w = side(n, band.next);
    return { ok: true, errors: {}, band: b, label: band.label, name: band.name, region: a.region, old: o, "new": w,
      hourlyRise: r2(band.next - band.current), risePct: r1((band.next / band.current - 1) * 100),
      rise: { weeklyGross: r2(w.weeklyGross - o.weeklyGross), monthlyGross: r2(w.monthlyGross - o.monthlyGross), annualGross: r2(w.annualGross - o.annualGross),
        weeklyTake: r2(w.weeklyTake - o.weeklyTake), monthlyTake: r2(w.monthlyTake - o.monthlyTake), annualTake: r2(w.annualTake - o.annualTake) } };
  }
  var api = { MIN_WAGE: MIN_WAGE, compare: compare };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.MinWageRise = api;
})(this);
