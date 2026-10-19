// The workbook listing URL (Etsy or Payhip). While this is empty the call to action stays hidden.
// Paste the full https:// listing URL between the quotes; ?ref=ps-uk-childminder-register-funded-hours-invoices is added for you.
const CHILDMINDER_WORKBOOK_URL = 'https://arthurverse67.gumroad.com/l/xobzx';
const CHILDMINDER_WORKBOOK_REF = 'ps-uk-childminder-register-funded-hours-invoices';

(function () {
  "use strict";
  var F = window.Funded, $ = function (id) { return document.getElementById(id); };
  function h2(n) { return Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function h0(n) { return Number(n).toLocaleString("en-GB", { maximumFractionDigits: 2 }); }
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  var IDS = ["mode", "yearly", "weeks", "termHours", "termWeeks", "agreed", "attend", "rate"];

  var href = F.ctaHref(CHILDMINDER_WORKBOOK_URL, CHILDMINDER_WORKBOOK_REF);
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    if (!href) { el.hidden = true; return; }
    el.querySelectorAll("[data-cta-link]").forEach(function (a) { a.setAttribute("href", href); });
    el.hidden = false;
  });

  function run() {
    var mode = $("mode").value, term = mode === "term";
    $("f-yearly").hidden = term; $("f-weeks").hidden = term;
    $("f-termHours").hidden = !term; $("f-termWeeks").hidden = !term;
    var r = F.calculate({ mode: mode, yearly: $("yearly").value, weeks: $("weeks").value, termHours: $("termHours").value, termWeeks: $("termWeeks").value, agreed: $("agreed").value, attend: $("attend").value, rate: $("rate").value });
    IDS.forEach(function (id) {
      var msg = r.error && r.errors[id] ? r.errors[id] : "";
      set(id + "-err", msg);
      if (msg) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid");
    });
    var msgEl = $("out-msg"), rows = $("out-rows");
    if (r.error) {
      rows.hidden = true; msgEl.hidden = false; set("out-summary", "");
      msgEl.textContent = "Check the boxes marked above to see the hours.";
      return;
    }
    rows.hidden = false; msgEl.hidden = true;
    set("out-hmax-label", term ? "Most funded hours a week this term" : "Most funded hours a week");
    set("out-hmax", h2(r.hmax));
    $("row-h").hidden = !r.agreedLower; set("out-h", h2(r.hours));
    set("out-used", h2(r.used) + " over " + r.weeks + " weeks");
    var note;
    if (r.unused <= 0) note = "All " + h0(r.total) + " hours used";
    else if (r.agreedLower) note = h2(r.unused) + " of the " + h0(r.total) + " hours not used because the agreed hours are lower";
    else note = h2(r.unused) + " hours short of " + h0(r.total) + " because of rounding down";
    set("out-used-note", note);
    $("row-claim").hidden = term; $("row-tt").hidden = term;
    if (!term) {
      set("out-claim", h2(r.claim));
      set("out-claim-note", "For local authorities that pay on a 38 week basis");
      set("out-tt", h0(r.termTime) + " hours a week for 38 weeks");
    }
    $("row-paid").hidden = r.paid === null;
    if (r.paid !== null) set("out-paid", r.paid > 0 ? h2(r.paid) : "0.00 (the funded hours cover it)");
    $("row-cost").hidden = r.cost === null;
    if (r.cost !== null) set("out-cost", gbp(r.cost));

    var s = h0(r.total) + " funded hours stretched over " + r.weeks + " weeks" + (term ? " this term" : "") + " is " + h2(r.hmax) + " hours a week.";
    if (r.agreedLower) s += " The agreed figure is " + h2(r.hours) + " hours a week.";
    if (r.paid !== null) s += " Over " + h0(r.attend) + " hours a week, " + h2(r.paid) + " hours are paid.";
    set("out-summary", s);
  }
  var form = $("fh-form");
  form.addEventListener("input", run); form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  run();
})();
