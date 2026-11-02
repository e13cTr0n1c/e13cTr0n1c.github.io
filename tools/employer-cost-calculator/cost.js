/* True cost of employing someone. Pure logic, no DOM. Browser: window.EmpCost. Node: require.
   Figures checked 30 October 2026 against GOV.UK: National Minimum Wage rates, Rates and thresholds for employers 2026 to 2027,
   Budget 2026 OOTLAR annex A, Employment Allowance guidance and the DWP review of the automatic enrolment thresholds for 2026/27. */
(function (root) {
  "use strict";
  var YEARS = {
    "2026": { label: "2026 to 2027", from: "now, from 6 April 2026", nlw: 12.71, niRate: 0.15, stAnnual: 5000, stWeekly: 96, ea: 10500,
      qeLower: 6240, qeUpper: 50270, trigger: 10000, tbc: [] },
    "2027": { label: "2027 to 2028", from: "from April 2027", nlw: 13.21, niRate: 0.15, stAnnual: 5000, stWeekly: 96, ea: 10500,
      qeLower: 6240, qeUpper: 50270, trigger: 10000, tbc: ["stAnnual", "qeLower", "qeUpper", "trigger"] }
  };
  var WEEKS = 52, HOLIDAY_WEEKS = 5.6, PENSION_RATE = 0.03;
  var SOURCES = {
    nmw: "https://www.gov.uk/national-minimum-wage-rates",
    employers: "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027",
    annexA: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances",
    ea: "https://www.gov.uk/claim-employment-allowance",
    eaElig: "https://www.gov.uk/claim-employment-allowance/eligibility",
    ae: "https://www.gov.uk/government/publications/review-of-the-automatic-enrolment-earnings-trigger-and-qualifying-earnings-band-for-202627/review-of-the-automatic-enrolment-earnings-trigger-and-qualifying-earnings-band-for-202627",
    holiday: "https://www.gov.uk/holiday-entitlement-rights"
  };
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { if (v === "" || v === null || v === undefined) return null; var n = Number(String(v).replace(/[£,\s]/g, "")); return isFinite(n) ? n : NaN; }
  // input: { year, rate, hours, pension (bool), ea (bool) }
  function calculate(input) {
    var y = YEARS[String(input.year)];
    if (!y) return { error: "Pick a tax year." };
    var rate = num(input.rate), hours = num(input.hours);
    if (rate === null) rate = y.nlw;
    if (isNaN(rate) || rate < 0 || rate > 1000) return { error: "Enter an hourly rate between £0 and £1,000." };
    if (hours === null || isNaN(hours) || hours <= 0 || hours > 100) return { error: "Enter hours a week between 1 and 100." };
    var gross = r2(rate * hours * WEEKS);
    var niBefore = r2(Math.max(0, gross - y.stAnnual) * y.niRate);
    var eaUsed = input.ea ? Math.min(niBefore, y.ea) : 0;
    var ni = r2(niBefore - eaUsed);
    var qualifying = Math.max(0, Math.min(gross, y.qeUpper) - y.qeLower);
    var pension = input.pension ? r2(qualifying * PENSION_RATE) : 0;
    var total = r2(gross + ni + pension);
    var paidHours = hours * WEEKS, workedHours = hours * (WEEKS - HOLIDAY_WEEKS);
    return {
      error: false, year: String(input.year), label: y.label, rate: rate, hours: hours, belowNlw: rate < y.nlw, nlw: y.nlw,
      gross: gross, niBefore: niBefore, eaUsed: r2(eaUsed), ni: ni, qualifying: r2(qualifying), pension: pension,
      autoEnrol: gross >= y.trigger, total: total, monthly: r2(total / 12),
      perPaidHour: r2(total / paidHours), perWorkedHour: r2(total / workedHours), onCost: r2(total - gross),
      tbc: y.tbc.slice()
    };
  }
  var api = { YEARS: YEARS, WEEKS: WEEKS, HOLIDAY_WEEKS: HOLIDAY_WEEKS, PENSION_RATE: PENSION_RATE, SOURCES: SOURCES, calculate: calculate, num: num };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.EmpCost = api;
})(typeof window !== "undefined" ? window : this);
