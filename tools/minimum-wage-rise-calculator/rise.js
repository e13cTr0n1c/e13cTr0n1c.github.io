/* Minimum wage pay rise engine for Plain Sums. Pure logic, no DOM.
 * Take home pay reuses the Can I live on this wage? engine (../can-i-live-on-this-wage/budget.js),
 * which runs on the 2026/27 take home pay engine (../take-home-pay-calculator/pay.js).
 * Current rates from 1 April 2026: https://www.gov.uk/national-minimum-wage-rates
 * New rates from 1 April 2027 are as reported, announced, to be confirmed in the 28 Oct Budget.
 *   Not yet on GOV.UK or in a Low Pay Commission report when checked on 26 October 2026.
 *   LPC central estimate for the 21 and over rate was £13.18 (range £13.02 to £13.34):
 *   https://www.gov.uk/government/consultations/low-pay-commission-consultation-2026/lpc-consultation-letter-2026
 */
(function (root) {
  "use strict";
  var W = (typeof module !== "undefined" && module.exports) ? require("../can-i-live-on-this-wage/budget.js") : root.WageBudget;
  var MIN_WAGE = {
    checked: "26 October 2026",
    newStatus: "announced, to be confirmed in the 28 Oct Budget",
    bands: {
      "21plus": { label: "21 and over", name: "National Living Wage", current: 12.71, next: 13.20 },
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
