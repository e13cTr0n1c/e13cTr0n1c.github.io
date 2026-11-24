/* Unit tests for the January 2027 energy bill engine.
   Run: node bill.test.js */
"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var B = require("./bill.js");
var R = B.RATES;

function eq(actual, expected, msg) {
  assert.strictEqual(actual, expected, (msg || "") + " expected " + expected + " got " + actual);
}

function typical(extra) {
  var input = {
    electricityKwh: R.tdcv.electricity.typical,
    gasKwh: R.tdcv.gas.typical,
    payment: "directDebit",
    region: "gb",
    electricityOnly: false
  };
  if (extra) {
    Object.keys(extra).forEach(function (k) { input[k] = extra[k]; });
  }
  return B.calculate(input);
}

eq(R.next.status, "forecast", "January cap is still a forecast");
eq(R.current.status, "official");
eq(R.tdcv.electricity.typical, 2500);
eq(R.tdcv.gas.typical, 9500);
eq(R.tdcv.electricity.low, 1600);
eq(R.tdcv.electricity.high, 3800);
eq(R.tdcv.gas.low, 6000);
eq(R.tdcv.gas.high, 14000);
eq(R.tdcv.previousTypical.electricityKwh, 2700);
eq(R.tdcv.previousTypical.gasKwh, 11500);
eq(R.regions.length, 15, "GB average plus 14 regions");
eq(R.vat.gasPercent, 5);
eq(R.vat.electricityPercent, 0);
eq(R.next.rates, null, "official January rates are not filled in yet");

var dd = typical();
eq(dd.ok, true);
eq(dd.current.electricityPence, 85813, "current typical electricity");
eq(dd.current.gasPence, 86548, "current typical gas");
eq(dd.current.yearlyPence, 172361, "current typical dual fuel");
eq(dd.current.monthlyPence, 14363);
eq(dd.next.electricityPence, 101709, "forecast electricity matches Cornwall table");
eq(dd.next.gasPence, 114880, "forecast gas matches Cornwall table");
eq(dd.next.yearlyPence, 216589, "forecast total matches Cornwall table");
eq(dd.next.monthlyPence, 18049);
eq(dd.change.yearlyPence, 44228);
eq(dd.change.monthlyPence, 3686);
eq(dd.change.percent, 25.7);
eq(dd.change.direction, "up");
eq(dd.status, "forecast");
eq(dd.current.rates.electricityUnitPence, 26.32);
eq(dd.current.rates.electricityStandingPence, 54.83);
eq(dd.current.rates.gasUnitPence, 7.97);
eq(dd.current.rates.gasStandingPence, 29.68);
eq(dd.next.rates.electricityUnitPence, 32.54);
eq(dd.next.rates.gasUnitPence, 10.90);
eq(dd.next.rates.electricityStandingPence, 55.78);
eq(dd.next.rates.gasStandingPence, 31.04);

/* A flat 26% of the current bill is not the method. */
assert.notStrictEqual(Math.round(172361 * 1.26), 216589, "do not scale the whole bill by 26%");
eq(R.next.forecast.reportedRisePercent, 26);
eq(R.next.forecast.typicalDualFuelDirectDebitPounds, 2166);
eq(R.next.forecast.increaseOnHeadlinePounds, 443);
eq(R.current.headlinePounds.directDebit, 1723);
eq(1723 + 443, 2166);

var elecOnly = typical({ electricityOnly: true, gasKwh: 50000 });
eq(elecOnly.ok, true);
eq(elecOnly.gasKwh, 0);
eq(elecOnly.current.gasPence, 0);
eq(elecOnly.next.gasPence, 0);
eq(elecOnly.current.yearlyPence, 85813);
eq(elecOnly.next.yearlyPence, 101709);
eq(elecOnly.current.rates.gasUnitPence, null);

var standingOnly = B.calculate({
  electricityKwh: 0, gasKwh: 0, payment: "directDebit", region: "gb"
});
eq(standingOnly.ok, true);
eq(standingOnly.current.yearlyPence, 20013 + 10833, "standing charges still apply at zero use");

var low = typical({
  electricityKwh: R.tdcv.electricity.low,
  gasKwh: R.tdcv.gas.low
});
var high = typical({
  electricityKwh: R.tdcv.electricity.high,
  gasKwh: R.tdcv.gas.high
});
assert.ok(low.current.yearlyPence < dd.current.yearlyPence);
assert.ok(high.current.yearlyPence > dd.current.yearlyPence);
assert.ok(low.change.yearlyPence < dd.change.yearlyPence, "lower use sees a smaller pound rise");
assert.ok(high.change.yearlyPence > dd.change.yearlyPence);

var credit = typical({ payment: "standardCredit" });
var prepay = typical({ payment: "prepayment" });
assert.ok(credit.current.yearlyPence > dd.current.yearlyPence);
assert.ok(prepay.current.yearlyPence < dd.current.yearlyPence);
eq(credit.current.rates.electricityUnitPence, 27.80);
eq(credit.current.rates.gasStandingPence, 37.49);
eq(prepay.current.rates.electricityUnitPence, 25.52);
eq(prepay.current.rates.electricityStandingPence, 54.83);

