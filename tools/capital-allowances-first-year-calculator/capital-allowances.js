/* Capital allowances first year estimate for plant and machinery after Budget 2026.
   Pure logic, no DOM. Works in the browser (window.CapAllow) and in Node (require).
   Figures checked 29 October 2026 against the GOV.UK tax information and impact note and Budget 2026 Annex A. */
(function (root) {
  "use strict";
  var COMMON = { aia: 1000000, fullExpensing: 1, fyaOld: 0.40, fyaNew: 0.50, fyaDate: "2027-01-01", wdaOld: 0.14, wdaNew: 0.12, specialWda: 0.06, wdaDate: { company: "2027-04-01", unincorporated: "2027-04-06" } };
  var SOURCES = {
    tiin: "https://www.gov.uk/government/publications/reduce-the-main-rate-writing-down-allowance-and-increase-the-main-rate-first-year-allowance/capital-allowances-reduce-the-main-rate-writing-down-allowance-and-increase-the-main-rate-first-year-allowance",
    pub: "https://www.gov.uk/government/publications/reduce-the-main-rate-writing-down-allowance-and-increase-the-main-rate-first-year-allowance",
    annexA: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances"
  };
  var DAY = 86400000;
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { if (v === "" || v === undefined || v === null) return 0; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function isDate(d) { return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d + "T00:00:00Z")); }
  function ms(d) { return Date.parse(d + "T00:00:00Z"); }
  function fyaRate(spendDate) { return spendDate >= COMMON.fyaDate ? COMMON.fyaNew : COMMON.fyaOld; }
  // Main rate WDA for a 12 month period starting on `start`. A period spanning the change gets a time apportioned hybrid rate.
  function wdaRate(type, start) {
    var change = COMMON.wdaDate[type], s = ms(start), e = Date.UTC(new Date(s).getUTCFullYear() + 1, new Date(s).getUTCMonth(), new Date(s).getUTCDate()) - DAY, c = ms(change);
    if (s >= c) return { rate: COMMON.wdaNew, hybrid: false };
    if (e < c) return { rate: COMMON.wdaOld, hybrid: false };
    var total = (e - s) / DAY + 1, before = (c - s) / DAY;
    return { rate: (COMMON.wdaOld * before + COMMON.wdaNew * (total - before)) / total, hybrid: true, daysBefore: before, days: total };
  }
  function calculate(input) {
    var type = input.type === "company" ? "company" : "unincorporated", kind = input.kind === "used" ? "used" : "new";
    var spend = num(input.spend), aiaUsed = num(input.aiaUsed);
    if (isNaN(spend)) return { error: "Enter what you spent as a number." };
    if (isNaN(aiaUsed)) return { error: "Enter the Annual Investment Allowance already used as a number, or leave it blank." };
    if (!isDate(input.spendDate)) return { error: "Enter the date you spent the money." };
    var out = { error: false, type: type, kind: kind, spend: spend, fullExpensing: 0, aia: 0, fya: 0, fyaRate: 0, wda: 0, wdaRate: 0, hybrid: false, toPool: 0 };
    if (type === "company" && kind === "new") {
      out.fullExpensing = spend; out.method = "fullExpensing";
    } else {
      out.aia = Math.min(spend, Math.max(0, COMMON.aia - aiaUsed));
      var rest = spend - out.aia;
      if (kind === "new") {
        out.fyaRate = fyaRate(input.spendDate); out.fya = r2(rest * out.fyaRate); out.toPool = r2(rest - out.fya); out.method = "aiaFya";
      } else {
        if (!isDate(input.periodStart)) return { error: "Enter the date your accounting period starts." };
        var w = wdaRate(type, input.periodStart); out.wdaRate = w.rate; out.hybrid = w.hybrid; out.wda = r2(rest * w.rate); out.toPool = r2(rest - out.wda); out.method = "aiaWda";
      }
    }
    out.total = r2(out.fullExpensing + out.aia + out.fya + out.wda);
    return out;
  }
  var api = { COMMON: COMMON, SOURCES: SOURCES, fyaRate: fyaRate, wdaRate: wdaRate, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.CapAllow = api;
})(this);
