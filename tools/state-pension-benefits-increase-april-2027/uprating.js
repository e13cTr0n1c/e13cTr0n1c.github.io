/* April 2027 uprating engine for Plain Sums.
 *
 * Every percentage and rate lives in UPRATING_2027 so it can be updated in one place after the
 * Budget on 28 October 2026. See UPRATING_UPDATE.md in this folder.
 *
 * Sources, checked 21 October 2026 (CPI confirmed on the ONS release of 21 October 2026):
 *  CPI 12 months to September 2026: 3.5%
 *    https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/september2026
 *  Average weekly earnings, Great Britain, May to July 2026: total pay 3.9%, regular pay 3.5%
 *    https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/averageweeklyearningsingreatbritain/september2026
 *  Triple lock (highest of earnings, CPI or 2.5%): https://www.gov.uk/new-state-pension/what-youll-get
 *    The earnings figure used by convention is total pay for May to July, so the expected rise is 3.9%.
 *  Confirmed 28 October 2026, full new State Pension from 6 April 2027: £13,036.40 a year (£250.70 a week,
 *    a 3.9% rise). Source: HM Treasury, Pension Tax Allowance Explainer, published 28 October 2026
 *    https://www.gov.uk/government/publications/pension-tax-allowance-explainer/pension-tax-allowance-explainer
 *    Budget 2026 (HTML) confirms the triple lock applies through to April 2029
 *    https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html
 *    The government rounds £241.30 x 1.039 (£250.71) down to £250.70, so the full rate uses the official figure.
 *  Still expected: basic State Pension and the CPI linked benefits. DWP had not published "Benefit and
 *    pension rates 2027 to 2028" on GOV.UK when checked on 28 October 2026, so those stay estimates.
 *  2026/27 weekly rates (GOV.UK):
 *    New State Pension £241.30  https://www.gov.uk/new-state-pension/what-youll-get
 *    Basic State Pension £184.90  https://www.gov.uk/state-pension/how-much-you-get
 *    PIP daily living £76.70 / £114.60, mobility £30.30 / £80.00  https://www.gov.uk/pip/how-much-youll-get
 *    DLA care £30.30 / £76.70 / £114.60, mobility £30.30 / £80.00  https://www.gov.uk/disability-living-allowance-children/rates
 *    Attendance Allowance £76.70 / £114.60  https://www.gov.uk/attendance-allowance/what-youll-get
 *    Carer's Allowance £86.45  https://www.gov.uk/carers-allowance/what-youll-get
 */
