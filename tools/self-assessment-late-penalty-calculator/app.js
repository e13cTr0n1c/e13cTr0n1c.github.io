(function () {
  "use strict";
  var P = window.SaPenalties;
  var $ = function (id) { return document.getElementById(id); };
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function gbp(n) {
    return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function set(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }
  function statusLabel(status) {
    if (status === "charged") return "Charged";
    if (status === "accruing") return "Building up";
    if (status === "upcoming") return "Not yet";
    if (status === "avoided") return "Avoided";
    if (status === "missed") return "Missed";
    if (status === "met") return "Met";
    return status || "";
  }
  function yearId() {
    return $("year").value || "2025-26";
  }
  function fillYears() {
    var sel = $("year");
    P.YEARS.forEach(function (y) {
      var o = document.createElement("option");
      o.value = y.id;
      o.textContent = y.label;
      if (y.id === "2025-26") o.selected = true;
      sel.appendChild(o);
    });
  }
  function syncMtd() {
    var late = yearId() === "2026-27";
    set("mtd-label", late
      ? "I have to use Making Tax Digital for Income Tax for this tax year, or I volunteered for it."
      : "I volunteered for Making Tax Digital for Income Tax for this tax year, or I was in HMRC's test.");
    set("mtd-hint", late
      ? "Tick this if this tax year is one you spend in Making Tax Digital. The new penalties replace the ones I add up. Interest does not change."
      : "Leave this unticked for a normal return. Joining Making Tax Digital from April 2026 does not move a 2025 to 2026 return onto the new penalties.");
  }
  function syncDates() {
    $("filed").disabled = $("not-filed").checked;
    $("paid").disabled = $("not-paid").checked;
    if ($("not-filed").checked) $("filed").value = "";
    if ($("not-paid").checked) $("paid").value = "";
  }
  function method() {
    var el = document.querySelector('input[name="method"]:checked');
    return el ? el.value : "online";
  }
  function showPrompt(text) {
    $("out-body").hidden = true;
    $("out-next").hidden = true;
    $("out-notes").hidden = true;
    $("out-msg").hidden = false;
    $("out-msg").textContent = text;
    set("out-total", "£0.00");
    set("out-sub", "");
    set("h-label", "Estimated total");
  }
  function addRow(body, cells, className) {
    var tr = document.createElement("tr");
    if (className) tr.className = className;
    cells.forEach(function (cell, i) {
      var td = document.createElement(i === 0 ? "th" : "td");
      if (i === 0) td.scope = "row";
      if (i > 0) td.className = "num";
      td.textContent = cell;
      tr.appendChild(td);
    });
    body.appendChild(tr);
  }
  function run() {
    syncDates();
    syncMtd();
    if ($("amount").value.trim() === "") {
      showPrompt("Enter the tax due on 31 January to see an estimate.");
      return;
    }
    var r = P.calculate({
      taxYear: yearId(),
      method: method(),
      amount: $("amount").value,
      liability: $("liability").value,
      filedDate: $("not-filed").checked ? "" : $("filed").value,
      paidDate: $("not-paid").checked ? "" : $("paid").value,
      today: today(),
      mtd: $("mtd").checked
    });
    if (r.error) {
      showPrompt(r.error);
      return;
    }
    $("out-msg").hidden = true;
    $("out-next").hidden = false;
    $("out-body").hidden = false;
    $("out-next").textContent = r.next.sentence;
    set("out-total", gbp(r.total));
    set("out-total-row", gbp(r.total));
    set("h-label", r.penaltiesApply ? (r.next.by ? "Estimated total so far" : "Estimated total") : "Late payment interest");
    set("out-sub", r.penaltiesApply
      ? r.yearLabel + " · " + (r.method === "paper" ? "paper return" : "online return") + " · tax due " + r.deadlines.paymentNice
      : "Interest only. The penalty total on this page does not apply to you.");

    set("out-filing", r.penaltiesApply ? gbp(r.filing.total) : "Does not apply");
    set("out-payment", r.penaltiesApply ? gbp(r.payment.total) : "Does not apply");
    set("out-interest", gbp(r.interest));
    set("out-interest-days", r.interestDays ? r.interestDays + (r.interestDays === 1 ? " day" : " days") : "None");
    $("row-filing").hidden = !r.penaltiesApply;
    $("row-payment").hidden = !r.penaltiesApply;

    var notes = [];
    if (r.paperCanStillFileOnline) {
      notes.push("You have not filed yet, and the online deadline is " + r.deadlines.onlineNice + ". If HMRC receives an online return by then, these paper filing penalties do not arise. I only count them because you chose a paper return. The tax is still due on " + r.deadlines.paymentNice + ".");
    }
    if (r.penaltiesApply && r.liabilityAssumed && r.filing.initial > 0) {
      notes.push("I used the January figure for the 6 and 12 month filing penalties. Those penalties use the year's net tax, after tax taken off at source, and they are not reduced by tax you have already paid. If payments on account covered part of the bill, enter the net tax as well.");
    }
    if (r.penaltiesApply && r.taxYear === "2026-27") {
      notes.push("If you have to use Making Tax Digital for Income Tax for 2026 to 2027, these penalties are the wrong regime. Tick the box above and read the Making Tax Digital section.");
    }
    if (r.penaltiesApply && r.taxYear === "2025-26") {
      notes.push("A normal 2025 to 2026 return stays on these penalties even if you join Making Tax Digital from April 2026.");
    }
    var noteEl = $("out-notes");
    noteEl.hidden = notes.length === 0;
    noteEl.textContent = "";
    notes.forEach(function (text) {
      var p = document.createElement("p");
      p.style.margin = "0 0 0.45rem";
      p.textContent = text;
      noteEl.appendChild(p);
    });
    if (noteEl.lastElementChild) noteEl.lastElementChild.style.marginBottom = "0";

    var timeBody = $("time-body");
    timeBody.textContent = "";
    $("time-wrap").hidden = !r.timeline.length;
    r.timeline.forEach(function (ev) {
      var when = ev.dateNice;
      if (ev.endNice) when += " to " + ev.endNice;
      var amount = ev.amount == null ? "" : gbp(ev.status === "avoided" ? 0 : ev.amount);
      var tr = document.createElement("tr");
      [when, ev.title, amount, statusLabel(ev.status)].forEach(function (text, i) {
        var td = document.createElement("td");
        td.textContent = text;
        if (i === 2) td.className = "num";
        if (i === 3) td.className = "status " + ev.status;
        tr.appendChild(td);
      });
      timeBody.appendChild(tr);
    });

    var periodBody = $("period-body");
    periodBody.textContent = "";
    var showPeriods = r.interestPeriods && r.interestPeriods.length > 0;
    $("period-wrap").hidden = !showPeriods;
    if (showPeriods) {
      r.interestPeriods.forEach(function (p) {
        addRow(periodBody, [
          p.fromNice + " to " + p.toNice,
          String(p.days),
          String(p.rate).replace(/\.0$/, "") + "%",
          gbp(p.interest)
        ]);
      });
      addRow(periodBody, ["Total", String(r.interestDays), "", gbp(r.interest)], "total");
    }
  }

  fillYears();
  $("not-filed").checked = true;
  $("not-paid").checked = true;
  var form = $("calc-form");
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
