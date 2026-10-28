(function () {
  "use strict";
  var E = window.EnergyPayment, $ = function (id) { return document.getElementById(id); };
  var form = $("hep-form"), bandSel = $("band");
  function pick(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
  function fillBands(nation) {
    var keep = bandSel.value, letters = E.BANDS[nation] || "";
    bandSel.innerHTML = '<option value="">Choose a band</option>' + letters.split("").map(function (b) { return '<option value="' + b + '">Band ' + b + "</option>"; }).join("");
    if (letters.indexOf(keep) !== -1) bandSel.value = keep;
    $("band-field").hidden = nation === "ni";
  }
  function run() {
    var nation = pick("nation");
    fillBands(nation);
    var r = E.check({ nation: nation, band: bandSel.value });
    var head = $("headline"), msg = $("out-msg");
    if (r.error) { head.className = "headline none"; $("out-headline").textContent = "Not checked yet"; $("out-reason").textContent = r.error; return; }
    head.className = "headline " + (r.status === "yes" ? "refund" : "owed");
    $("out-headline").textContent = r.status === "yes" ? "Yes, £100" : r.status === "no" ? "No" : "Not decided yet";
    $("out-reason").textContent = r.reason;
  }
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
