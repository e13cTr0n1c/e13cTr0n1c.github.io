(function () {
  "use strict";
  var E = window.Marriage, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  function region() { var c = document.querySelector('input[name="region"]:checked'); return c ? c.value : "ruk"; }
  function run() {
    var r = E.calculate({ lowIncome: $("lowIncome").value, highIncome: $("highIncome").value, region: region(), backYears: $("backYears").value, married: $("married").checked });
    var out = $("out-rows"), msg = $("out-msg"), head = $("headline");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "Not yet"); set("out-headline-sub", ""); head.className = "headline none"; return; }
    out.hidden = false;
    if (!r.worthIt) { msg.hidden = false; msg.textContent = r.reasons.join(" "); } else { msg.hidden = true; }
    head.className = r.worthIt ? "headline none" : "headline owed";
    set("out-headline", r.worthIt ? gbp(r.net) : "No saving");
    set("out-headline-sub", r.worthIt ? "a year as a couple, plus " + gbp(r.backTotal) + " backdated" : "Marriage Allowance would not help you this year");
    set("out-elig", r.eligible ? (r.worthIt ? "Yes" : "Yes, but it saves nothing") : "No");
    set("out-relief", gbp(r.relief));
    set("out-lowextra", gbp(r.lowExtra));
    set("out-net", gbp(r.net));
    set("out-back", r.backYears && r.worthIt ? gbp(r.backTotal) + " for " + r.backList.join(", ") : gbp(0));
    set("out-total", gbp(r.total));
  }
  document.querySelectorAll("[data-ex]").forEach(function (b) {
    b.addEventListener("click", function () { var v = b.getAttribute("data-ex").split(","); $("lowIncome").value = v[0]; $("highIncome").value = v[1]; run(); });
  });
  var f = $("calc-form"); f.addEventListener("input", run); f.addEventListener("change", run); f.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
