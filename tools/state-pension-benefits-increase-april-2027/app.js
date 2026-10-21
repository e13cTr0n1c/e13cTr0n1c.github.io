(function () {
  "use strict";
  var U = window.UPRATING, C = U.UPRATING_2027, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pc(n) { return (Math.round(n * 10) / 10).toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"; }
  var tag = C.status === "confirmed" ? "Confirmed rates" : "Expected until confirmed at the " + C.budgetDate + " Budget";
  document.querySelectorAll("[data-tag]").forEach(function (e) { e.textContent = tag; });
  document.querySelectorAll("[data-cpi]").forEach(function (e) { e.textContent = pc(C.cpi); });
  document.querySelectorAll("[data-tl]").forEach(function (e) { e.textContent = pc(U.tripleLock()); });
  document.querySelectorAll("[data-earn]").forEach(function (e) { e.textContent = pc(C.earningsTotal); });
  C.benefits.forEach(function (b) {
    var h = $(b.id + "-pct"); if (h) h.textContent = "Expected rise " + pc(U.pctFor(b.rule)) + (b.rule === "tripleLock" ? " (triple lock)" : " (CPI)");
  });
  var LABELS = ["", "Now a week", "New a week", "New every 4 weeks", "New a year", "Rise a year"];
  function runB() {
    var inp = {}; C.benefits.forEach(function (b) { inp[b.id] = $(b.id).value; });
    var r = U.calculate(inp);
    C.benefits.forEach(function (b) { var m = r.errors[b.id] || ""; $(b.id + "-err").textContent = m; if (m) $(b.id).setAttribute("aria-invalid", "true"); else $(b.id).removeAttribute("aria-invalid"); });
    var body = $("b-rows"); body.innerHTML = "";
    if (!r.rows.length) { $("b-wrap").hidden = true; $("b-msg").hidden = false; $("b-msg").textContent = r.ok ? "Type in a weekly amount, or press a full rate button, to see your April 2027 figures." : "Check the boxes marked above."; $("b-total").textContent = ""; $("b-sub").textContent = ""; return; }
    $("b-msg").hidden = true; $("b-wrap").hidden = false;
    r.rows.forEach(function (x) {
      var tr = document.createElement("tr");
      [x.name + " (+" + pc(x.pct) + ")", gbp(x.oldWeekly), gbp(x.newWeekly), gbp(x.new4), gbp(x.newYear), "+" + gbp(x.increaseYear)].forEach(function (v, i) { var td = document.createElement(i ? "td" : "th"); if (i) { td.className = "num"; td.setAttribute("data-label", LABELS[i]); } else td.scope = "row"; td.textContent = v; tr.appendChild(td); });
      body.appendChild(tr);
    });
    var t = r.total;
    $("b-total").textContent = "+" + gbp(t.increaseWeekly) + " a week";
    $("b-sub").textContent = "From " + gbp(t.oldWeekly) + " to " + gbp(t.newWeekly) + " a week. That is " + gbp(t.new4) + " every 4 weeks (up " + gbp(t.increase4) + ") and " + gbp(t.newYear) + " a year (up " + gbp(t.increaseYear) + ").";
  }
  function runP() {
    var r = U.payVsInflation($("oldPay").value, $("newPay").value);
    ["oldPay", "newPay"].forEach(function (id) { var m = r.errors[id] || ""; $(id + "-err").textContent = m; if (m) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid"); });
    if (!r.ok) { $("p-wrap").hidden = true; $("p-msg").hidden = false; $("p-head").textContent = ""; $("p-msg").textContent = ($("oldPay").value === "" && $("newPay").value === "") ? "Type in your old and new pay to see if the rise beats inflation." : "Check the boxes marked above."; $("p-headline").className = "headline none"; return; }
    $("p-msg").hidden = true; $("p-wrap").hidden = false;
    $("p-head").textContent = r.verdict === "beating" ? "Yes, by " + pc(r.realPct) : r.verdict === "behind" ? "No, behind by " + pc(-r.realPct) : "Level with inflation";
    $("p-headline").className = "headline " + (r.verdict === "behind" ? "owed" : "none");
    $("p-rise").textContent = (r.riseCash >= 0 ? "+" : "") + gbp(r.riseCash) + " (" + pc(r.risePct) + ")";
    $("p-cpi").textContent = pc(r.cpi);
    $("p-needed").textContent = gbp(r.needed);
    $("p-real").textContent = (r.realGain >= 0 ? "+" : "") + gbp(r.realGain) + " (" + (r.realPct >= 0 ? "+" : "") + pc(r.realPct) + ")";
    $("p-explain").textContent = "Prices rose " + pc(r.cpi) + " in the year to September 2026, so to stand still your pay needed to go from " + gbp(r.oldPay) + " to " + gbp(r.needed) + ". Your new pay is " + gbp(r.newPay) + ", " + (r.verdict === "beating" ? "so you are " + gbp(r.realGain) + " better off in real terms, a real rise of " + pc(r.realPct) + "." : r.verdict === "behind" ? "so in real terms you are " + gbp(-r.realGain) + " worse off, a real cut of " + pc(-r.realPct) + ", even though the number on your payslip went up." : "so you are just keeping pace with prices.");
  }
  document.querySelectorAll("button[data-fill]").forEach(function (btn) {
    btn.addEventListener("click", function () { var b = U.find(btn.getAttribute("data-fill")); $(b.id).value = b.full.toFixed(2); runB(); });
  });
  $("b-form").addEventListener("input", runB);
  $("p-form").addEventListener("input", runP);
  $("b-form").addEventListener("submit", function (e) { e.preventDefault(); });
  $("p-form").addEventListener("submit", function (e) { e.preventDefault(); });
  runB(); runP();
})();
