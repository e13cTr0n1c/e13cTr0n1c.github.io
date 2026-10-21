/* Making Tax Digital for Income Tax checker. Pure logic, no DOM. Browser: window.Mtd. Node: require.
   Thresholds and dates checked against GOV.UK on 20 October 2026:
   https://www.gov.uk/guidance/check-if-youre-eligible-for-making-tax-digital-for-income-tax
   https://www.gov.uk/guidance/work-out-your-qualifying-income-for-making-tax-digital-for-income-tax
   https://www.gov.uk/government/news/sole-traders-and-landlords-earning-more-than-30000-urged-to-act-now */
(function (root) {
  "use strict";
  // Each start date is judged on qualifying income for the tax year named here. The test is "more than".
  var STAGES = [
    { id: "y2425", start: "6 April 2026", startIso: "2026-04-06", threshold: 50000, taxYear: "2024 to 2025" },
    { id: "y2526", start: "6 April 2027", startIso: "2027-04-06", threshold: 30000, taxYear: "2025 to 2026" },
    { id: "y2627", start: "6 April 2028", startIso: "2028-04-06", threshold: 20000, taxYear: "2026 to 2027" }
  ];
  var MAX = 100000000;
  function num(v) {
    if (v === "" || v === null || v === undefined) return null;
    var n = Number(String(v).replace(/[£,\s]/g, ""));
    return isFinite(n) ? n : NaN;
  }
  // years: { y2425: { se, prop }, ... }. Blank fields count as 0 when the other field in that year is filled; a fully blank year is "not entered".
  function check(years) {
    var errors = {}, out = [], firstIn = null;
    STAGES.forEach(function (s) {
      var y = (years && years[s.id]) || {}, se = num(y.se), pr = num(y.prop);
      [["se", se], ["prop", pr]].forEach(function (f) {
        if (f[1] !== null && (isNaN(f[1]) || f[1] < 0 || f[1] > MAX)) errors[s.id + "-" + f[0]] = "Enter an amount between £0 and £100,000,000.";
      });
      var entered = se !== null || pr !== null;
      var q = entered ? (se || 0) + (pr || 0) : null;
      var over = entered && q > s.threshold;
      if (over && !firstIn) firstIn = s;
      out.push({ id: s.id, start: s.start, startIso: s.startIso, threshold: s.threshold, taxYear: s.taxYear, entered: entered, qualifying: q, over: !!over,
        status: !entered ? "unknown" : over ? "in" : firstIn ? "already" : "out" });
    });
    if (Object.keys(errors).length) return { error: true, errors: errors };
    var any = out.some(function (r) { return r.entered; });
    return { error: false, stages: out, firstIn: firstIn ? firstIn.start : null, any: any };
  }
  var api = { STAGES: STAGES, check: check, num: num,
    ctaHref: function (url, ref) {
      url = String(url || "").trim();
      if (!/^https:\/\/[^\s]+$/i.test(url)) return "";
      var hash = "", i = url.indexOf("#");
      if (i >= 0) { hash = url.slice(i); url = url.slice(0, i); }
      if (/[?&]ref=/.test(url)) return url + hash;
      return url + (url.indexOf("?") >= 0 ? "&" : "?") + "ref=" + encodeURIComponent(ref) + hash;
    } };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Mtd = api;
})(typeof window !== "undefined" ? window : this);
