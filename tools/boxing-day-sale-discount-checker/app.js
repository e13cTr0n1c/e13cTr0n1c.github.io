(function () {
  "use strict";
  var E = window.Discount, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  function v(id) { return $(id).value; }
  function po() { var r = E.percentOff(v("po-price"), v("po-pct")); set("po-now", r.error ? r.error : gbp(r.now)); set("po-saving", r.error ? "" : gbp(r.saving)); }
  function wn() { var r = E.wasNow(v("wn-was"), v("wn-now")); set("wn-pct", r.error ? r.error : (r.rise ? "No discount, the price went up" : r.pct + "%")); set("wn-saving", r.error ? "" : gbp(r.saving)); }
  function mb() {
    var t = document.querySelector('input[name="mb-type"]:checked').value;
    var r = E.multiBuy({ type: t, unit: v("mb-unit"), x: v("mb-x"), y: v("mb-y"), need: v("mb-need") });
    if (r.error) { set("mb-each", r.error); ["mb-bought", "mb-cost", "mb-normal", "mb-saving"].forEach(function (i) { set(i, ""); }); return; }
    set("mb-each", gbp(r.each) + " (" + r.pctOffEach + "% off each)");
    set("mb-bought", r.bought + (r.extra ? ", " + r.extra + " more than you need" : ", exactly what you need"));
    set("mb-cost", gbp(r.dealCost));
    set("mb-normal", gbp(r.normalCost));
    set("mb-saving", r.saving >= 0 ? gbp(r.saving) : "None, it costs you " + gbp(-r.saving) + " more");
  }
  function vd() {
    var r = E.verdict({ was: v("v-was"), now: v("v-now"), lowest: v("v-low"), wouldBuy: $("v-would").checked });
    var box = $("v-out"), ul = $("v-notes");
    ul.innerHTML = "";
    if (r.error) { box.className = "verdict"; set("v-head", r.error); set("v-real", ""); return; }
    box.className = "verdict " + r.level;
    set("v-head", r.level === "good" ? "Looks like a real saving" : (r.level === "warn" ? "A smaller saving than the label says" : "Not a real saving"));
    set("v-real", r.real === null ? "" : "Real saving: " + gbp(r.real));
    r.notes.forEach(function (n) { var li = document.createElement("li"); li.textContent = n; ul.appendChild(li); });
  }
  function all() { po(); wn(); mb(); vd(); }
  document.addEventListener("input", all); document.addEventListener("change", all);
  ["po-price:120", "po-pct:30", "wn-was:89.99", "wn-now:59.99", "mb-unit:4.50", "mb-x:3", "mb-y:2", "mb-need:2", "v-was:149", "v-now:99", "v-low:109"].forEach(function (p) { var s = p.split(":"); $(s[0]).value = s[1]; });
  all();
})();
