/* Did my allotment pay its way? Harvest value at the visitor's own prices, plus money in, less money spent.
   Pure logic, no DOM. Browser: window.Allot. Node: require. The example prices are rough starting numbers
   (the same as the Crops sheet in the paid tracker), not shop prices. */
(function (root) {
  "use strict";
  var CROPS = [
    ["Broad beans", "Peas and beans", "kg", 4.00], ["Peas", "Peas and beans", "kg", 5.00], ["Runner beans", "Peas and beans", "kg", 6.00], ["French beans", "Peas and beans", "kg", 5.50],
    ["Potatoes, first early", "Potatoes and tomatoes", "kg", 1.50], ["Potatoes, maincrop", "Potatoes and tomatoes", "kg", 0.90], ["Tomatoes, outdoor", "Potatoes and tomatoes", "kg", 3.50],
    ["Cabbage, summer", "Cabbage family", "each", 1.00], ["Brussels sprouts", "Cabbage family", "kg", 2.50], ["Kale", "Cabbage family", "kg", 5.00], ["Sprouting broccoli", "Cabbage family", "kg", 10.00],
    ["Swede", "Cabbage family", "each", 0.90], ["Turnip", "Cabbage family", "kg", 2.00], ["Radish", "Cabbage family", "each", 0.70],
    ["Onion sets", "Roots and onions", "kg", 1.00], ["Shallots", "Roots and onions", "kg", 3.00], ["Garlic", "Roots and onions", "each", 0.35], ["Leeks", "Roots and onions", "kg", 2.50],
    ["Spring onions", "Roots and onions", "each", 0.60], ["Carrots", "Roots and onions", "kg", 0.70], ["Parsnips", "Roots and onions", "kg", 1.30], ["Beetroot", "Roots and onions", "kg", 1.80],
    ["Lettuce", "Fit in anywhere", "each", 0.80], ["Spinach", "Fit in anywhere", "kg", 6.00], ["Chard", "Fit in anywhere", "kg", 8.00], ["Courgettes", "Fit in anywhere", "kg", 2.50],
    ["Squash and pumpkins", "Fit in anywhere", "each", 1.50], ["Sweetcorn", "Fit in anywhere", "each", 0.80], ["Cucumbers, outdoor", "Fit in anywhere", "each", 0.80],
    ["Chillies and peppers", "Fit in anywhere", "kg", 10.00], ["Rhubarb", "Fruit and perennials", "kg", 6.00], ["Strawberries", "Fruit and perennials", "kg", 6.00],
    ["Raspberries", "Fruit and perennials", "kg", 12.00], ["Asparagus", "Fruit and perennials", "kg", 12.00]
  ].map(function (c) { return { name: c[0], group: c[1], unit: c[2], price: c[3] }; });
  var COSTS = ["rent", "seeds", "compost", "tools", "water", "other"];
  var MAX_ROWS = 60;
  function num(x) { if (x === null || x === undefined) return NaN; var s = String(x).trim().replace(/[£,\s]/g, ""); return s === "" ? NaN : Number(s); }
  function blank(x) { return x === null || x === undefined || String(x).trim() === ""; }
  function r2(x) { return Math.round(Math.round(x * 1e6) / 1e4) / 100; }
  function maxDp(n, d) { var f = Math.pow(10, d); return Math.abs(Math.round(n * f) / f - n) < 1e-9; }
  function crop(name) { for (var i = 0; i < CROPS.length; i++) if (CROPS[i].name === name) return CROPS[i]; return null; }

  // input: { costs: {rent, seeds, ...}, moneyIn, rows: [{crop, qty, price, unit}], hours }
  function calculate(input) {
    input = input || {};
    var e = {}, costs = input.costs || {}, spent = 0;
    COSTS.forEach(function (k) {
      if (blank(costs[k])) return;
      var v = num(costs[k]);
      if (!Number.isFinite(v) || v < 0 || v > 10000 || !maxDp(v, 2)) e[k] = "Enter £0 to £10,000, in pounds and pence.";
      else spent += v;
    });
    var moneyIn = 0;
    if (!blank(input.moneyIn)) { moneyIn = num(input.moneyIn); if (!Number.isFinite(moneyIn) || moneyIn < 0 || moneyIn > 10000 || !maxDp(moneyIn, 2)) { e.moneyIn = "Enter £0 to £10,000, in pounds and pence."; moneyIn = 0; } }
    var hours = null;
    if (!blank(input.hours)) { hours = num(input.hours); if (!Number.isFinite(hours) || hours < 0 || hours > 5000) { e.hours = "Enter 0 to 5,000 hours, or leave it blank."; hours = null; } }
    var rows = (input.rows || []).slice(0, MAX_ROWS), used = [], rowErr = {};
    rows.forEach(function (r, i) {
      var q = blank(r.qty) ? null : num(r.qty), p = blank(r.price) ? null : num(r.price);
      if (q !== null && (!Number.isFinite(q) || q < 0 || q > 10000 || !maxDp(q, 1))) rowErr[i] = "Amount: 0 to 10,000, up to one decimal place.";
      else if (p !== null && (!Number.isFinite(p) || p < 0 || p > 1000 || !maxDp(p, 2))) rowErr[i] = "Price: £0 to £1,000, in pounds and pence.";
      else if (q > 0 && p > 0) used.push({ index: i, crop: r.crop || "Other", unit: r.unit || "kg", qty: q, price: p, value: r2(q * p) });
    });
    if (Object.keys(rowErr).length) e.rows = rowErr;
    if (Object.keys(e).length) return { error: true, errors: e };
    var value = r2(used.reduce(function (a, r) { return a + r.value; }, 0));
    spent = r2(spent);
    var net = r2(value + moneyIn - spent);
    var top = used.slice().sort(function (a, b) { return b.value - a.value || a.index - b.index; }).slice(0, 3)
      .map(function (r) { return { crop: r.crop, value: r.value, share: value ? r.value / value : 0, sharePct: value ? Math.round(r.value / value * 100) : 0 }; });
    var empty = value === 0 && spent === 0;
    return {
      error: false, empty: empty, value: value, spent: spent, moneyIn: moneyIn, net: net, paid: !empty && net >= 0,
      short: net < 0 ? r2(-net) : 0, usedRows: used.map(function (r) { return r.index; }),
      perPound: spent > 0 ? (value + moneyIn) / spent : null,
      perHour: hours > 0 && !empty ? net / hours : null, hours: hours, top: top
    };
  }
  function ctaHref(url, ref) {
    url = String(url || "").trim();
    if (!/^https:\/\/[^\s]+$/i.test(url)) return "";
    var hash = "", i = url.indexOf("#");
    if (i >= 0) { hash = url.slice(i); url = url.slice(0, i); }
    if (/[?&]ref=/.test(url)) return url + hash;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "ref=" + encodeURIComponent(ref) + hash;
  }
  var api = { CROPS: CROPS, COSTS: COSTS, MAX_ROWS: MAX_ROWS, crop: crop, calculate: calculate, ctaHref: ctaHref };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Allot = api;
})(typeof window !== "undefined" ? window : this);
