(function () {
  "use strict";
  var P = window.Pay, B = window.Budget, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return (n < -0.004 ? "−" : "") + "£" + Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function signed(n) { return Math.abs(n) < 0.005 ? "£0.00" : (n > 0 ? "+" : "") + gbp(n); }
  var cfg = B.BUDGET_2026;
  $("banner").hidden = !!cfg.announced;
  $("after-when").textContent = cfg.announced && cfg.effectiveFrom ? "From " + cfg.effectiveFrom : "Same as now until 28 October";
  if (cfg.announced && cfg.summary) { $("budget-summary").textContent = cfg.summary; $("budget-summary").hidden = false; }
  var ROWS = [["salary", "Salary"], ["pension", "Pension contribution"], ["incomeTax", "Income Tax"], ["ni", "National Insurance"], ["studentLoan", "Student loan"], ["takeHome", "Take home a year"]];
  function run() {
    var r = B.compare(P, { salary: $("salary").value, pensionPct: $("pensionPct").value, plan: $("plan").value, region: $("scotland").checked ? "scotland" : "ruk", pensionType: "sacrifice" });
    ["salary", "pensionPct"].forEach(function (id) {
      var m = r.error && r.errors[id] ? r.errors[id] : ""; $(id + "-err").textContent = m;
      if (m) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid");
    });
    if (r.error) { $("out-wrap").hidden = true; $("out-msg").hidden = false; $("out-msg").textContent = $("salary").value === "" ? "Type in your salary to see your take home pay." : "Check the box marked above."; return; }
    $("out-wrap").hidden = false; $("out-msg").hidden = true;
    var body = ROWS.map(function (row) {
      var k = row[0], a = r.now[k], b = r.after[k];
      return "<tr" + (k === "takeHome" ? ' class="total"' : "") + "><th scope=\"row\">" + row[1] + "</th><td class=\"num\">" + gbp(a) + "</td><td class=\"num\">" + gbp(b) + "</td></tr>";
    }).join("") + '<tr class="total"><th scope="row">Take home a month</th><td class="num">' + gbp(r.now.takeHome / 12) + "</td><td class=\"num\">" + gbp(r.after.takeHome / 12) + "</td></tr>";
    $("out-body").innerHTML = body;
    $("out-year").textContent = signed(r.diffYear);
    $("out-month").textContent = signed(r.diffMonth);
    $("out-sub").textContent = !r.announced ? "No change yet: the Budget figures go in on 28 October" : (Math.abs(r.diffYear) < 0.005 ? "No change to your take home pay" : (r.diffYear > 0 ? "Better off after the Budget" : "Worse off after the Budget"));
    $("headline").className = "headline " + (r.diffYear < -0.004 ? "owed" : "none");
  }
  $("pay-form").addEventListener("input", run);
  $("pay-form").addEventListener("change", run);
  run();
})();
