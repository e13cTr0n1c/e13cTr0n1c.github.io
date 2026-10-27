/* HMRC Approved Mileage Allowance Payments (AMAP) and Mileage Allowance Relief.
   Pure logic, no DOM. Works in the browser (window.Mileage) and in Node (require).
   Rates checked 27 October 2026. Keep every figure in RATES only. */
(function (root) {
  "use strict";

  var RATES = {
    checked: "2026-10-27",
    thresholdMiles: 10000,
    // pence per mile by tax year and vehicle kind
    years: {
      "2026-27": {
        label: "2026/27 (6 April 2026 to 5 April 2027)",
        car: { first: 55, after: 25 },
        motorcycle: { first: 24, after: 24 },
        bicycle: { first: 20, after: 20 }
      },
      "2027-28": {
        label: "2027/28 (6 April 2027 to 5 April 2028)",
        car: { first: 55, after: 35 },
        motorcycle: { first: 24, after: 24 },
        bicycle: { first: 20, after: 20 }
      }
    },
    // Marginal income tax rates the user can pick (rUK and Scotland)
    taxBands: [
      { id: "uk-basic", label: "UK basic rate 20%", rate: 0.20, nation: "uk" },
      { id: "uk-higher", label: "UK higher rate 40%", rate: 0.40, nation: "uk" },
      { id: "uk-additional", label: "UK additional rate 45%", rate: 0.45, nation: "uk" },
      { id: "sc-starter", label: "Scottish starter 19%", rate: 0.19, nation: "scotland" },
      { id: "sc-basic", label: "Scottish basic 20%", rate: 0.20, nation: "scotland" },
      { id: "sc-intermediate", label: "Scottish intermediate 21%", rate: 0.21, nation: "scotland" },
      { id: "sc-higher", label: "Scottish higher 42%", rate: 0.42, nation: "scotland" },
      { id: "sc-advanced", label: "Scottish advanced 45%", rate: 0.45, nation: "scotland" },
      { id: "sc-top", label: "Scottish top 48%", rate: 0.48, nation: "scotland" }
    ],
    vehicles: {
      car: { label: "Car or van" },
      motorcycle: { label: "Motorcycle" },
      bicycle: { label: "Bicycle" }
    },
    claimUrl: "https://www.gov.uk/tax-relief-for-employees/vehicles-you-use-for-work",
    sources: {
      treasury: "https://www.gov.uk/government/news/everyday-fixes-to-make-life-easier-for-millions-of-britons",
      mse: "https://www.moneysavingexpert.com/news/2026/10/mileage-rates-allowance-rise/",
      amap: "https://www.gov.uk/government/publications/rates-and-allowances-travel-mileage-and-fuel-allowances/travel-mileage-and-fuel-rates-and-allowances",
      claim: "https://www.gov.uk/tax-relief-for-employees/vehicles-you-use-for-work",
      scottish: "https://www.gov.uk/scottish-income-tax"
    }
  };

  function round2(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }

  function bandFor(id) {
    for (var i = 0; i < RATES.taxBands.length; i++) if (RATES.taxBands[i].id === id) return RATES.taxBands[i];
    return null;
  }

  function approvedAmount(miles, vehicle, taxYear) {
    var year = RATES.years[taxYear];
    if (!year) return null;
    var v = year[vehicle];
    if (!v) return null;
    var m = Number(miles);
    if (!isFinite(m) || m < 0) return null;
    var first = Math.min(m, RATES.thresholdMiles);
    var after = Math.max(0, m - RATES.thresholdMiles);
    // Convert pence to pounds
    return round2((first * v.first + after * v.after) / 100);
  }

  /* input:
     { mode: "employee"|"self-employed", miles, vehicle: "car"|"motorcycle"|"bicycle",
       taxYear: "2026-27"|"2027-28", taxBand: id,
       employerPpm (pence per mile, employee mode only) }
  */
  function calculate(input) {
    var miles = Number(input.miles);
    if (!isFinite(miles) || miles < 0 || input.miles === "" || input.miles === undefined || input.miles === null) {
      return { error: "Enter your business miles for the tax year." };
    }
    var vehicle = input.vehicle;
    if (!RATES.vehicles[vehicle]) return { error: "Choose a vehicle type." };
    var taxYear = input.taxYear;
    if (!RATES.years[taxYear]) return { error: "Choose a tax year." };
    var band = bandFor(input.taxBand);
    if (!band) return { error: "Choose your tax band." };

    var approved = approvedAmount(miles, vehicle, taxYear);
    var yearRates = RATES.years[taxYear][vehicle];
    var mode = input.mode === "self-employed" ? "self-employed" : "employee";

    if (mode === "self-employed") {
      var taxSaving = round2(approved * band.rate);
      return {
        mode: mode,
        miles: miles,
        vehicle: vehicle,
        taxYear: taxYear,
        taxBand: band.id,
        taxRate: band.rate,
        taxBandLabel: band.label,
        rateFirstPpm: yearRates.first,
        rateAfterPpm: yearRates.after,
        approvedPounds: approved,
        deductionPounds: approved,
        estimatedTaxSaving: taxSaving,
        claimUrl: RATES.claimUrl
      };
    }

    var employerPpm = Number(input.employerPpm);
    if (!isFinite(employerPpm) || employerPpm < 0 || input.employerPpm === "" || input.employerPpm === undefined || input.employerPpm === null) {
      return { error: "Enter what your employer pays per mile in pence." };
    }

    var employerPays = round2(miles * employerPpm / 100);
    var shortfall = round2(approved - employerPays);
    var excess = round2(employerPays - approved);
    var mar = shortfall > 0 ? round2(shortfall * band.rate) : 0;
    var taxableExcess = excess > 0 ? excess : 0;

    return {
      mode: mode,
      miles: miles,
      vehicle: vehicle,
      taxYear: taxYear,
      taxBand: band.id,
      taxRate: band.rate,
      taxBandLabel: band.label,
      rateFirstPpm: yearRates.first,
      rateAfterPpm: yearRates.after,
      employerPpm: employerPpm,
      approvedPounds: approved,
      employerPaysPounds: employerPays,
      shortfallPounds: shortfall > 0 ? shortfall : 0,
      taxableExcessPounds: taxableExcess,
      marPounds: mar,
      claimUrl: RATES.claimUrl
    };
  }

  var api = { RATES: RATES, approvedAmount: approvedAmount, calculate: calculate, bandFor: bandFor };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Mileage = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
