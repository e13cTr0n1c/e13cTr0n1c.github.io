(function () {
  "use strict";
  var W = window.WaterSure;
  var $ = function (id) { return document.getElementById(id); };

  function pick(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }
  function show(id, on) {
    var el = $(id);
    if (el) el.hidden = !on;
  }

  function sync() {
    var benefit = pick("benefit");
    var reason = pick("reason");
    var kind = pick("medicalKind");
    var condition = pick("condition");
    var medical = reason === "medical" || reason === "both";
    show("ctc-block", benefit === "child-tax-credit");
    show("child-block", reason === "children" || reason === "both");
    show("medical-block", medical);
    show("listed-block", medical && kind === "listed");
    show("dialysis-block", medical && kind === "listed" && condition === "dialysis");
    show("extra-block", medical);
  }

  function renderPoints(list) {
    var ul = $("out-points");
    ul.textContent = "";
    list.forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    });
  }

  function run() {
    sync();
    var input = {
      nation: pick("nation"),
      meter: pick("meter"),
      benefit: pick("benefit"),
      ctcIndividual: pick("ctc"),
      reason: pick("reason"),
      childBenefit: pick("childBenefit"),
      medicalKind: pick("medicalKind"),
      condition: pick("condition"),
      dialysisContribution: pick("dialysis"),
      extraWater: pick("extraWater"),
      blockedUse: pick("blockedUse")
    };
    var result = W.check(input);
    var headline = $("headline");
    if (!result.ok) {
      headline.className = "headline";
      $("h-label").textContent = "Answer the questions";
      $("out-title").textContent = "I need a bit more";
      $("out-message").textContent = result.error;
      $("out-points").hidden = true;
      return;
    }
    $("out-points").hidden = false;
    if (result.status === "likely") headline.className = "headline refund";
    else if (result.status === "not-eligible") headline.className = "headline blocked";
    else headline.className = "headline check";
    $("h-label").textContent = result.status === "likely" ? "Likely to qualify" : result.status === "not-eligible" ? "Not eligible" : "Need to check";
    $("out-title").textContent = result.title;
    $("out-message").textContent = result.message;
    renderPoints(result.points);
  }

  var form = $("watersure-form");
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
