(function () {
  "use strict";
  var G = window.GasSC, C = G.CONFIG, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function int(n) { return Math.round(n).toLocaleString("en-GB"); }
  $("unit").value = C.unitRatePence; $("sc").value = C.standingChargePencePerDay;
  $("newunit").value = C.newUnitRatePence; $("kwh").value = C.defaultKwh;
  function mode() { return document.querySelector('input[name="mode"]:checked').value; }
  function run() {
    var m = mode();
    $("kwh-field").hidden = m !== "kwh"; $("bill-field").hidden = m !== "bill";
    var kwh = m === "kwh" ? $("kwh").value : G.kwhFromMonthly($("bill").value, $("unit").value, $("sc").value);
    var msg = $("out-msg"), rows = $("out-rows"), head = $("headline");
    if ((m === "kwh" && $("kwh").value === "") || (m === "bill" && $("bill").value === "")) { msg.textContent = "Enter your gas use or a monthly bill to see your estimate."; rows.hidden = true; return; }
    var r = G.calc({ kwh: kwh, unit: $("unit").value, sc: $("sc").value, newUnit: $("newunit").value });
    if (r.error || !isFinite(r.kwh)) { msg.textContent = r.error || "Please check your numbers."; rows.hidden = true; return; }
    msg.textContent = ""; rows.hidden = false;
    var save = r.savingYear >= 0.005, more = r.savingYear <= -0.005;
    head.className = "headline " + (more ? "owed" : "refund");
    $("h-label").textContent = save ? "You could save" : more ? "You could pay more" : "About the same";
    $("out-headline").textContent = gbp(r.savingYear) + " a year";
    $("out-headline-sub").textContent = gbp(r.savingMonth) + " a month";
    $("out-kwh").textContent = int(r.kwh) + " kWh";
    $("out-now").textContent = gbp(r.nowYear) + " (" + gbp(r.standingYear) + " standing charge)";
    $("out-after").textContent = gbp(r.afterYear);
    $("out-year").textContent = (more ? "+" : save ? "−" : "") + gbp(r.savingYear);
    $("out-month").textContent = (more ? "+" : save ? "−" : "") + gbp(r.savingMonth);
    $("out-be").textContent = isFinite(r.breakEvenKwh) ? int(r.breakEvenKwh) + " kWh a year" : "No break even point (new unit rate is not higher)";
    $("out-be-note").textContent = isFinite(r.breakEvenKwh) ? "Use less gas than this and you save. Use more and you pay more." : "";
  }
  document.getElementById("gas-form").addEventListener("input", run);
  run();
})();
