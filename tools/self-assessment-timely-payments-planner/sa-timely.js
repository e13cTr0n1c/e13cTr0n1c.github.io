/* Self Assessment timely payments cashflow planner. Pure logic, no DOM.
 * Browser: window.SATimely. Node: require.
 *
 * Sources, checked 29 October 2026:
 *  Timely payments in Income Tax Self Assessment factsheet (updated 28 October 2026):
 *    https://www.gov.uk/government/publications/fiscal-events-2026-factsheets/timely-payments-in-income-tax-self-assessment-factsheet--2
 *  Timely payments consultation outcome, summary of responses (updated 28 October 2026):
 *    https://www.gov.uk/government/consultations/timely-payments-in-income-tax-self-assessment/outcome/timely-payments-in-income-tax-self-assessment-itsa-summary-of-responses
 *
 * Confirmed: from April 2029 people who make Payments on Account pay smaller, regular in-year payments,
 *  automated (for example Direct Debit) by default, with an opt in to PAYE for those with enough PAYE income.
 *  Payments stay based on the previous year's tax. Returns are still due by 31 January.
 *  2029/30 is a transition year: the final payment for 2028/29 overlaps with the new payments.
 *  Frequency and timing are not decided. Current rules: two payments of half last year's bill,
 *  31 January in the year and 31 July after it, then a balancing payment on 31 January.
 *  Payments on Account are not needed if last year's bill was under £1,000 or over 80% was paid at source.
 * Assumptions, to be confirmed by HMRC: monthly or quarterly frequency and dates, that the balancing payment
 *  stays on 31 January, and that the 31 July 2029 second payment for 2028/29 is still due in the transition year.
 */
(function (root) {
  "use strict";
  var MONTHS = ["Apr 2029", "May 2029", "Jun 2029", "Jul 2029", "Aug 2029", "Sep 2029", "Oct 2029", "Nov 2029", "Dec 2029", "Jan 2030", "Feb 2030", "Mar 2030"];
  var PATTERNS = {
    steady: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    summer: [2, 2, 2, 2, 2, 2, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    winter: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 2, 2, 2, 2, 2, 2]
  };
  var POA_THRESHOLD = 1000;
  var JUL = 3, JAN = 9;
  var QUARTER_MONTHS = [2, 5, 8, 11]; // end of Jun, Sep, Dec, Mar: an assumption

  function r2(n) { return Math.round((n + (n >= 0 ? 1e-9 : -1e-9)) * 100) / 100; }
  function num(v, dflt) {
    if (v === "" || v === null || v === undefined) return dflt;
    var n = Number(String(v).replace(/[£,\s]/g, ""));
    return isFinite(n) ? n : NaN;
  }
  function zeros() { return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; }
  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }

  // Split an amount evenly across n payments, putting any rounding pennies in the last one.
  function split(amount, n) {
    var each = Math.floor(amount * 100 / n) / 100;
    var out = []; for (var i = 0; i < n; i++) out.push(each);
    out[n - 1] = r2(amount - each * (n - 1));
    return out;
  }

  // Biggest amount you would have paid ahead of setting it aside from income in the year.
  function buffer(payments, weights, bill) {
    var w = sum(weights), paid = 0, saved = 0, worst = 0;
    for (var i = 0; i < 12; i++) {
      paid += payments[i]; saved += bill * weights[i] / w;
      worst = Math.max(worst, paid - saved);
    }
    return r2(worst);
  }

  // input: { lastBill, balancing (optional, default 0), pattern: steady|summer|winter }
  function calculate(input) {
    input = input || {};
    var errors = {};
    var bill = num(input.lastBill, null);
    if (bill === null) return { error: true, empty: true, errors: {} };
    if (isNaN(bill) || bill < 0 || bill > 10000000) errors.lastBill = "Enter last year's Self Assessment bill between £0 and £10,000,000.";
    var bal = num(input.balancing, 0);
    if (isNaN(bal) || bal < 0 || bal > 10000000) errors.balancing = "Enter a balancing payment between £0 and £10,000,000.";
    if (Object.keys(errors).length) return { error: true, errors: errors };
    var pattern = PATTERNS[input.pattern] ? input.pattern : "steady";
    var weights = PATTERNS[pattern];
    var inScope = bill >= POA_THRESHOLD;
    var half = Math.floor(bill * 50 + 1e-6) / 100; // half of last year's bill, rounded down to the penny (my assumption)

    // Current rules in 2029/30: 31 Jul 2029 second payment for 2028/29, 31 Jan 2030 balancing for 2028/29
    // plus first payment for 2029/30.
    var current = zeros();
    current[JUL] = half;
    current[JAN] = r2(bal + half);

    // New rules in 2029/30 (transition): the 2028/29 July and January payments still fall due,
    // and the whole of last year's bill is paid in year, monthly or quarterly.
    function newSchedule(n, idx) {
      var s = zeros(), parts = split(bill, n);
      s[JUL] += half; s[JAN] += bal;
      idx.forEach(function (m, i) { s[m] = r2(s[m] + parts[i]); });
      return s;
    }
    var monthlyIdx = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    var monthly = inScope ? newSchedule(12, monthlyIdx) : current.slice();
    var quarterly = inScope ? newSchedule(4, QUARTER_MONTHS) : current.slice();
    if (!inScope) { current = zeros(); current[JAN] = r2(bal); monthly = current.slice(); quarterly = current.slice(); }

    // A normal year after the transition: only the in-year payments for that year (balancing aside).
    var steadyMonthly = zeros(), steadyQuarterly = zeros();
    if (inScope) {
      split(bill, 12).forEach(function (p, i) { steadyMonthly[i] = p; });
      split(bill, 4).forEach(function (p, i) { steadyQuarterly[QUARTER_MONTHS[i]] = p; });
    }
    var totals = { current: r2(sum(current)), monthly: r2(sum(monthly)), quarterly: r2(sum(quarterly)) };
    return {
      error: false,
      errors: {},
      inScope: inScope,
      lastBill: r2(bill),
      balancing: r2(bal),
      pattern: pattern,
      months: MONTHS,
      currentDates: [
        { date: "31 January", what: "First payment on account, half of last year's bill", amount: inScope ? half : 0 },
        { date: "31 July", what: "Second payment on account, half of last year's bill", amount: inScope ? half : 0 },
        { date: "31 January after the year", what: "Balancing payment, anything still owed", amount: r2(bal) }
      ],
      transition: { current: current, monthly: monthly, quarterly: quarterly },
      totals: totals,
      extraMonthly: r2(totals.monthly - totals.current),
      extraQuarterly: r2(totals.quarterly - totals.current),
      peakMonthly: r2(Math.max.apply(null, monthly)),
      peakQuarterly: r2(Math.max.apply(null, quarterly)),
      regularMonthly: inScope ? split(bill, 12)[0] : 0,
      regularQuarterly: inScope ? split(bill, 4)[0] : 0,
      bufferMonthly: inScope ? buffer(steadyMonthly, weights, bill) : 0,
      bufferQuarterly: inScope ? buffer(steadyQuarterly, weights, bill) : 0
    };
  }

  var api = { MONTHS: MONTHS, PATTERNS: PATTERNS, POA_THRESHOLD: POA_THRESHOLD, QUARTER_MONTHS: QUARTER_MONTHS, calculate: calculate, split: split };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SATimely = api;
})(typeof window !== "undefined" ? window : this);
