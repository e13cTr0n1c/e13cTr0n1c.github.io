/* First Time Buyer ISA against Lifetime ISA. Pure logic, no DOM.
   Works in the browser (window.IsaCompare) and in Node (require). Checked 28 October 2026. */
(function (root) {
  "use strict";
  var RULES = {
    yearlyLimit: 4000, bonusRate: 0.25, priceCap: 450000,
    lisaBonusYearMax: 1000, lisaChargeOverCap: 0.20, lisaChargeOverCapBefore: 0.25, lisaChargeOther: 0.25, lisaChargeFrom: "29 October 2026",
    ftbBonusCap: 20000, ftbLaunch: "April 2029",
    sources: {
      budget: "https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html",
      ootlar: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar",
      lisa: "https://www.gov.uk/lifetime-isa"
    }
  };
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v, d) { if (v === "" || v === undefined || v === null) return d; var n = Number(v); return isFinite(n) ? n : NaN; }
  function calculate(input) {
    var c = num(input.yearly, 4000), years = num(input.years, 5), g = num(input.growth, 4), price = num(input.price, 300000);
    if (isNaN(c) || c < 0) return { error: "Enter how much you save a year." };
    if (isNaN(years) || years < 1 || years > 40 || Math.floor(years) !== years) return { error: "Enter a whole number of years from 1 to 40." };
    if (isNaN(g) || g < -10 || g > 15) return { error: "Enter a growth rate between minus 10% and 15%." };
    if (isNaN(price) || price <= 0) return { error: "Enter the price of the home you want to buy." };
    var paid = Math.min(c, RULES.yearlyLimit), rate = g / 100, lisa = 0, ftb = 0, lisaBonus = 0;
    for (var y = 0; y < years; y++) {
      var b = Math.min(paid * RULES.bonusRate, RULES.lisaBonusYearMax);
      lisaBonus += b;
      lisa = (lisa + paid + b) * (1 + rate);
      ftb = (ftb + paid) * (1 + rate);
    }
    var underCap = price <= RULES.priceCap;
    var ftbBonusRaw = ftb * RULES.bonusRate, ftbBonus = underCap ? Math.min(ftbBonusRaw, RULES.ftbBonusCap) : 0;
    var lisaOut = underCap ? lisa : lisa * (1 - RULES.lisaChargeOverCap);
    return {
      error: false, yearly: paid, capped: c > RULES.yearlyLimit, years: years, underCap: underCap,
      contributions: r2(paid * years),
      lisa: { balance: r2(lisa), bonusPaidIn: r2(lisaBonus), toHome: r2(lisaOut), charge: underCap ? 0 : r2(lisa * RULES.lisaChargeOverCap), oldCharge: underCap ? 0 : r2(lisa * RULES.lisaChargeOverCapBefore) },
      ftb: { balance: r2(ftb), bonus: r2(ftbBonus), bonusCapped: underCap && ftbBonusRaw > RULES.ftbBonusCap, toHome: r2(ftb + ftbBonus), overCapTbc: !underCap },
      difference: r2((ftb + ftbBonus) - lisaOut)
    };
  }
  var api = { RULES: RULES, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.IsaCompare = api;
})(this);
