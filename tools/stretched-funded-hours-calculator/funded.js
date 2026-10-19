/* Stretched funded hours: 570 or 1,140 funded hours a year spread over the weeks a setting is open.
   Pure logic, no DOM. Browser: window.Funded. Node: require. Figures checked against GOV.UK on 19 October 2026:
   570 or 1,140 hours a year over no fewer than 38 and up to 52 weeks (DfE statutory guidance A1.1, A1.6, A1.16).
   Weekly hours are rounded DOWN to 2 dp so weekly hours x weeks never exceeds the yearly hours.
   Claim per funded term week (38 week basis) = weekly hours x open weeks / 38, to 2 dp. */
(function (root) {
  "use strict";
  var YEARLY = [570, 1140];
  function num(x) {
    if (x === null || x === undefined) return NaN;
    var s = String(x).trim().replace(/[£,\s]/g, "");
    return s === "" ? NaN : Number(s);
  }
  function blank(x) { return x === null || x === undefined || String(x).trim() === ""; }
  function whole(n) { return Number.isFinite(n) && Math.floor(n) === n; }
  function rd2(x) { return Math.floor(x * 100 + 1e-9) / 100; }
  function r2(x) { return Math.round(Math.round(x * 1e6) / 1e4) / 100; }

  function optional(v, lo, hi, msg, e, key) {
    if (blank(v)) return null;
    var n = num(v);
    if (!Number.isFinite(n) || n < lo || n > hi) { e[key] = msg; return null; }
    return n;
  }

  function calculate(input) {
    input = input || {};
    var e = {}, mode = input.mode === "term" ? "term" : "year";
    var yearly = num(input.yearly), weeks, total;
    if (mode === "year") {
      if (YEARLY.indexOf(yearly) < 0) e.yearly = "Pick 570 or 1,140 hours.";
      weeks = num(input.weeks);
      if (!whole(weeks) || weeks < 38 || weeks > 52) e.weeks = "Enter whole weeks from 38 to 52.";
      total = yearly;
    } else {
      total = num(input.termHours);
      if (!Number.isFinite(total) || total < 1 || total > 600) e.termHours = "Enter the hours for this term, from 1 to 600.";
      weeks = num(input.termWeeks);
      if (!whole(weeks) || weeks < 1 || weeks > 26) e.termWeeks = "Enter whole weeks from 1 to 26.";
    }
    var attend = optional(input.attend, 0, 60, "Enter hours from 0 to 60, or leave it blank.", e, "attend");
    var rate = optional(input.rate, 0, 100, "Enter a rate from £0 to £100, or leave it blank.", e, "rate");
    var hmax = (e.yearly || e.weeks || e.termHours || e.termWeeks) ? null : rd2(total / weeks);
    var agreed = null;
    if (!blank(input.agreed)) {
      agreed = num(input.agreed);
      if (!Number.isFinite(agreed) || agreed < 0) { e.agreed = "Enter hours of 0 or more, or leave it blank."; agreed = null; }
      else if (hmax !== null && agreed > hmax) { e.agreed = "The most allowed here is " + hmax.toFixed(2) + " hours a week."; agreed = null; }
    }
    if (Object.keys(e).length) return { error: true, errors: e };

    var h = agreed !== null && agreed < hmax ? agreed : hmax;
    var used = r2(h * weeks);
    var paid = attend !== null ? Math.max(0, r2(attend - h)) : null;
    var out = {
      error: false, mode: mode, total: total, weeks: weeks, hmax: hmax, hours: h,
      agreed: agreed, agreedLower: agreed !== null && agreed < hmax,
      used: used, unused: r2(total - used),
      attend: attend, rate: rate, paid: paid,
      cost: paid !== null && rate !== null ? r2(paid * rate) : null
    };
    if (mode === "year") {
      out.yearly = yearly;
      out.claim = r2(h * weeks / 38);
      out.termTime = yearly / 38;
    }
    return out;
  }

  function termly(termHours, weeks) { return rd2(termHours / weeks); }

  function ctaHref(url, ref) {
    url = String(url || "").trim();
    if (!/^https:\/\/[^\s]+$/i.test(url)) return "";
    var hash = "", i = url.indexOf("#");
    if (i >= 0) { hash = url.slice(i); url = url.slice(0, i); }
    if (/[?&]ref=/.test(url)) return url + hash;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "ref=" + encodeURIComponent(ref) + hash;
  }

  var api = { calculate: calculate, termly: termly, rd2: rd2, ctaHref: ctaHref };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Funded = api;
})(typeof window !== "undefined" ? window : this);
