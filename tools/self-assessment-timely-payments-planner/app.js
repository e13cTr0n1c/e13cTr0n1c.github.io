(function () {
  "use strict";
  var S = window.SATimely, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  function val(name) { var el = document.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
  function row(cells, cls) {
    var tr = document.createElement("tr"); if (cls) tr.className = cls;
    cells.forEach(function (c, i) { var td = document.createElement("td"); td.textContent = c; if (i > 0 && cls !== "dates") td.className = "num"; tr.appendChild(td); });
    return tr;
  }
  function run() {
    var freq = val("freq") || "monthly";
    var r = S.calculate({ lastBill: $("lastBill").value, balancing: $("balancing").value, pattern: val("pattern") });
    ["lastBill", "balancing"].forEach(function (k) {
      var m = r.error && r.errors[k] ? r.errors[k] : "";
      set(k + "-err", m);
      if (m) $(k).setAttribute("aria-invalid", "true"); else $(k).removeAttribute("aria-invalid");
    });
    var msg = $("out-msg"), wrap = $("out-wrap");
    if (r.error) {
      wrap.hidden = true; msg.hidden = false;
      msg.textContent = r.empty ? "Enter last year's Self Assessment bill to see the estimate." : "Check the boxes marked above to see your estimate.";
      set("out-headline", "£0.00"); set("out-headline-sub", "");
      return;
    }
    wrap.hidden = false; msg.hidden = false;
    msg.textContent = r.inScope ? "" : "A bill under £1,000 means no Payments on Account today, so on these figures the change should not affect you.";
    var m = freq === "quarterly";
    set("out-freq-name", m ? "quarterly" : "monthly");
    set("out-total-current", gbp(r.totals.current));
    set("out-total-new", gbp(m ? r.totals.quarterly : r.totals.monthly));
    var extra = m ? r.extraQuarterly : r.extraMonthly;
    set("out-extra", gbp(extra));
    set("out-regular", m ? gbp(r.regularQuarterly) + " a quarter" : gbp(r.regularMonthly) + " a month");
    set("out-peak", gbp(m ? r.peakQuarterly : r.peakMonthly));
    var buf = m ? r.bufferQuarterly : r.bufferMonthly;
    set("out-buffer", buf > 0.004 ? gbp(buf) : "None needed");
    set("out-headline", gbp(extra));
    set("out-headline-sub", "Estimate with " + (m ? "quarterly" : "monthly") + " payments. Schedule not final.");
    $("headline").className = "headline " + (extra > 0.004 ? "owed" : "none");
    var cb = $("current-table").querySelector("tbody"); cb.innerHTML = "";
    r.currentDates.forEach(function (d) { var tr = row([d.date, d.what, gbp(d.amount)]); tr.children[1].className = ""; tr.children[2].className = "num"; cb.appendChild(tr); });
    var mb = $("month-table").querySelector("tbody"); mb.innerHTML = "";
    r.months.forEach(function (name, i) {
      mb.appendChild(row([name, gbp(r.transition.current[i]), gbp(r.transition.monthly[i]), gbp(r.transition.quarterly[i])]));
    });
    var mf = $("month-table").querySelector("tfoot"); mf.innerHTML = "";
    mf.appendChild(row(["Total", gbp(r.totals.current), gbp(r.totals.monthly), gbp(r.totals.quarterly)], "total"));
  }
  var form = $("sa-form");
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
