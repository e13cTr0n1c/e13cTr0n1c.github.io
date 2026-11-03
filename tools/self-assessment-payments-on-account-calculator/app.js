(function () {
  "use strict";
  var E = window.POA, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  function year() { var c = document.querySelector('input[name="year"]:checked'); return c ? c.value : "2025-26"; }
  function run() {
    var r = E.calculate({ year: year(), bill: $("bill").value, atSource: $("atSource").value, poaPaid: $("poaPaid").value, expected: $("expected").value });
    var out = $("out-rows"), msg = $("out-msg"), rc = $("reduce-card");
    if (r.error) { out.hidden = true; rc.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "Not yet"); set("out-headline-sub", ""); return; }
    out.hidden = false; msg.hidden = true;
    set("out-headline", gbp(r.janTotal));
    set("out-headline-sub", "by " + r.jan + (r.needed ? ", then " + gbp(r.julTotal) + " by " + r.jul : ", with nothing due on " + r.jul));
    set("out-balancing", gbp(r.balancing));
    set("out-overpaid", r.overpaid > 0 ? "minus " + gbp(r.overpaid) : gbp(0));
    set("out-poa1", r.needed ? gbp(r.poa) + " towards " + r.next : "None");
    set("out-jan", gbp(r.janTotal));
    set("out-jul", r.needed ? gbp(r.poa) : "None");
    set("out-year", gbp(r.yearTotal));
    set("out-rule", r.needed ? "Yes: your bill is £1,000 or more and " + r.sourceShare + "% was paid at source, not more than 80%"
      : (r.under ? "No: your bill is under £1,000" : "No: " + r.sourceShare + "% of your tax was paid at source, more than 80%"));
    if (r.reduced) {
      rc.hidden = false;
      set("out-r-each", gbp(r.reduced.each));
      set("out-r-jan", gbp(r.reduced.jan));
      set("out-r-saving", gbp(r.reduced.saving));
    } else rc.hidden = true;
  }
  document.querySelectorAll("[data-ex]").forEach(function (b) {
    b.addEventListener("click", function () { var v = b.getAttribute("data-ex").split(","); $("year-" + v[0]).checked = true; $("bill").value = v[1]; $("atSource").value = v[2] === "0" ? "" : v[2]; $("poaPaid").value = v[3] === "0" ? "" : v[3]; $("expected").value = v[4]; run(); });
  });
  var f = $("calc-form"); f.addEventListener("input", run); f.addEventListener("change", run); f.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
