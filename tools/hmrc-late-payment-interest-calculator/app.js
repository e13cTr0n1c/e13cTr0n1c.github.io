(function () {
  "use strict";
  var H = window.HmrcInterest, $ = function (id) { return document.getElementById(id); };
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pct(n) {
    var s = Number(n).toFixed(2);
    return s.replace(/0+$/, "").replace(/\.$/, "") + "%";
  }
  function set(id, t) { var el = $(id); if (el) el.textContent = t; }
  function mode() {
    var el = document.querySelector('input[name="mode"]:checked');
    return el ? el.value : "late";
  }
  function syncLabels() {
    var repay = mode() === "repayment";
    set("s1", repay ? "1 · What HMRC owes you" : "1 · The tax");
    set("amount-label", repay ? "Amount HMRC owes you" : "Tax paid late");
    set("amount-hint", repay ? "The overpayment HMRC is repaying. This is not a penalty, and it is not interest on interest." : "The tax that was outstanding. Interest is worked out on this amount, not on interest already charged.");
    set("due-label", repay ? "Repayment interest start date" : "Date the tax was due");
    set("due-hint", repay ? "Usually the later of the tax due date and the day you overpaid. HMRC's start date can differ, so use the date on your statement if you have it." : "Interest starts the day after this date. Paid on the due date means no interest.");
    set("paid-label", repay ? "Date HMRC repaid you (or today)" : "Date you paid (or today, if still unpaid)");
    set("paid-hint", repay ? "Set to today when the page loads. Change it to the day the repayment reached you." : "Set to today when the page loads. Change it to the day HMRC treats the payment as received.");
    $("headline").className = "headline " + (repay ? "refund" : "owed");
    $("results").classList.toggle("is-repay", repay);
    set("h-label", repay ? "Repayment interest" : "Late payment interest");
  }
  function fillRates() {
    var body = $("rate-body");
    if (!body || body.childNodes.length) return;
    var rows = H.RATES.slice().reverse();
    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      var from = H.nice(H.parse(row.from));
      tr.innerHTML = "<td>" + from + "</td><td class=\"num\">" + pct(row.late) + "</td><td class=\"num\">" + pct(row.repayment) + "</td>";
      body.appendChild(tr);
    });
  }
  function run() {
    syncLabels();
    var repay = mode() === "repayment";
    var input = { amount: $("amount").value, dueDate: $("due").value, paidDate: $("paid").value || today(), mode: mode() };
    var r = $("amount").value === "" && !$("due").value ? { error: repay ? "Enter the amount and the dates to see an estimate." : "Enter the tax and the dates to see an estimate." } : H.calculate(input);
    var out = $("out-rows"), msg = $("out-msg"), table = $("period-wrap");
    if (r.error) {
      out.hidden = true; table.hidden = true; msg.hidden = false; msg.textContent = r.error;
      set("out-headline", "£0.00"); set("out-headline-sub", ""); return;
    }
    msg.hidden = true;
    set("out-due", r.dueNice);
    set("out-paid", r.paidNice);
    set("out-days", r.days + (r.days === 1 ? " day" : " days"));
    if (!r.charging) {
      out.hidden = false; table.hidden = true;
      set("out-interest", gbp(0));
      set("out-headline", gbp(0));
      set("out-headline-sub", repay ? "No repayment interest for these dates. The end date is on or before the start date." : "No late payment interest. It was paid on or before " + r.dueNice + ".");
      return;
    }
    out.hidden = false; table.hidden = false;
    set("out-interest", gbp(r.interest));
    set("out-headline", gbp(r.interest));
    set("out-headline-sub", r.periods.length === 1
      ? pct(r.periods[0].rate) + " a year for " + r.days + (r.days === 1 ? " day" : " days") + ", from " + r.periods[0].fromNice + " to " + r.periods[0].toNice + "."
      : r.periods.length + " rate periods, " + r.days + " days in all.");
    var body = $("period-body");
    body.textContent = "";
    r.periods.forEach(function (p) {
      var tr = document.createElement("tr");
      tr.innerHTML = "<td>" + p.fromNice + " to " + p.toNice + "</td><td class=\"num\">" + p.days + "</td><td class=\"num\">" + pct(p.rate) + "</td><td class=\"num\">" + gbp(p.interest) + "</td>";
      body.appendChild(tr);
    });
    var total = document.createElement("tr");
    total.className = "total";
    total.innerHTML = "<td>Total</td><td class=\"num\">" + r.days + "</td><td class=\"num\"></td><td class=\"num\">" + gbp(r.interest) + "</td>";
    body.appendChild(total);
  }
  var form = $("calc-form");
  if (!$("paid").value) $("paid").value = today();
  fillRates();
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
