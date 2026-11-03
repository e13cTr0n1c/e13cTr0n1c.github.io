/* Boxing Day and sale discount checker engine for Plain Sums. Pure logic, no DOM, no tax. */
(function (root) {
  "use strict";
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { if (v === "" || v === undefined || v === null) return null; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function bad(a) { return a.some(function (v) { return isNaN(v); }); }
  function percentOff(price, pct) {
    price = num(price); pct = num(pct);
    if (price === null || pct === null) return { error: "Enter the price and the % off." };
    if (bad([price, pct]) || pct > 100) return { error: "Enter a price of £0 or more and a % from 0 to 100." };
    var now = r2(price * (1 - pct / 100));
    return { error: false, was: price, now: now, saving: r2(price - now), pct: pct };
  }
  function wasNow(was, now) {
    was = num(was); now = num(now);
    if (was === null || now === null) return { error: "Enter the was and now prices." };
    if (bad([was, now]) || was === 0) return { error: "Enter prices of £0 or more, with a was price above £0." };
    return { error: false, was: was, now: now, saving: r2(was - now), pct: r2((was - now) / was * 100), rise: now > was };
  }
  /* type "xfory": buy x, pay for y (3 for 2). type "xforp": x items for £p. */
  function multiBuy(input) {
    var unit = num(input.unit), x = num(input.x), y = num(input.y), need = num(input.need);
    if (unit === null || x === null || y === null || need === null) return { error: "Fill in the price, the deal and how many you need." };
    if (bad([unit, x, y, need]) || x < 1 || Math.floor(x) !== x || need < 1 || Math.floor(need) !== need) return { error: "Use whole numbers for items, 1 or more." };
    var dealPrice = input.type === "xforp" ? y : r2(Math.min(y, x) * unit);
    var bundles = Math.ceil(need / x), bought = bundles * x;
    var dealCost = r2(bundles * dealPrice), normalCost = r2(need * unit);
    var each = r2(dealPrice / x);
    return {
      error: false, unit: unit, each: each, pctOffEach: unit > 0 ? r2((unit - each) / unit * 100) : 0,
      need: need, bundles: bundles, bought: bought, extra: bought - need,
      dealCost: dealCost, normalCost: normalCost, saving: r2(normalCost - dealCost)
    };
  }
  /* Is it a real saving? Compares the sale price with the lowest price seen recently and asks if you would buy anyway. */
  function verdict(input) {
    var now = num(input.now), was = num(input.was), low = num(input.lowest);
    if (now === null) return { error: "Enter the sale price." };
    if (bad([now, was === null ? 0 : was, low === null ? 0 : low])) return { error: "Enter prices as numbers of £0 or more." };
    var notes = [], level = "good";
    if (input.wouldBuy === false) { level = "bad"; notes.push("You would not buy it at full price, so the whole " + "£" + now.toFixed(2) + " is new spending, not a saving."); }
    if (low !== null && now >= low) { level = "bad"; notes.push("You could have paid £" + low.toFixed(2) + " recently, so this sale price is no better than before."); }
    else if (low !== null && was !== null && low < was) { if (level === "good") level = "warn"; notes.push("The real saving is against the £" + low.toFixed(2) + " it recently sold for, which is £" + r2(low - now).toFixed(2) + ", not the £" + r2(was - now).toFixed(2) + " the label says."); }
    if (was !== null && now > was) { level = "bad"; notes.push("The now price is higher than the was price."); }
    var real = low !== null ? r2(Math.max(0, low - now)) : (was !== null ? r2(Math.max(0, was - now)) : null);
    if (input.wouldBuy === false) real = 0;
    if (!notes.length) notes.push(was === null && low === null ? "Add a was price or the lowest recent price to check the saving." : "It looks like a genuine saving on something you would buy anyway.");
    return { error: false, level: level, real: real, notes: notes };
  }
  var api = { percentOff: percentOff, wasNow: wasNow, multiBuy: multiBuy, verdict: verdict };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Discount = api;
})(this);
