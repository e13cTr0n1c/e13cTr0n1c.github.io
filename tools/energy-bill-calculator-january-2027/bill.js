/* January 2027 energy bill estimate. Pure logic, no DOM.
   Works in the browser (window.EnergyBill) and in Node (require).
   Rate data lives only in rates.js. */
(function (root) {
  "use strict";

  var RATES = (typeof module !== "undefined" && module.exports)
    ? require("./rates.js").ENERGY_CAP_RATES
    : root.EnergyCapRates.ENERGY_CAP_RATES;

  function num(v) {
    if (typeof v === "number") return isFinite(v) ? v : NaN;
    if (typeof v === "string") {
      var t = v.replace(/,/g, "").trim();
      if (t === "") return NaN;
      var n = Number(t);
      return isFinite(n) ? n : NaN;
    }
    return NaN;
  }

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  /* Yearly standing charge in pence implied by a published yearly fuel cost. */
  function impliedStandingYearPence(annualPounds, unitPence, kwh) {
    return Math.round(annualPounds * 100) - kwh * unitPence;
  }

  /* Scale today's rates by Cornwall Insight's Direct Debit average forecast.
     Standing charges use the daily rate implied by their yearly fuel cost,
     because the press table rounds standing charges to the nearest penny. */
  function forecastRates(base, data) {
    var f = data.next.forecast.basis;
    var bench = data.current.rates[f.payment][f.region];
    var days = data.daysInYear;
    var elecStandingYear = impliedStandingYearPence(f.electricity.annualPounds, f.electricity.unitPence, f.electricityKwh);
    var gasStandingYear = impliedStandingYearPence(f.gas.annualPounds, f.gas.unitPence, f.gasKwh);
    return {
      electricityUnitPence: base.electricityUnitPence * (f.electricity.unitPence / bench.electricityUnitPence),
      gasUnitPence: base.gasUnitPence * (f.gas.unitPence / bench.gasUnitPence),
      electricityStandingPence: base.electricityStandingPence * (elecStandingYear / (bench.electricityStandingPence * days)),
      gasStandingPence: base.gasStandingPence * (gasStandingYear / (bench.gasStandingPence * days))
    };
  }

  function periodRates(period, payment, region, data) {
    if (period.rates && period.rates[payment] && period.rates[payment][region]) {
      return period.rates[payment][region];
    }
    if (period.status === "forecast" && period.forecast) {
      return forecastRates(data.current.rates[payment][region], data);
    }
    return null;
  }

  function fuelPence(kwh, unitPence, standingPence, days) {
    return Math.round(kwh * unitPence + standingPence * days);
  }

  function costOf(rates, electricityKwh, gasKwh, electricityOnly, days) {
    var elec = fuelPence(electricityKwh, rates.electricityUnitPence, rates.electricityStandingPence, days);
    var gas = electricityOnly ? 0 : fuelPence(gasKwh, rates.gasUnitPence, rates.gasStandingPence, days);
    return { electricityPence: elec, gasPence: gas, yearlyPence: elec + gas };
  }

  function shownRates(rates, electricityOnly) {
    return {
      electricityUnitPence: round2(rates.electricityUnitPence),
      electricityStandingPence: round2(rates.electricityStandingPence),
      gasUnitPence: electricityOnly ? null : round2(rates.gasUnitPence),
      gasStandingPence: electricityOnly ? null : round2(rates.gasStandingPence)
    };
  }

  function calculate(input, data) {
    data = data || RATES;
    input = input || {};
    var payment = input.payment || "directDebit";
    var region = input.region || "gb";
    var pay = findById(data.payments, payment);
    var reg = findById(data.regions, region);
    if (!pay) return { ok: false, error: "Choose a payment method." };
    if (!reg) return { ok: false, error: "Choose a region in England, Scotland or Wales." };
    if (!data.current.rates[payment] || !data.current.rates[payment][region]) {
      return { ok: false, error: "Rates are missing for that region and payment method." };
    }

    var electricityOnly = !!input.electricityOnly;
    var elecKwh = num(input.electricityKwh);
    var gasKwh = electricityOnly ? 0 : num(input.gasKwh);
    if (!isFinite(elecKwh) || elecKwh < 0) {
      return { ok: false, error: "Enter your electricity use in kWh, as a number of zero or more." };
    }
    if (!electricityOnly && (!isFinite(gasKwh) || gasKwh < 0)) {
      return { ok: false, error: "Enter your gas use in kWh, as a number of zero or more." };
    }
    if (elecKwh > 10000000 || gasKwh > 10000000) {
      return { ok: false, error: "That use is too large to be a household bill." };
    }

    if (data.next.status === "official" && !data.next.rates) {
      return { ok: false, error: "January rates are marked official, but ENERGY_CAP_RATES.next.rates in rates.js is still empty." };
    }

    var currentRates = periodRates(data.current, payment, region, data);
    var nextRates = periodRates(data.next, payment, region, data);
    if (!currentRates || !nextRates) {
      return { ok: false, error: "Rates are missing for that region and payment method." };
    }

    var days = data.daysInYear;
    var now = costOf(currentRates, elecKwh, gasKwh, electricityOnly, days);
    var later = costOf(nextRates, elecKwh, gasKwh, electricityOnly, days);
    var changeYear = later.yearlyPence - now.yearlyPence;
    var percent = now.yearlyPence === 0 ? null : Math.round((changeYear / now.yearlyPence) * 1000) / 10;
    var direction = changeYear > 0 ? "up" : changeYear < 0 ? "down" : "same";

    return {
      ok: true,
      electricityOnly: electricityOnly,
      payment: payment,
      paymentLabel: pay.label,
      region: region,
      regionLabel: reg.label,
      electricityKwh: elecKwh,
      gasKwh: electricityOnly ? 0 : gasKwh,
      status: data.next.status,
      days: days,
      current: {
        label: data.current.label,
        yearlyPence: now.yearlyPence,
        monthlyPence: Math.round(now.yearlyPence / 12),
        electricityPence: now.electricityPence,
        gasPence: now.gasPence,
        rates: shownRates(currentRates, electricityOnly)
      },
      next: {
        label: data.next.label,
        yearlyPence: later.yearlyPence,
        monthlyPence: Math.round(later.yearlyPence / 12),
        electricityPence: later.electricityPence,
        gasPence: later.gasPence,
        rates: shownRates(nextRates, electricityOnly)
      },
      change: {
        yearlyPence: changeYear,
        monthlyPence: Math.round(changeYear / 12),
        percent: percent,
        direction: direction
      }
    };
  }

  var api = { calculate: calculate, RATES: RATES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EnergyBill = api;
})(typeof window !== "undefined" ? window : this);
