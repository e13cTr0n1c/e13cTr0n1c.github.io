/* Small business rate relief checker for retail, hospitality and leisure (RHL) properties in England: 2026 to 2027 against 2027 to 2028.
   Pure logic, no DOM. Works in the browser (window.Rhl) and in Node (require). Shows eligibility and relief percentages only, no multipliers.
   Figures checked 29 October 2026 against GOV.UK: Budget 2026 policy costings items 19 to 21 and the small business rate relief guide. */
(function (root) {
  "use strict";
  var YEARS = {
    "2026": { label: "2026 to 2027", full: 12000, taperEnd: 15000, pubRelief: 15 },
    "2027": { label: "2027 to 2028", full: 18000, taperEnd: 21000, pubRelief: 35 }
  };
  var LARGE_VENUE = 1000000;
  function num(v) { if (v === "" || v === undefined || v === null) return NaN; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function sbrr(y, rv) {
    if (rv <= y.full) return 100;
    if (rv >= y.taperEnd) return 0;
    return Math.round((y.taperEnd - rv) / (y.taperEnd - y.full) * 1000) / 10;
  }
  function calculate(input) {
    var y = YEARS[String(input.year)];
    if (!y) return { error: "Pick a year." };
    var rv = num(input.rv);
    if (isNaN(rv)) return { error: "Enter your rateable value as a number." };
    var kind = input.kind === "pub" ? "pub" : "rhl", onlyProperty = input.onlyProperty !== false;
    var s = onlyProperty ? sbrr(y, rv) : null;
    var pub = null, pubTbc = false;
    if (kind === "pub") {
      if (rv >= LARGE_VENUE && String(input.year) === "2027") { pub = null; pubTbc = true; }
      else pub = rv >= LARGE_VENUE ? 15 : y.pubRelief;
    }
    return { error: false, year: String(input.year), label: y.label, rv: rv, kind: kind, onlyProperty: onlyProperty, sbrr: s, full: y.full, taperEnd: y.taperEnd, pubRelief: pub, pubTbc: pubTbc, cpiCap: String(input.year) === "2027" };
  }
  var api = { YEARS: YEARS, LARGE_VENUE: LARGE_VENUE, sbrr: sbrr, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Rhl = api;
})(this);
