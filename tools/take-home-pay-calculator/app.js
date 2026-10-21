// The listing URL for a matching Gumroad product. While this is empty the call to action stays hidden.
// The full https:// listing URL goes between the quotes; ?ref=ps-uk-take-home-pay is added for you.
const TAKE_HOME_PRODUCT_URL = '';
const TAKE_HOME_PRODUCT_REF = 'ps-uk-take-home-pay';

(function () {
  "use strict";
  var P = window.Pay, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return (n < -0.004 ? "minus " : "") + "£" + Math.abs(Number(n)).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  var href = P.ctaHref(TAKE_HOME_PRODUCT_URL, TAKE_HOME_PRODUCT_REF);
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    if (!href) { el.hidden = true; return; }
    el.querySelectorAll("[data-cta-link]").forEach(function (a) { a.setAttribute("href", href); });
    el.hidden = false;
  });
  // one column per config, so a second set of rates shows side by side
  var head = $("out-head");
  P.CONFIGS.forEach(function (c) { var th = document.createElement("th"); th.scope = "col"; th.className = "num"; th.textContent = c.label; head.appendChild(th); });
  var ROWS = [
    ["Pay before tax", function (r) { return r.salary; }],
    ["Salary sacrifice pension", function (r) { return -r.sacrifice; }, function (r) { return r.sacrifice > 0; }],
    ["Income Tax", function (r) { return -r.incomeTax; }],
    ["National Insurance", function (r) { return -r.ni; }],
    ["Student loan", function (r) { return -r.studentLoan; }, function (r) { return r.studentLoan > 0; }],
    ["Postgraduate Loan", function (r) { return -r.postgrad; }, function (r) { return r.postgrad > 0; }],
    ["Pension from your pay, relief at source", function (r) { return -r.rasNet; }, function (r) { return r.rasNet > 0; }],
    ["Take home for the year", function (r) { return r.takeHome; }, null, "total"]
  ];
  function run() {
    var input = { salary: $("salary").value, region: $("region").value, plan: $("plan").value, postgrad: $("postgrad").checked, pensionPct: $("pensionPct").value, pensionType: $("pensionType").value };
    var all = P.calculateAll(input), r = all[0];
    ["salary", "pensionPct"].forEach(function (id) {
      var m = r.error && r.errors[id] ? r.errors[id] : ""; $(id + "-err").textContent = m;
      if (m) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid");
    });
    var msg = $("out-msg");
    if (r.error) { $("out-wrap").hidden = true; msg.hidden = false; msg.textContent = r.errors.salary && $("salary").value === "" ? "Type in your yearly pay to see your take home pay." : "Check the boxes marked above to see your answer."; $("out-month").textContent = ""; $("out-sub").textContent = ""; $("out-relief").textContent = ""; return; }
    msg.hidden = true; $("out-wrap").hidden = false;
    $("out-month").textContent = gbp(r.takeHome / 12);
    $("out-sub").textContent = gbp(r.takeHome) + " a year, " + gbp(r.takeHome / 52) + " a week";
    var tb = $("out-table").querySelector("tbody"); tb.textContent = "";
    ROWS.forEach(function (row) {
      if (row[2] && !all.some(row[2])) return;
      var tr = document.createElement("tr"); if (row[3]) tr.className = row[3];
      var th = document.createElement("td"); th.textContent = row[0]; tr.appendChild(th);
      all.forEach(function (x) { var td = document.createElement("td"); td.className = "num"; td.textContent = gbp(row[1](x)); tr.appendChild(td); });
      tb.appendChild(tr);
    });
    $("out-relief").textContent = r.extraRelief > 0.004 ? "You could claim about " + gbp(r.extraRelief) + " more tax relief on your pension from HMRC. That would make your take home " + gbp(r.takeHomeAfterClaim) + " for the year." : "";
  }
  $("pay-form").addEventListener("input", run);
  $("pay-form").addEventListener("change", run);
  run();
})();
