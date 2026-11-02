(function () {
  "use strict";
  var S = window.Trading, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return (n < 0 ? "minus " : "") + "£" + Math.abs(Number(n)).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  var form = $("ta-form");
  function year() { var c = document.querySelector('input[name="year"]:checked'); return c ? c.value : "2027"; }
  function run() {
    var r = $("gross").value === "" ? { error: "Enter your side income to see the answer." } : S.calculate({ year: year(), gross: $("gross").value, expenses: $("expenses").value });
    var out = $("out-rows"), msg = $("out-msg"), head = $("headline");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "Not yet"); set("out-headline-sub", ""); head.className = "headline none"; return; }
    out.hidden = false; msg.hidden = true;
    set("out-allowance", gbp(r.allowance));
    set("out-p-allow", r.covered ? "Not needed" : gbp(r.withAllowance));
    set("out-p-exp", gbp(r.withExpenses));
    if (r.covered) {
      head.className = "headline none";
      set("out-headline", "No");
      set("out-headline-sub", "Your " + gbp(r.gross) + " is within the " + gbp(r.allowance) + " allowance for " + r.label + ", so it is tax free and you do not need to report it for that reason alone.");
      set("out-best", "The allowance covers it all");
      set("out-taxable", gbp(0));
    } else {
      head.className = "headline owed";
      set("out-headline", "Yes");
      set("out-headline-sub", "Your " + gbp(r.gross) + " is over the " + gbp(r.allowance) + " allowance for " + r.label + ", so you need to register for Self Assessment and report it.");
      set("out-best", r.best === "expenses" ? "Use your actual costs" : (r.saving === 0 ? "Either, they match" : "Take the flat allowance"));
      set("out-taxable", gbp(r.taxableProfit));
    }
  }
  document.querySelectorAll("[data-ex]").forEach(function (b) {
    b.addEventListener("click", function () { var v = b.getAttribute("data-ex").split(","); $("gross").value = v[0]; $("expenses").value = v[1]; run(); });
  });
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
