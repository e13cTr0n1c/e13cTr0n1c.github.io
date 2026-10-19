/* Christmas collection slot planner: orders per slot a counter can hand over, and whether the expected orders fit.
   Pure logic, no DOM. Browser: window.Slots. Node: require. All figures come from the visitor's own estimates.
   C = people x floor(slot / handover); slots a day = floor((last - first) / slot) + 1;
   orders a day = round(N x share / 100); needed per slot = ceil(orders / slots); people needed = ceil(needed x handover / slot). */
(function (root) {
  "use strict";
  var LENGTHS = [10, 15, 20, 30, 45, 60], MAX_DAYS = 6;
  function num(x) { if (x === null || x === undefined) return NaN; var s = String(x).trim().replace(/[,\s]/g, ""); return s === "" ? NaN : Number(s); }
  function whole(n) { return Number.isFinite(n) && Math.floor(n) === n; }
  function mins(t) { var m = /^(\d{1,2}):(\d{2})$/.exec(String(t || "").trim()); if (!m) return NaN; var h = +m[1], mi = +m[2]; return h < 24 && mi < 60 ? h * 60 + mi : NaN; }
  function spread(k) { var base = Math.floor(100 / k), rem = 100 - base * k, out = []; for (var i = 0; i < k; i++) out.push(base + (i < rem ? 1 : 0)); return out; }

  function plan(input) {
    input = input || {};
    var e = {}, N = num(input.orders), L = num(input.slot), S = num(input.people), H = num(input.handover), days = input.days || [];
    if (!whole(N) || N < 1 || N > 5000) e.orders = "Enter a whole number of orders from 1 to 5,000.";
    if (LENGTHS.indexOf(L) < 0) e.slot = "Pick a slot length.";
    if (!whole(S) || S < 1 || S > 20) e.people = "Enter a whole number of people from 1 to 20.";
    if (!whole(H) || H < 1 || H > 30) e.handover = "Enter whole minutes from 1 to 30.";
    if (!days.length || days.length > MAX_DAYS) e.days = "Add between 1 and 6 days.";
    var dayErr = {}, total = 0;
    var parsed = days.map(function (d, i) {
      var a = mins(d.first), b = mins(d.last), sh = num(d.share), label = String(d.label || "").trim();
      if (label.length > 20) dayErr[i] = "Keep the day label to 20 characters.";
      else if (!Number.isFinite(a) || a % 15) dayErr[i] = "First slot: a time in 15 minute steps.";
      else if (!Number.isFinite(b) || b % 15) dayErr[i] = "Last slot: a time in 15 minute steps.";
      else if (b < a) dayErr[i] = "The last slot cannot start before the first.";
      else if (!whole(sh) || sh < 0 || sh > 100) dayErr[i] = "Share: a whole number from 0 to 100.";
      if (whole(sh)) total += sh;
      return { label: label || "Day " + (i + 1), first: a, last: b, share: sh };
    });
    if (Object.keys(dayErr).length) e.dayRows = dayErr;
    var shareTotal = total;
    if (!e.dayRows && days.length && shareTotal !== 100) e.shares = "Shares should add up to 100%.";
    if (Object.keys(e).length) return { error: true, errors: e, shareTotal: shareTotal };

    var C = S * Math.floor(L / H);
    var rows = parsed.map(function (d) {
      var n = Math.floor((d.last - d.first) / L) + 1;
      var o = Math.round(N * d.share / 100);
      var q = o ? Math.ceil(o / n) : 0;
      return { label: d.label, slots: n, orders: o, perSlot: q, fits: q <= C, staff: q ? Math.ceil(q * H / L) : 0, capacity: n * C };
    });
    var totalCap = rows.reduce(function (s, r) { return s + r.capacity; }, 0);
    var totalSlots = rows.reduce(function (s, r) { return s + r.slots; }, 0);
    var maxQ = Math.max.apply(null, rows.map(function (r) { return r.perSlot; }));
    return { error: false, C: C, rows: rows, totalCap: totalCap, totalSlots: totalSlots, days: rows.length, orders: N,
      suggest: Math.min(C, maxQ), allFit: rows.every(function (r) { return r.fits; }), over: rows.filter(function (r) { return !r.fits; }), shareTotal: shareTotal };
  }
  function ctaHref(url, ref) {
    url = String(url || "").trim();
    if (!/^https:\/\/[^\s]+$/i.test(url)) return "";
    var hash = "", i = url.indexOf("#");
    if (i >= 0) { hash = url.slice(i); url = url.slice(0, i); }
    if (/[?&]ref=/.test(url)) return url + hash;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "ref=" + encodeURIComponent(ref) + hash;
  }
  var api = { plan: plan, spread: spread, mins: mins, LENGTHS: LENGTHS, MAX_DAYS: MAX_DAYS, ctaHref: ctaHref };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Slots = api;
})(typeof window !== "undefined" ? window : this);