/* London is scaled from its own current rates, not given the GB average rates. */
var london = typical({ region: "london" });
assert.notStrictEqual(london.current.yearlyPence, dd.current.yearlyPence);
assert.notStrictEqual(london.next.yearlyPence, dd.next.yearlyPence);
var bench = R.current.rates.directDebit.gb;
var lon = R.current.rates.directDebit.london;
var basis = R.next.forecast.basis;
var elecStandingYear = Math.round(basis.electricity.annualPounds * 100) - basis.electricityKwh * basis.electricity.unitPence;
var gasStandingYear = Math.round(basis.gas.annualPounds * 100) - basis.gasKwh * basis.gas.unitPence;
var londonElecUnit = lon.electricityUnitPence * (basis.electricity.unitPence / bench.electricityUnitPence);
var londonElecStanding = lon.electricityStandingPence * (elecStandingYear / (bench.electricityStandingPence * R.daysInYear));
var londonGasUnit = lon.gasUnitPence * (basis.gas.unitPence / bench.gasUnitPence);
var londonGasStanding = lon.gasStandingPence * (gasStandingYear / (bench.gasStandingPence * R.daysInYear));
var londonNext = Math.round(2500 * londonElecUnit + londonElecStanding * 365) + Math.round(9500 * londonGasUnit + londonGasStanding * 365);
eq(london.next.yearlyPence, londonNext, "London uses the same scales");
eq(london.current.rates.electricityStandingPence, 42.92);
eq(R.current.rates.directDebit.merseysideNorthWales.electricityStandingPence, 67.66);

var blank = B.calculate({ electricityKwh: "", gasKwh: 9500 });
eq(blank.ok, false);
var negative = B.calculate({ electricityKwh: -1, gasKwh: 100 });
eq(negative.ok, false);
var badRegion = B.calculate({ electricityKwh: 1, gasKwh: 1, region: "belfast" });
eq(badRegion.ok, false);
var commas = B.calculate({ electricityKwh: "2,500", gasKwh: "9,500", payment: "directDebit", region: "gb" });
eq(commas.ok, true);
eq(commas.current.yearlyPence, 172361);

/* Official figures replace the forecast as soon as next.rates is filled in. */
var official = JSON.parse(JSON.stringify(R));
official.next.status = "official";
official.next.rates = {
  directDebit: {
    gb: {
      electricityStandingPence: 60,
      electricityUnitPence: 30,
      gasStandingPence: 40,
      gasUnitPence: 10
    }
  }
};
var swapped = B.calculate({
  electricityKwh: 2500, gasKwh: 9500, payment: "directDebit", region: "gb"
}, official);
eq(swapped.ok, true);
eq(swapped.status, "official");
eq(swapped.next.yearlyPence, 96900 + 109600);
assert.notStrictEqual(swapped.next.yearlyPence, 216589);

var missingOfficial = JSON.parse(JSON.stringify(R));
missingOfficial.next.status = "official";
missingOfficial.next.rates = null;
var blocked = B.calculate({ electricityKwh: 100, gasKwh: 100 }, missingOfficial);
eq(blocked.ok, false);

["rates.js", "bill.js", "bill.test.js", "app.js", "index.html"].forEach(function (name) {
  var src = fs.readFileSync(path.join(__dirname, name), "utf8");
  assert.ok(src.indexOf("\u2014") === -1, name + " has an em dash");
  assert.ok(src.indexOf("\u2013") === -1, name + " has an en dash");
});

var page = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.ok(page.indexOf("FAQPage") !== -1);
assert.ok(page.indexOf("WebApplication") !== -1);
assert.ok(page.indexOf("energy price cap January 2027") !== -1);
assert.ok(page.indexOf("how much will my energy bill go up") !== -1);
assert.ok(page.indexOf("FORECAST") !== -1);
assert.ok(page.indexOf("25 November 2026") !== -1);
assert.ok(page.indexOf("not financial advice") !== -1);
assert.ok(page.indexOf(R.current.sourceUrl) !== -1);
assert.ok(page.indexOf(R.next.forecast.sourceUrl) !== -1);
assert.ok(page.indexOf("../gas-standing-charge-calculator/") !== -1);
assert.ok(page.indexOf("../household-energy-payment-checker/") !== -1);
assert.ok(page.indexOf("../christmas-budget-planner/") !== -1);
assert.ok(page.indexOf("utm_source=plainsums&utm_medium=calc&utm_campaign=energy-bill-calculator-january-2027") !== -1);
assert.ok(page.indexOf("static.cloudflareinsights.com/beacon.min.js") !== -1);

console.log("bill.test.js: all assertions passed");
console.log("Typical Direct Debit, Great Britain average:");
console.log("  now yearly pence", dd.current.yearlyPence, "monthly", dd.current.monthlyPence);
console.log("  forecast yearly pence", dd.next.yearlyPence, "monthly", dd.next.monthlyPence);
console.log("  change yearly pence", dd.change.yearlyPence, "monthly", dd.change.monthlyPence, "percent", dd.change.percent);
