(function () {
  "use strict";
  var S = window.CapAllow, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pct(n) { return (Math.round(n * 10000) / 100).toLocaleString("en-GB", { maximumFractionDigits: 2 }) + "%"; }
  function set(id, t) { $(id).textContent = t; }
  function radio(name) { var el = document.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
  var form = $("ca-form");
  function run() {
    var r = $("spend").value === "" ? { error: "Enter what you spent to see the estimate." } : S.calculate({ type: radio("type"), kind: radio("kind"), spend: $("spend").value, aiaUsed: $("aiaUsed").value, spendDate: $("spendDate").value, periodStart: $("periodStart").value });
    var out = $("out-rows"), msg = $("out-msg");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "£0.00"); set("out-headline-sub", ""); return; }
    out.hidden = false; msg.hidden = true;
    set("out-fe", gbp(r.fullExpensing));
    set("out-aia", gbp(r.aia));
    set("out-fya", gbp(r.fya) + (r.fyaRate ? " at " + pct(r.fyaRate) : ""));
    set("out-wda", gbp(r.wda) + (r.wdaRate ? " at " + pct(r.wdaRate) + (r.hybrid ? " (hybrid rate)" : "") : ""));
    set("out-total", gbp(r.total));
    set("out-pool", gbp(r.toPool));
    set("out-headline", gbp(r.total));
    set("out-headline-sub", r.method === "fullExpensing" ? "Full expensing lets a company deduct the whole cost of new main rate plant." : "Of " + gbp(r.spend) + " spent.");
  }
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
