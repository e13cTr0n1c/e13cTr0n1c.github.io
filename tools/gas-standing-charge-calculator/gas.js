/* Gas standing charge removal estimate. Pure logic, no DOM.
   Works in the browser (window.GasSC) and in Node (require).
   Figures checked 28 October 2026. When Ofgem sets final rates, edit CONFIG only. */
(function (root) {
  "use strict";
  var CONFIG = {
    checked: "2026-10-28",
    capPeriod: "1 October to 31 December 2026",
    // Ofgem price cap, Great Britain average, Direct Debit. Includes 5% VAT on gas.
    unitRatePence: 7.97,
    standingChargePencePerDay: 29.68,
    // MSE estimate of the gas unit rate once the standing charge is folded in
    newUnitRatePence: 9.11,
    // Ofgem typical domestic consumption value for gas
    defaultKwh: 9500,
    daysPerYear: 365,
    treasury: { shareSaving: 0.6, averageSavingPounds: 45, typicalStandingChargePounds: 108 },
    sources: {
      mse: "https://www.moneysavingexpert.com/news/2026/10/energy-standing-charges-scrapped/",
      guardian: "https://www.theguardian.com/money/2026/oct/28/john-healey-to-end-standing-charges-on-gas-bills-ofgem-budget",
      ofgemRates: "https://www.ofgem.gov.uk/information-consumers/energy-advice-households/get-energy-price-cap-standing-charges-and-unit-rates-region",
      ofgemCap: "https://www.ofgem.gov.uk/information-consumers/energy-advice-households/energy-price-cap"
    }
  };
  function num(v) { var n = Number(v); return isFinite(n) ? n : NaN; }
  function annualStandingPence(sc, days) { return sc * (days || CONFIG.daysPerYear); }
  // Monthly bill in pounds to annual kWh under today's tariff
  function kwhFromMonthly(monthlyPounds, unit, sc) {
    var m = num(monthlyPounds), u = num(unit), s = num(sc);
    if (!(m >= 0) || !(u > 0) || !(s >= 0)) return NaN;
    return Math.max(0, (m * 12 * 100 - annualStandingPence(s)) / u);
  }
  function calc(o) {
    var kwh = num(o.kwh), u = num(o.unit), s = num(o.sc), nu = num(o.newUnit);
    if (!(kwh >= 0) || !(u >= 0) || !(s >= 0) || !(nu >= 0)) return { error: "Please enter numbers of zero or more." };
    var scYear = annualStandingPence(s) / 100;
    var nowYear = kwh * u / 100 + scYear;
    var afterYear = kwh * nu / 100;
    var diff = nowYear - afterYear; // positive means a saving
    var rise = nu - u;
    var breakEven = rise > 0 ? annualStandingPence(s) / rise : Infinity;
    return {
      kwh: kwh, standingYear: scYear, nowYear: nowYear, nowMonth: nowYear / 12,
      afterYear: afterYear, afterMonth: afterYear / 12,
      savingYear: diff, savingMonth: diff / 12, unitRise: rise, breakEvenKwh: breakEven
    };
  }
  var api = { CONFIG: CONFIG, calc: calc, kwhFromMonthly: kwhFromMonthly };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.GasSC = api;
})(this);
