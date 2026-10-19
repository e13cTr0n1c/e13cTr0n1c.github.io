/* Window cleaning price rise: new price, takings a year before and after, and how many customers could leave
   before the rise stops paying. Pure logic, no DOM. Browser: window.PriceRise. Node: require.
   C = 52 / W; P2 = ceil(P(1+r) / R) x R (or to the penny); T0 = N P C; T1 = (N - L) P2 C;
   Lmax = floor(N (1 - P / P2)), never below 0. Matches the Price Rise sheet in the round book. */
(function (root) {
  "use strict";
  var STEPS = [0, 0.1, 0.5, 1];
  function num(x) {
    if (x === null || x === undefined) return NaN;
    var s = String(x).trim().replace(/[£,\s]/g, "");
    return s === "" ? NaN : Number(s);
  }
  function blank(x) { return x === null || x === undefined || String(x).trim() === ""; }
  function pennies(x) { return Math.round(Math.round(x * 1e6) / 1e4) / 100; }
  function dp(x) { var s = String(x); var i = s.indexOf("."); return i < 0 ? 0 : s.length - i - 1; }
  function whole(n) { return Number.isFinite(n) && Math.floor(n) === n; }

  function newPrice(p, r, step) {
    var raw = p * (1 + r);
    if (step > 0) return pennies(Math.ceil(Math.round(raw / step * 1e6) / 1e6) * step);
    return pennies(raw);
  }

  function calculate(input) {
    input = input || {};
    var e = {};
    var n = num(input.customers), p = num(input.price), w = num(input.weeks), rPct = num(input.risePct);
    var step = blank(input.step) ? 0.5 : num(input.step);
    var lost = blank(input.lost) ? 0 : num(input.lost);
    if (!whole(n) || n < 1 || n > 5000) e.customers = "Enter a whole number of customers from 1 to 5,000.";
    if (!Number.isFinite(p) || p < 0.01 || p > 1000 || dp(pennies(p)) > 2 || Math.abs(pennies(p) - p) > 1e-9) e.price = "Enter a price from £0.01 to £1,000, in pounds and pence.";
    if (!whole(w) || w < 1 || w > 52) e.weeks = "Enter whole weeks from 1 to 52.";
    if (!Number.isFinite(rPct) || rPct < 0 || rPct > 100) e.risePct = "Enter a rise from 0% to 100%.";
    else if (Math.abs(Math.round(rPct * 10) / 10 - rPct) > 1e-9) e.risePct = "Use up to one decimal place.";
    if (STEPS.indexOf(step) < 0) e.step = "Pick a rounding option.";
    if (!whole(lost) || lost < 0) e.lost = "Enter a whole number, or leave it at 0.";
    else if (!e.customers && lost > n) e.lost = "This cannot be more than your customers.";
    if (Object.keys(e).length) return { error: true, errors: e };

    var r = rPct / 100, c = 52 / w;
    var p2 = newPrice(p, r, step), plain = pennies(p * (1 + r));
    var t0 = n * p * c, t1 = (n - lost) * p2 * c;
    var lmax = p2 > p ? Math.max(0, Math.floor(n * (1 - p / p2) + 1e-9)) : 0;
    var extra = pennies(t1 - t0);
    return {
      error: false,
      customers: n, price: p, weeks: w, risePct: rPct, step: step, lost: lost,
      newPrice: p2,
      roundedFrom: step > 0 && plain !== p2 ? plain : null,
      noChange: p2 === p,
      cleansPerYear: c,
      takingsNow: pennies(t0),
      takingsAfter: pennies(t1),
      extra: extra,
      extraIfAllStay: pennies(n * (p2 - p) * c),
      perMonth: pennies((t1 - t0) / 12),
      couldLose: lmax,
      share: lmax / n,
      sharePct: Math.round(lmax / n * 100)
    };
  }

  // The product link: empty means no call to action at all. A set URL gets ?ref= (or &ref=) added.
  function ctaHref(url, ref) {
    url = String(url || "").trim();
    if (!/^https:\/\/[^\s]+$/i.test(url)) return "";
    var hash = "", i = url.indexOf("#");
    if (i >= 0) { hash = url.slice(i); url = url.slice(0, i); }
    if (/[?&]ref=/.test(url)) return url + hash;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "ref=" + encodeURIComponent(ref) + hash;
  }

  var api = { calculate: calculate, newPrice: newPrice, ctaHref: ctaHref, pennies: pennies };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.PriceRise = api;
})(typeof window !== "undefined" ? window : this);
