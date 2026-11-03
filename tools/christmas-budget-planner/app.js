(function () {
  "use strict";
  var E = window.Xmas, $ = function (id) { return document.getElementById(id); };
  var NAMES = { gifts: "Gifts", food: "Food", drink: "Drink", travel: "Travel", decorations: "Decorations", cards: "Cards and postage", going: "Nights out", other: "Anything else" };
  var FIELDS = ["people", "perPerson", "food", "drink", "travel", "decorations", "cards", "going", "other", "budget", "saved"];
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  function run() {
    var costs = {}; E.CATS.slice(1).forEach(function (c) { costs[c] = $(c).value; });
    var r = E.calculate({ people: $("people").value, perPerson: $("perPerson").value, costs: costs, budget: $("budget").value, saved: $("saved").value });
    var out = $("out-rows"), msg = $("out-msg"), head = $("headline");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "Not yet"); set("out-headline-sub", ""); head.className = "headline none"; return; }
    out.hidden = false; msg.hidden = true;
    head.className = r.over !== null && r.over > 0 ? "headline owed" : "headline none";
    set("out-headline", gbp(r.total));
    set("out-headline-sub", r.days + " days to Christmas, so put aside " + gbp(r.perWeek) + " a week");
    set("out-gifts", gbp(r.lines.gifts));
    set("out-rest", gbp(r.total - r.lines.gifts));
    set("out-total", gbp(r.total));
    set("out-over", r.over === null ? "No budget set" : (r.over > 0 ? gbp(r.over) + " over" : gbp(-r.over) + " under"));
    set("out-find", gbp(r.toFind));
    set("out-week", gbp(r.perWeek) + " for " + r.weeks + (r.weeks === 1 ? " week" : " weeks"));
    set("out-big", NAMES[r.biggest] + ", " + r.biggestShare + "% of the total");
    set("out-cut", r.cutGiftsTo === null ? "No change needed" : gbp(r.cutGiftsTo) + " each");
  }
  document.querySelectorAll("[data-ex]").forEach(function (b) {
    b.addEventListener("click", function () { var v = b.getAttribute("data-ex").split(","); FIELDS.forEach(function (f, i) { $(f).value = v[i]; }); run(); });
  });
  var f = $("calc-form"); f.addEventListener("input", run); f.addEventListener("change", run); f.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
