/* Plan 2 student loan threshold freeze. Pure logic, no DOM. Browser: window.SLFreeze. Node: require.
   Figures checked 31 October 2026 on GOV.UK: Budget 2025 (Plan 2 threshold frozen at £29,385 for three years from April 2027),
   Repaying your student loan: what you pay (2026 to 2027 thresholds and rates), and the OBR Economic and fiscal outlook October 2026
   (Table A.1 RPI forecast). Budget 2026 OOTLAR annex A has no student loan figures. */
(function (root) {
  "use strict";
  var FROZEN = 29385, RATE = 0.09, PG_RATE = 0.06;
  var YEARS = ["2027 to 2028", "2028 to 2029", "2029 to 2030"];
  // OBR October 2026 EFO Table A.1, RPI, calendar years 2026, 2027, 2028. Used as the default uplift for each April from 2027.
  var RPI_DEFAULT = [3.6, 4.3, 3.0];
  // 2026 to 2027 thresholds from GOV.UK. 2027 to 2028 onward not yet published for these plans: to be confirmed.
  var OTHER = {
    plan1: { name: "Plan 1", threshold: 26900, rate: RATE },
    plan4: { name: "Plan 4 (Scotland)", threshold: 33795, rate: RATE },
    plan5: { name: "Plan 5", threshold: 25000, rate: RATE },
    pg: { name: "Postgraduate Loan", threshold: 21000, rate: PG_RATE }
  };
  var SOURCES = {
    budget2025: "https://www.gov.uk/government/publications/budget-2025-document/budget-2025-html",
    budget2026: "https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html",
    whatYouPay: "https://www.gov.uk/repaying-your-student-loan/what-you-pay",
    obr: "https://www.gov.uk/government/publications/october-2026-economic-and-fiscal-outlook/economic-and-fiscal-outlook-october-2026",
    annexA: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances"
  };
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { if (v === "" || v === null || v === undefined) return null; var n = Number(String(v).replace(/[£,%\s]/g, "")); return isFinite(n) ? n : NaN; }
  function repay(pay, threshold, rate) { return r2(Math.max(0, pay - threshold) * rate); }
  // input: { salary, rise (%), rpi: [3 numbers in %], plans: ["plan1", ...] }
  function calculate(input) {
    var salary = num(input.salary), rise = num(input.rise);
    if (salary === null || isNaN(salary) || salary < 0 || salary > 1000000) return { error: "Enter a salary between £0 and £1,000,000." };
    if (rise === null) rise = 0;
    if (isNaN(rise) || rise < -50 || rise > 50) return { error: "Enter a pay rise between -50% and 50% a year." };
    var rpi = (input.rpi || RPI_DEFAULT).map(function (v, i) { var x = num(v); return x === null ? RPI_DEFAULT[i] : x; });
    for (var k = 0; k < 3; k++) if (isNaN(rpi[k]) || rpi[k] < -10 || rpi[k] > 20) return { error: "Enter RPI between -10% and 20% for each year." };
    var rows = [], pay = salary, upr = FROZEN, totF = 0, totR = 0;
    for (var i = 0; i < 3; i++) {
      pay = pay * (1 + rise / 100);
      upr = upr * (1 + rpi[i] / 100);
      var p = r2(pay), t = Math.round(upr);
      var f = repay(p, FROZEN, RATE), r = repay(p, t, RATE);
      var other = (input.plans || []).filter(function (id) { return OTHER[id]; }).map(function (id) {
        return { id: id, name: OTHER[id].name, threshold: OTHER[id].threshold, repay: repay(p, OTHER[id].threshold, OTHER[id].rate) };
      });
      rows.push({ year: YEARS[i], pay: p, frozen: FROZEN, uprated: t, repayFrozen: f, repayUprated: r, extra: r2(f - r), other: other });
      totF += f; totR += r;
    }
    return { error: false, salary: salary, rise: rise, rpi: rpi, rows: rows, totalFrozen: r2(totF), totalUprated: r2(totR), totalExtra: r2(totF - totR) };
  }
  var api = { FROZEN: FROZEN, RATE: RATE, PG_RATE: PG_RATE, YEARS: YEARS, RPI_DEFAULT: RPI_DEFAULT, OTHER: OTHER, SOURCES: SOURCES, calculate: calculate, repay: repay, num: num };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.SLFreeze = api;
})(typeof window !== "undefined" ? window : this);
