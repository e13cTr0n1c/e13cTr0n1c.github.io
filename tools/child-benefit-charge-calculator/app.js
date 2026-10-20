(function () {
  "use strict";
  var H = window.HICBC, $ = function (id) { return document.getElementById(id); };
  function gbp(n, whole) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 }); }
  var FIELDS = ["children", "income", "pension", "giftAid"];
  function run() {
    var r = H.calculate({ year: $("year").value, children: $("children").value, income: $("income").value, pension: $("pension").value, giftAid: $("giftAid").value });
    FIELDS.forEach(function (id) {
      var m = r.error && r.errors[id] ? r.errors[id] : ""; $(id + "-err").textContent = m;
      if (m) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid");
    });
    var c = H.CONFIG[$("year").value];
    $("year-note").textContent = c ? "Child Benefit in " + c.label + ": " + gbp(c.eldestWeekly) + " a week for the eldest child, " + gbp(c.otherWeekly) + " for each other child." + (c.confirmed ? "" : " Not yet confirmed by the government.") : "";
    var msg = $("out-msg");
    if (r.error) {
      $("out-wrap").hidden = true; msg.hidden = false; $("out-charge").textContent = ""; $("out-sub").textContent = ""; $("out-pension").textContent = "";
      msg.textContent = $("income").value === "" ? "Type in the higher earner's income to see the charge." : "Check the boxes marked above to see your answer.";
      return;
    }
    msg.hidden = true; $("out-wrap").hidden = false;
    $("out-charge").textContent = gbp(r.charge, true);
    $("out-sub").textContent = r.percent === 0 ? "No charge: adjusted net income is £60,000 or less" : r.percent + "% of your Child Benefit for " + r.config.label;
    $("headline").className = "headline " + (r.charge > 0 ? "owed" : "none");
    $("out-ani").textContent = gbp(r.ani);
    $("out-benefit").textContent = gbp(r.benefit);
    $("out-pct").textContent = r.percent + "%";
    $("out-chg").textContent = gbp(r.charge, true);
    $("out-keep").textContent = gbp(r.keep);
    var p = $("out-pension");
    if (r.charge > 0) {
      p.textContent = "Paying " + gbp(r.pensionGrossToThreshold) + " more into a relief at source pension (" + gbp(r.pensionNetToThreshold) + " from your pocket once the 20% top up is added) would bring adjusted net income down to £60,000 and save the " + gbp(r.pensionSaving, true) + " charge" + (r.ani > r.fullAt ? ". Anything less than " + gbp(r.ani - r.fullAt) + " gross saves nothing on the charge, because the full amount is due at £80,000 and above." : ".");
    } else p.textContent = "";
  }
  $("hicbc-form").addEventListener("input", run);
  $("hicbc-form").addEventListener("change", run);
  run();
})();
