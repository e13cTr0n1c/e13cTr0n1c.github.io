(function () {
  "use strict";
  var M = window.MinWageRise, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pick(name, d) { var f = document.querySelector("input[name=" + name + "]:checked"); return f ? f.value : d; }
  var ROWS = [["hourly", "Hourly rate"], ["weeklyGross", "Gross a week"], ["monthlyGross", "Gross a month"], ["annualGross", "Gross a year"],
    ["weeklyTake", "Take home a week"], ["monthlyTake", "Take home a month"], ["annualTake", "Take home a year"]];
  function run() {
    var r = M.compare({ band: pick("band", "21plus"), hours: $("hours").value, region: pick("region", "ruk") });
    var m = r.errors.hours || ""; $("hours-err").textContent = m;
    if (m) $("hours").setAttribute("aria-invalid", "true"); else $("hours").removeAttribute("aria-invalid");
    if (!r.ok) { $("m-wrap").hidden = true; $("m-msg").hidden = false; $("m-msg").textContent = "Check the box marked above."; $("m-head").textContent = ""; return; }
    $("m-msg").hidden = true; $("m-wrap").hidden = false;
    $("m-head").textContent = "+" + gbp(r.rise.monthlyTake) + " a month";
    $("m-body").innerHTML = ROWS.map(function (k) {
      var d = k[0] === "hourly" ? r.hourlyRise : r.rise[k[0]];
      return "<tr><th scope=\"row\">" + k[1] + "</th><td data-label=\"Now\">" + gbp(r.old[k[0]]) + "</td><td data-label=\"From April 2027\">" + gbp(r["new"][k[0]]) + "</td><td data-label=\"Change\">+" + gbp(d) + "</td></tr>";
    }).join("");
    $("m-explain").textContent = "On the " + r.label + " rate for " + $("hours").value + " hours a week, going from " + gbp(r.old.hourly) + " to " + gbp(r["new"].hourly) + " an hour (" + r.risePct + "%) adds " +
      gbp(r.rise.annualGross) + " a year before tax. After Income Tax and National Insurance I estimate you keep " + gbp(r.rise.annualTake) + " of it, or " + gbp(r.rise.monthlyTake) + " a month.";
  }
  $("m-form").addEventListener("input", run);
  $("m-form").addEventListener("change", run);
  $("m-form").addEventListener("submit", function (e) { e.preventDefault(); });
  run();
})();
