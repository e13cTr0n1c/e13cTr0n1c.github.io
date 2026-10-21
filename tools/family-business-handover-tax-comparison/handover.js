/* Family business handover tax comparison. Pure logic, no DOM. Browser: window.Handover. Node: require.
   Compares two headline rates on the whole value, as the press reports of 18 and 19 October 2026 did.
   24% is the current higher rate of Capital Gains Tax: https://www.gov.uk/capital-gains-tax/rates
   45% is the additional rate of Income Tax: https://www.gov.uk/income-tax-rates
   Charging Income Tax on these handovers is a reported proposal, not law. */
(function (root) {
  "use strict";
  var RATES = { cgt: 0.24, incomeTax: 0.45 };
  var STAMP = "20 October 2026";
  function calculate(v) {
    var n = v === "" || v === null || v === undefined ? null : Number(String(v).replace(/[£,\s]/g, ""));
    if (n === null) return { error: true, errors: { value: "Enter the value being handed over." } };
    if (!isFinite(n) || n < 0 || n > 1000000000) return { error: true, errors: { value: "Enter an amount between £0 and £1,000,000,000." } };
    var cgt = n * RATES.cgt, it = n * RATES.incomeTax;
    return { error: false, value: n, cgt: cgt, incomeTax: it, difference: it - cgt, keptCgt: n - cgt, keptIt: n - it };
  }
  var api = { RATES: RATES, STAMP: STAMP, calculate: calculate,
    ctaHref: function (url, ref) {
      url = String(url || "").trim();
      if (!/^https:\/\/[^\s]+$/i.test(url)) return "";
      if (/[?&]ref=/.test(url)) return url;
      return url + (url.indexOf("?") >= 0 ? "&" : "?") + "ref=" + encodeURIComponent(ref);
    } };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Handover = api;
})(typeof window !== "undefined" ? window : this);