(function (root) {
  "use strict";
  var UPRATING_2027 = {
    status: "partial",             // "partial": full new State Pension confirmed, the rest expected until DWP publishes 2027/28 rates
    budgetDate: "28 October 2026",
    checked: "28 October 2026",
    effectiveFrom: "April 2027",
    cpi: 3.5,                      // CPI, 12 months to September 2026
    earningsTotal: 3.9,            // AWE total pay, May to July 2026
    earningsRegular: 3.5,          // AWE regular pay, May to July 2026 (for reference only)
    tripleLockFloor: 2.5,
    weeksPerYear: 52,
    benefits: [
      { id: "newSP", name: "New State Pension", rule: "tripleLock", full: 241.30, fullLabel: "full rate",
        confirmed: { weekly: 250.70, yearly: 13036.40, pct: 3.9, checked: "28 October 2026",
          source: "https://www.gov.uk/government/publications/pension-tax-allowance-explainer/pension-tax-allowance-explainer" } },
      { id: "basicSP", name: "Basic State Pension", rule: "tripleLock", full: 184.90, fullLabel: "full rate" },
      { id: "pipDaily", name: "PIP daily living", rule: "cpi", full: 114.60, fullLabel: "higher rate", rates: [76.70, 114.60] },
      { id: "pipMobility", name: "PIP mobility", rule: "cpi", full: 80.00, fullLabel: "higher rate", rates: [30.30, 80.00] },
      { id: "dla", name: "DLA (care and mobility together)", rule: "cpi", full: 194.60, fullLabel: "highest care plus higher mobility", rates: [30.30, 76.70, 114.60, 80.00] },
      { id: "aa", name: "Attendance Allowance", rule: "cpi", full: 114.60, fullLabel: "higher rate", rates: [76.70, 114.60] },
      { id: "carers", name: "Carer's Allowance", rule: "cpi", full: 86.45, fullLabel: "full rate" },
      { id: "otherCpi", name: "Other CPI linked benefit", rule: "cpi", full: null }
    ]
  };

  function r2(n) { return Math.round((n + 1e-9) * 100) / 100; }
  function num(v) { if (v === "" || v === null || v === undefined) return null; var n = Number(v); return isFinite(n) ? n : NaN; }
  function tripleLock(c) { c = c || UPRATING_2027; return Math.max(c.cpi, c.earningsTotal, c.tripleLockFloor); }
  function tripleLockDriver(c) { c = c || UPRATING_2027; var t = tripleLock(c); return t === c.earningsTotal ? "earnings" : t === c.cpi ? "CPI" : "the 2.5% floor"; }
  function pctFor(rule, c) { c = c || UPRATING_2027; return rule === "tripleLock" ? tripleLock(c) : c.cpi; }
  function find(id) { for (var i = 0; i < UPRATING_2027.benefits.length; i++) if (UPRATING_2027.benefits[i].id === id) return UPRATING_2027.benefits[i]; return null; }

  // official: a published 2027/28 weekly figure for the full rate, used when weekly is the full rate
  function uprate(weekly, rule, c, official) {
    c = c || UPRATING_2027;
    var p = pctFor(rule, c), raw = weekly * (1 + p / 100), nw = r2(raw), wk = c.weeksPerYear;
    if (official) { raw = official; nw = official; }
    return { pct: p, oldWeekly: r2(weekly), newWeekly: nw, increaseWeekly: r2(nw - weekly),
      old4: r2(weekly * 4), new4: r2(nw * 4), increase4: r2((nw - weekly) * 4),
      oldMonth: r2(weekly * wk / 12), newMonth: r2(raw * wk / 12), increaseMonth: r2((raw - weekly) * wk / 12),
      oldYear: r2(weekly * wk), newYear: r2(nw * wk), increaseYear: r2((nw - weekly) * wk) };
  }

  // inputs: { newSP: "241.30", pipDaily: "", ... }
  // freq: "weekly" (default) or "monthly". Monthly amounts are turned into weekly as x 12 / 52.
  function toWeekly(v, freq, c) { c = c || UPRATING_2027; return freq === "monthly" ? v * 12 / c.weeksPerYear : v; }
  function calculate(inputs, c, freq) {
    c = c || UPRATING_2027; inputs = inputs || {}; freq = freq === "monthly" ? "monthly" : "weekly";
    var max = freq === "monthly" ? 25000 : 5000;
    var rows = [], errors = {}, t = { oldWeekly: 0, newWeekly: 0 };
    c.benefits.forEach(function (b) {
      var v = num(inputs[b.id]);
      if (v === null || v === 0) return;
      if (isNaN(v) || v < 0 || v > max) { errors[b.id] = freq === "monthly" ? "Enter a monthly amount between £0 and £25,000." : "Enter a weekly amount between £0 and £5,000."; return; }
      var w = toWeekly(v, freq, c), off = b.confirmed && Math.abs(w - b.full) < 0.005 ? b.confirmed.weekly : null;
      var u = uprate(w, b.rule, c, off); u.id = b.id; u.name = b.name; u.rule = b.rule; u.confirmed = !!off; rows.push(u);
      t.oldWeekly += u.oldWeekly; t.newWeekly += u.newWeekly;
    });
    var tot = { oldWeekly: r2(t.oldWeekly), newWeekly: r2(t.newWeekly) };
    tot.increaseWeekly = r2(tot.newWeekly - tot.oldWeekly);
    tot.old4 = r2(tot.oldWeekly * 4); tot.new4 = r2(tot.newWeekly * 4); tot.increase4 = r2(tot.increaseWeekly * 4);
    tot.oldMonth = r2(tot.oldWeekly * c.weeksPerYear / 12); tot.newMonth = r2(tot.newWeekly * c.weeksPerYear / 12); tot.increaseMonth = r2(tot.increaseWeekly * c.weeksPerYear / 12);
    tot.oldYear = r2(tot.oldWeekly * c.weeksPerYear); tot.newYear = r2(tot.newWeekly * c.weeksPerYear); tot.increaseYear = r2(tot.increaseWeekly * c.weeksPerYear);
    return { ok: Object.keys(errors).length === 0, errors: errors, rows: rows, total: tot, status: c.status, freq: freq };
  }

  // Pay rise vs inflation. oldPay and newPay in the same units (a year, a month or an hour).
  function payVsInflation(oldPay, newPay, c) {
    c = c || UPRATING_2027;
    var o = num(oldPay), n = num(newPay), errors = {};
    if (o === null) errors.oldPay = "Enter your old pay."; else if (isNaN(o) || o <= 0 || o > 1e8) errors.oldPay = "Enter an amount above £0.";
    if (n === null) errors.newPay = "Enter your new pay."; else if (isNaN(n) || n <= 0 || n > 1e8) errors.newPay = "Enter an amount above £0.";
    if (Object.keys(errors).length) return { ok: false, errors: errors };
    var risePct = (n / o - 1) * 100, needed = o * (1 + c.cpi / 100), realPct = ((n / o) / (1 + c.cpi / 100) - 1) * 100;
    var realGain = n - needed;
    return { ok: true, errors: {}, oldPay: o, newPay: n, cpi: c.cpi,
      riseCash: r2(n - o), risePct: Math.round(risePct * 10) / 10, needed: r2(needed),
      realGain: r2(realGain), realPct: Math.round(realPct * 10) / 10,
      verdict: Math.abs(realGain) < 0.005 ? "level" : realGain > 0 ? "beating" : "behind" };
  }

  var api = { UPRATING_2027: UPRATING_2027, tripleLock: tripleLock, tripleLockDriver: tripleLockDriver, pctFor: pctFor, find: find, uprate: uprate, toWeekly: toWeekly, calculate: calculate, payVsInflation: payVsInflation };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.UPRATING = api;
})(this);
