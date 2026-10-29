(function () {
  "use strict";
  var S = window.Badr, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  var form = $("bd-form");
  function run() {
    var r = $("gain").value === "" ? { error: "Enter the gain on your sale to see the estimate." } : S.calculate({ gain: $("gain").value, used: $("used").value, income: $("income").value, date: $("date").value });
    var out = $("out-rows"), msg = $("out-msg");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "£0.00"); set("out-headline-sub", ""); return; }
    out.hidden = false; msg.hidden = true;
    set("out-rule", r.rule ? (r.rule === "before" ? "The £1 million limit (before 6 April 2027)" : "The £500,000 limit (on or after 6 April 2027)") : "Enter a date to see which rule applies");
    set("out-b-rel", gbp(r.before.relieved));
    set("out-a-rel", gbp(r.after.relieved));
    set("out-before", gbp(r.before.tax));
    set("out-after", gbp(r.after.tax));
    set("out-diff", gbp(r.difference));
    set("out-headline", gbp(r.difference));
    set("out-headline-sub", r.difference > 0 ? "Selling on or after 6 April 2027 costs " + gbp(r.difference) + " more on these figures." : "The new limit makes no difference on these figures.");
  }
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
