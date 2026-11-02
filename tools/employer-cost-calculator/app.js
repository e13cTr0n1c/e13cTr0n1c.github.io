(function () {
  "use strict";
  var C = window.EmpCost, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  function year() { var c = document.querySelector('input[name="year"]:checked'); return c ? c.value : "2026"; }
  var lastNlw = C.YEARS[year()].nlw;
  function run() {
    var r = C.calculate({ year: year(), rate: $("rate").value, hours: $("hours").value, pension: $("pension").checked, ea: $("ea").checked });
    var rows = $("out-rows"), msg = $("out-msg");
    if (r.error) { rows.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-total", "£0.00"); set("out-sub", ""); $("out-warn").hidden = true; return; }
    rows.hidden = false; msg.hidden = true;
    set("out-total", gbp(r.total));
    set("out-sub", gbp(r.onCost) + " a year on top of the wage, " + r.label + " rates");
    set("out-gross", gbp(r.gross));
    set("out-ni", gbp(r.ni));
    $("row-ea").hidden = !r.eaUsed; set("out-ea", "minus " + gbp(r.eaUsed));
    set("out-pension", gbp(r.pension));
    set("out-total2", gbp(r.total));
    set("out-monthly", gbp(r.monthly));
    set("out-paid-hour", gbp(r.perPaidHour));
    set("out-worked-hour", gbp(r.perWorkedHour));
    var w = [];
    if (r.belowNlw) w.push("That rate is below the National Living Wage of " + gbp(r.nlw) + " for workers aged 21 and over. Lower rates apply only to younger workers and apprentices.");
    if ($("pension").checked && !r.autoEnrol) w.push("At this pay the worker is under the £10,000 trigger, so you only pay into a pension if they ask to join.");
    if (r.tbc.length) w.push("Some 2027 to 2028 thresholds are still to be confirmed on GOV.UK, so I use the 2026 to 2027 figures for them.");
    $("out-warn").hidden = !w.length; set("out-warn", w.join(" "));
  }
  document.querySelectorAll('input[name="year"]').forEach(function (el) {
    el.addEventListener("change", function () {
      var nlw = C.YEARS[year()].nlw, cur = C.num($("rate").value);
      if (cur === null || cur === lastNlw) $("rate").value = nlw.toFixed(2);
      lastNlw = nlw; run();
    });
  });
  $("use-nlw").addEventListener("click", function () { $("rate").value = C.YEARS[year()].nlw.toFixed(2); run(); });
  $("ec-form").addEventListener("input", run);
  $("ec-form").addEventListener("change", run);
  $("ec-form").addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
