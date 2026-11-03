/* Christmas budget planner engine for Plain Sums. Pure logic, no DOM, no tax. */
(function (root) {
  "use strict";
  var CATS = ["gifts", "food", "drink", "travel", "decorations", "cards", "going", "other"];
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { if (v === "" || v === undefined || v === null) return 0; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function weeksUntil(today, year) {
    var t = new Date(today); t.setHours(0, 0, 0, 0);
    var x = new Date(year || t.getFullYear(), 11, 25);
    if (t > x) x = new Date(t.getFullYear() + 1, 11, 25);
    var days = Math.round((x - t) / 86400000);
    return { days: days, weeks: Math.max(1, Math.ceil(days / 7)), date: x };
  }
  function calculate(input) {
    input = input || {};
    var people = num(input.people), per = num(input.perPerson), budget = num(input.budget), saved = num(input.saved);
    if ([people, per, budget, saved].some(isNaN)) return { error: "Enter amounts as numbers of 0 or more." };
    var lines = { gifts: r2(people * per) }, bad = false;
    CATS.slice(1).forEach(function (c) { var v = num((input.costs || {})[c]); if (isNaN(v)) bad = true; lines[c] = v; });
    if (bad) return { error: "Enter amounts as numbers of 0 or more." };
    var total = r2(CATS.reduce(function (s, c) { return s + (lines[c] || 0); }, 0));
    if (total === 0) return { error: "Add what you plan to spend to see your total." };
    var w = weeksUntil(input.today || new Date(), input.year);
    var toFind = r2(Math.max(0, total - saved));
    var biggest = CATS.slice().sort(function (a, b) { return lines[b] - lines[a]; })[0];
    return {
      error: false, lines: lines, total: total, budget: budget, saved: saved,
      over: budget > 0 ? r2(total - budget) : null,
      toFind: toFind, days: w.days, weeks: w.weeks, perWeek: r2(toFind / w.weeks),
      biggest: biggest, biggestShare: r2(lines[biggest] / total * 100),
      cutGiftsTo: budget > 0 && total > budget && people > 0 ? r2(Math.max(0, per - (total - budget) / people)) : null
    };
  }
  var api = { CATS: CATS, weeksUntil: weeksUntil, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Xmas = api;
})(this);
