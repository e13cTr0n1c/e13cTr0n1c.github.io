(function () {
  "use strict";
  var E = window.Eved, R = E.RATES, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function num(n) { return Number(n).toLocaleString("en-GB", { maximumFractionDigits: 0 }); }
  function set(id, t) { $(id).textContent = t; }
  var form = $("ev-form");
  $("mpg").value = R.defaultMpg;
  set("rate-bev", R.eved.bev + "p"); set("rate-phev", R.eved.phev + "p"); set("rate-duty", R.fuelDutyPpl + "p");
  function pick(name) { return form.querySelector('input[name="' + name + '"]:checked').value; }
  function run() {
    var period = pick("period");
    set("miles-label", { year: "Miles a year", month: "Miles a month", week: "Miles a week" }[period]);
    var r = $("miles").value === "" ? { error: "Enter your mileage to see the estimate." } : E.calculate({ miles: $("miles").value, period: period, type: pick("type"), mpg: $("mpg").value });
    var out = $("out-rows"), msg = $("out-msg");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "£0.00"); set("out-headline-sub", ""); return; }
    out.hidden = false; msg.hidden = true;
    set("out-miles", num(r.annualMiles) + " miles");
    set("out-rate", r.ratePpm + "p a mile");
    set("out-year", gbp(r.evedYear));
    set("out-month", gbp(r.evedMonth));
    set("out-petrol-ppm", r.petrolPpm.toFixed(2) + "p a mile (" + num(r.litres) + " litres)");
    set("out-petrol-year", gbp(r.petrolYear));
    set("out-petrol-month", gbp(r.petrolMonth));
    set("out-diff", r.difference >= 0 ? gbp(r.difference) + " less than the petrol car" : gbp(-r.difference) + " more than the petrol car");
    set("out-headline", gbp(r.evedYear) + " a year");
    set("out-headline-sub", "About " + gbp(r.evedMonth) + " a month from " + R.evedStart + ". A similar petrol car pays about " + gbp(r.petrolYear) + " a year in Fuel Duty.");
  }
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
