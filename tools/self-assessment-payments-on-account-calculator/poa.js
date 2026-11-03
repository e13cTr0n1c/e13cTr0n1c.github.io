/* Self Assessment payments on account engine for Plain Sums.
   Pure logic, no DOM. Works in the browser (window.POA) and in Node (require).
   Rules checked 3 November 2026 on GOV.UK: https://www.gov.uk/understand-self-assessment-bill/payments-on-account
   Each payment on account is half of last year's Self Assessment bill, due 31 January and 31 July.
   None are due if last year's bill was under £1,000, or more than 80% of the tax was paid outside Self Assessment. */
(function (root) {
  "use strict";
  var YEARS = {
    "2024-25": { label: "2024/25", next: "2025/26", jan: "31 January 2026", jul: "31 July 2026", nextJan: "31 January 2027" },
    "2025-26": { label: "2025/26", next: "2026/27", jan: "31 January 2027", jul: "31 July 2027", nextJan: "31 January 2028" }
  };
  var THRESHOLD = 1000, AT_SOURCE_LIMIT = 0.8;
  var SOURCES = { poa: "https://www.gov.uk/understand-self-assessment-bill/payments-on-account" };
  function r2(n) { return Math.round(n * 100) / 100; }
  function half(n) { return Math.floor(n * 50) / 100; }
  function num(v) { if (v === "" || v === undefined || v === null) return null; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function calculate(input) {
    input = input || {};
    var y = YEARS[input.year];
    if (!y) return { error: "Pick the tax year of the bill." };
    var bill = num(input.bill), src = num(input.atSource), paid = num(input.poaPaid), exp = num(input.expected);
    if (bill === null) return { error: "Enter your Self Assessment bill to see your payments." };
    if (isNaN(bill)) return { error: "Enter your bill as a number of £0 or more." };
    if (isNaN(src)) return { error: "Enter the tax taken at source as a number, or leave it blank." };
    if (isNaN(paid)) return { error: "Enter the payments on account you made as a number, or leave it blank." };
    if (isNaN(exp)) return { error: "Enter your expected bill as a number, or leave it blank." };
    src = src || 0; paid = paid || 0;
    var total = bill + src;
    var under = bill < THRESHOLD;
    var mostlySource = total > 0 && src > AT_SOURCE_LIMIT * total;
    var needed = !under && !mostlySource;
    var poa = needed ? half(bill) : 0;
    var balancing = r2(Math.max(0, bill - paid));
    var overpaid = r2(Math.max(0, paid - bill));
    var reduced = null;
    if (needed && exp !== null && exp < bill) {
      var rp = half(exp);
      reduced = { each: rp, jan: r2(Math.max(0, balancing + rp - overpaid)), saving: r2((poa - rp) * 2) };
    }
    return {
      error: false, year: input.year, label: y.label, next: y.next, jan: y.jan, jul: y.jul, nextJan: y.nextJan,
      bill: bill, atSource: src, total: total, sourceShare: total > 0 ? r2(src / total * 100) : 0,
      under: under, mostlySource: mostlySource, needed: needed,
      poa: poa, balancing: balancing, overpaid: overpaid,
      janTotal: r2(Math.max(0, balancing + poa - overpaid)), julTotal: poa,
      yearTotal: r2(Math.max(0, balancing + poa - overpaid) + poa),
      reduced: reduced
    };
  }
  var api = { YEARS: YEARS, THRESHOLD: THRESHOLD, AT_SOURCE_LIMIT: AT_SOURCE_LIMIT, SOURCES: SOURCES, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.POA = api;
})(this);
