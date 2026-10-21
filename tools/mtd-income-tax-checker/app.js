// The listing URL for a matching Gumroad product. While this is empty the call to action stays hidden.
// The full https:// listing URL goes between the quotes; ?ref=ps-uk-mtd-checker is added for you.
const MTD_PRODUCT_URL = 'https://arthurverse67.gumroad.com/l/mtdchecklist';
const MTD_PRODUCT_REF = 'ps-uk-mtd-checker';

(function () {
  "use strict";
  var M = window.Mtd, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { maximumFractionDigits: 0 }); }
  var href = M.ctaHref(MTD_PRODUCT_URL, MTD_PRODUCT_REF);
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    if (!href) { el.hidden = true; return; }
    el.querySelectorAll("[data-cta-link]").forEach(function (a) { a.setAttribute("href", href); });
    el.hidden = false;
  });
  var IDS = [];
  M.STAGES.forEach(function (s) { IDS.push(s.id + "-se", s.id + "-prop"); });
  function run() {
    var years = {};
    M.STAGES.forEach(function (s) { years[s.id] = { se: $(s.id + "-se").value, prop: $(s.id + "-prop").value }; });
    var r = M.check(years);
    IDS.forEach(function (id) {
      var m = r.error && r.errors[id] ? r.errors[id] : ""; $(id + "-err").textContent = m;
      if (m) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid");
    });
    var msg = $("out-msg"), hl = $("headline");
    if (r.error) { $("out-wrap").hidden = true; $("out-means").hidden = true; msg.hidden = false; msg.textContent = "Check the boxes marked above to see your answer."; $("out-verdict").textContent = ""; return; }
    msg.hidden = true; $("out-wrap").hidden = false;
    var v;
    if (!r.any) v = "Add your income for a tax year to see the answer";
    else if (r.firstIn) v = "Yes, you need it from " + r.firstIn;
    else if (r.stages.every(function (s) { return s.entered; })) v = "No, not on these figures";
    else v = "Not on the years you entered";
    $("out-verdict").textContent = v;
    hl.className = "headline " + (r.firstIn ? "owed" : "none");
    $("out-means").hidden = !r.firstIn;
    var tb = $("out-table").querySelector("tbody"); tb.textContent = "";
    r.stages.forEach(function (s) {
      var tr = document.createElement("tr");
      var res = { in: "In", already: "Already in from an earlier date", out: "Out", unknown: "Not entered" }[s.status];
      [s.start, s.taxYear, gbp(s.threshold), s.entered ? gbp(s.qualifying) : "", res].forEach(function (t, i) {
        var td = document.createElement("td"); td.textContent = t; if (i === 2 || i === 3) td.className = "num";
        if (i === 4) td.className = s.status === "in" || s.status === "already" ? "stage-in" : s.status === "out" ? "stage-out" : "";
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
  }
  $("mtd-form").addEventListener("input", run);
  run();
})();
