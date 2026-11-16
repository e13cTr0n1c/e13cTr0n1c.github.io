(function () {
  "use strict";
  var W = window.Wfh;
  var $ = function (id) { return document.getElementById(id); };
  var YEAR_IDS = ["2022-23", "2023-24", "2024-25", "2025-26"];

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function pick(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }
  function show(el, on) { if (el) el.hidden = !on; }

  function syncChrome() {
    var exact = pick("mode") === "exact";
    var other = pick("rate") === "other";
    var nodes = document.querySelectorAll(".weeks-field");
    for (var i = 0; i < nodes.length; i++) nodes[i].hidden = exact;
    nodes = document.querySelectorAll(".exact-field");
    for (var j = 0; j < nodes.length; j++) nodes[j].hidden = !exact;
    show($("other-field"), other);
    YEAR_IDS.forEach(function (id) {
      var box = $("y-" + id);
      show($("extra-" + id), box && box.checked && !box.disabled);
    });
  }

  function paintDeadlines(today) {
    var rows = W.deadlines(today);
    $("as-at").textContent = W.formatDate(today);
    rows.forEach(function (row) {
      var count = $("count-" + row.id);
      var box = $("y-" + row.id);
      if (count) count.textContent = row.countdown + ".";
      if (!box) return;
      box.disabled = !row.open;
      if (!row.open) box.checked = false;
    });
  }

  function readYears() {
    var out = [];
    YEAR_IDS.forEach(function (id) {
      var box = $("y-" + id);
      if (!box || !box.checked || box.disabled) return;
      out.push({
        id: id,
        weeks: $("weeks-" + id).value,
        exact: $("exact-" + id).value,
        employerPaid: $("paid-" + id).value
      });
    });
    return out;
  }

  function routeCopy(r) {
    if (!r.eligible) return "";
    if (r.route === "none") return "";
    if (r.route === "return" && r.selfAssessment) {
      return "You send a Self Assessment tax return, so claim on that return. Do not use the online expenses service or form P87 for the same costs.";
    }
    if (r.route === "return") {
      return "At least one year is over £2,500. HMRC says a total expenses claim over £2,500 has to go on a Self Assessment return. I can only see the working from home amount. Other job expenses in the same year count towards that £2,500 as well.";
    }
    if (r.route === "mixed") {
      return "One year is over £2,500 and another is not. Use Self Assessment for the year that is over £2,500. A year of £2,500 or less can go online or on form P87, unless you already send a return. Other job expenses in that year count towards the £2,500.";
    }
    return "Claim online on GOV.UK. If you would rather post it, and your total job expenses for the year are £2,500 or less, use form P87. If you already send a Self Assessment return, claim on the return instead. I can only see the working from home amount, so add any other job expenses before you rely on the £2,500 line.";
  }

  function evidenceCopy(r) {
    if (!r.eligible || r.totalClaimPence === 0) return "";
    if (r.mode === "exact") {
      return "For the exact amount, keep receipts or bills, and evidence that you had to work from home, such as your contract. Do not include rent or broadband that you also use privately.";
    }
    return "For £6 a week from 2022/23 onwards, send evidence that you had to work from home, such as your contract. You do not send receipts for the £6 itself.";
  }

  function run() {
    syncChrome();
    var today = todayISO();
    paintDeadlines(today);
    var msg = $("out-msg");
    var body = $("out-body");
    var r = W.calculate({
      reason: pick("reason"),
      mode: pick("mode"),
      rateId: pick("rate"),
      otherPercent: $("other-percent").value,
      selfAssessment: $("sa").checked,
      today: today,
      years: readYears()
    });

    if (!r.ok) {
      $("headline").className = "headline";
      $("h-label").textContent = "Estimated relief";
      $("out-total").textContent = "£0.00";
      $("out-sub").textContent = "";
      msg.hidden = false;
      msg.textContent = r.error;
      show(body, false);
      show($("out-fail"), false);
      return;
    }

    if (!r.eligible) {
      $("headline").className = "headline blocked";
      $("h-label").textContent = "No claim";
      $("out-total").textContent = "£0.00";
      $("out-sub").textContent = "On the facts you ticked, I cannot see a claim.";
      msg.hidden = true;
      show(body, false);
      $("out-fail").hidden = false;
      $("fail-text").textContent = r.message;
      $("fail-employer").textContent = r.employerNote;
      return;
    }

    show($("out-fail"), false);
    var nothing = r.totalClaimPence === 0;
    $("headline").className = nothing ? "headline blocked" : "headline refund";
    $("h-label").textContent = nothing ? "Nothing to claim" : "Estimated tax relief";
    $("out-total").textContent = W.formatPounds(r.totalReliefPence);
    $("out-sub").textContent = nothing
      ? r.message
      : r.rateLabel + (r.mode === "flat" ? ". Flat rate " + r.weeklyRelief + "." : ". Exact extra costs.");
    msg.hidden = !r.message || !nothing;
    if (!msg.hidden) msg.textContent = r.message;

    var tb = $("year-body");
    tb.textContent = "";
    r.years.forEach(function (y) {
      var tr = document.createElement("tr");
      function cell(text, cls) {
        var td = document.createElement("td");
        if (cls) td.className = cls;
        td.textContent = text;
        tr.appendChild(td);
        return td;
      }
      cell(y.label);
      var work = cell(y.working);
      if (y.weeksNote) {
        var small = document.createElement("small");
        small.textContent = y.weeksNote;
        work.appendChild(small);
      }
      cell(W.formatPounds(y.reliefPence), "num");
      cell("Closes " + y.claimByLabel + ". " + y.countdown + ".", "");
      tb.appendChild(tr);
    });
    $("out-total-cell").textContent = W.formatPounds(r.totalReliefPence);
    $("out-route").textContent = routeCopy(r);
    $("out-evidence").textContent = evidenceCopy(r);
    show($("out-route"), !!routeCopy(r));
    show($("out-evidence"), !!evidenceCopy(r));
    show(body, true);
  }

  var form = $("wfh-form");
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
