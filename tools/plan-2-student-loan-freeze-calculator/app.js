(function () {
  "use strict";
  var C = window.SLFreeze, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function whole(n) { return "£" + Number(n).toLocaleString("en-GB", { maximumFractionDigits: 0 }); }
  function td(t, cls) { var c = document.createElement("td"); if (cls) c.className = cls; c.textContent = t; return c; }
  function run() {
    var plans = Array.prototype.map.call(document.querySelectorAll('input[name="plans"]:checked'), function (el) { return el.value; });
    var r = C.calculate({ salary: $("salary").value, rise: $("rise").value, rpi: [$("rpi0").value, $("rpi1").value, $("rpi2").value], plans: plans });
    var msg = $("out-msg");
    if (r.error) { $("out-wrap").hidden = true; $("other-wrap").hidden = true; msg.hidden = false; msg.textContent = r.error; $("out-extra").textContent = "£0.00"; $("out-sub").textContent = ""; return; }
    msg.hidden = true; $("out-wrap").hidden = false;
    $("out-extra").textContent = gbp(r.totalExtra);
    $("out-sub").textContent = "From April 2027 to April 2030, compared with a threshold rising with RPI";
    var body = $("out-body"); body.textContent = "";
    r.rows.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.appendChild(td(row.year));
      tr.appendChild(td(gbp(row.pay), "num"));
      tr.appendChild(td(gbp(row.repayFrozen), "num"));
      var u = td(gbp(row.repayUprated), "num"); var s = document.createElement("small"); s.textContent = "threshold " + whole(row.uprated); u.appendChild(s); tr.appendChild(u);
      tr.appendChild(td(gbp(row.extra), "num"));
      body.appendChild(tr);
    });
    $("out-tf").textContent = gbp(r.totalFrozen); $("out-tr").textContent = gbp(r.totalUprated); $("out-tx").textContent = gbp(r.totalExtra);
    var ob = $("other-body"); ob.textContent = "";
    $("other-wrap").hidden = !plans.length;
    plans.forEach(function (id, i) {
      var tr = document.createElement("tr");
      tr.appendChild(td(r.rows[0].other[i].name + " (above " + whole(r.rows[0].other[i].threshold) + ")"));
      r.rows.forEach(function (row) { tr.appendChild(td(gbp(row.other[i].repay), "num")); });
      ob.appendChild(tr);
    });
  }
  $("sl-form").addEventListener("input", run);
  $("sl-form").addEventListener("change", run);
  $("sl-form").addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
