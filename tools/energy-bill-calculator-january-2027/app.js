(function () {
  "use strict";
  var B = window.EnergyBill;
  var R = B.RATES;
  var $ = function (id) { return document.getElementById(id); };
  var setting = false;

  function money(pence) {
    return "£" + (Math.abs(pence) / 100).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function changeText(pence) {
    if (pence > 0) return "Up " + money(pence);
    if (pence < 0) return "Down " + money(pence);
    return "No change";
  }

  function penceRate(n) {
    return n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "p";
  }

  function presetId() {
    var chosen = document.querySelector('input[name="preset"]:checked');
    return chosen ? chosen.value : "own";
  }

  function markOwn() {
    var own = $("preset-own");
    if (own && !own.checked) own.checked = true;
  }

  function applyPreset(id) {
    if (id === "own") return;
    setting = true;
    $("elec-kwh").value = String(R.tdcv.electricity[id]);
    $("gas-kwh").value = String(R.tdcv.gas[id]);
    setting = false;
  }

  function electricityOnly() {
    return $("elec-only").checked;
  }

  function syncGasField() {
    var off = electricityOnly();
    var gas = $("gas-kwh");
    gas.disabled = off;
    $("gas-field").classList.toggle("is-off", off);
  }

  function payment() {
    var chosen = document.querySelector('input[name="payment"]:checked');
    return chosen ? chosen.value : "directDebit";
  }

  function fillPeriod(prefix, period) {
    $(prefix + "-year").textContent = money(period.yearlyPence) + " a year";
    $(prefix + "-month").textContent = money(period.monthlyPence) + " a month";
    $(prefix + "-elec").textContent = money(period.electricityPence);
    $(prefix + "-gas").textContent = period.gasPence === 0 && electricityOnly() ? "No gas" : money(period.gasPence);
    $(prefix + "-elec-unit").textContent = penceRate(period.rates.electricityUnitPence) + " per kWh";
    $(prefix + "-elec-sc").textContent = penceRate(period.rates.electricityStandingPence) + " a day";
    if (period.rates.gasUnitPence === null) {
      $(prefix + "-gas-unit").textContent = "No gas";
      $(prefix + "-gas-sc").textContent = "No gas";
    } else {
      $(prefix + "-gas-unit").textContent = penceRate(period.rates.gasUnitPence) + " per kWh";
      $(prefix + "-gas-sc").textContent = penceRate(period.rates.gasStandingPence) + " a day";
    }
  }

  function setBanner() {
    var banner = $("cap-banner");
    var kicker = $("banner-kicker");
    var text = $("banner-text");
    var tag = $("next-tag");
    if (R.next.status === "official") {
      banner.className = "banner official";
      kicker.textContent = "Official cap";
      text.textContent = "The January to March 2027 figures are Ofgem's published cap. Last checked " + checkedLabel() + ".";
      if (tag) tag.textContent = "Official cap";
    } else {
      banner.className = "banner forecast";
      kicker.textContent = "FORECAST";
      text.textContent = "This is a forecast, not the official cap. Official figures are due from Ofgem on 25 November 2026.";
      if (tag) tag.textContent = "FORECAST";
    }
  }

  function checkedLabel() {
    var parts = R.lastChecked.split("-");
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return Number(parts[2]) + " " + months[Number(parts[1]) - 1] + " " + parts[0];
  }

  function run() {
    syncGasField();
    var result = B.calculate({
      electricityKwh: $("elec-kwh").value,
      gasKwh: $("gas-kwh").value,
      electricityOnly: electricityOnly(),
      payment: payment(),
      region: $("region").value
    });
    var err = $("out-error");
    var body = $("out-body");
    if (!result.ok) {
      err.textContent = result.error;
      body.hidden = true;
      return;
    }
    err.textContent = "";
    body.hidden = false;
    var up = result.change.direction === "up";
    var down = result.change.direction === "down";
    $("headline").className = "headline " + (up ? "up" : down ? "down" : "same");
    $("h-label").textContent = up ? "Your bill goes up" : down ? "Your bill goes down" : "Your bill stays the same";
    $("out-change").textContent = changeText(result.change.yearlyPence) + " a year";
    var pct = result.change.percent === null ? "" : " (" + (up ? "up " : down ? "down " : "") + Math.abs(result.change.percent).toLocaleString("en-GB") + "%)";
    $("out-sub").textContent = changeText(result.change.monthlyPence) + " a month" + pct;
    fillPeriod("now", result.current);
    fillPeriod("next", result.next);
    $("out-where").textContent = result.regionLabel + ", " + result.paymentLabel + (result.electricityOnly ? ", electricity only" : ", electricity and gas");
  }

  document.querySelectorAll('input[name="preset"]').forEach(function (el) {
    el.addEventListener("change", function () {
      applyPreset(presetId());
      run();
    });
  });
  ["elec-kwh", "gas-kwh"].forEach(function (id) {
    $(id).addEventListener("input", function () {
      if (!setting) markOwn();
      run();
    });
  });
  $("elec-only").addEventListener("change", run);
  document.querySelectorAll('input[name="payment"]').forEach(function (el) {
    el.addEventListener("change", run);
  });
  $("region").addEventListener("change", run);

  setBanner();
  applyPreset("typical");
  run();
})();
