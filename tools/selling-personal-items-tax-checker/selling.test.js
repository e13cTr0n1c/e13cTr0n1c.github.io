/* Unit tests for the personal possessions tax checker.
   Run: node selling.test.js
   The £2,500 cap is the HS293 antique mirror example: £7,500 sale, £1,500 over £6,000, times 5/3.
   The annual exempt amount is £3,000 for 2026 to 2027.
   The trading allowance is £1,000 until 5 April 2027 and £3,000 from 6 April 2027. */
"use strict";
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var S = require("./selling.js");

function eq(actual, expected, msg) {
  assert.strictEqual(actual, expected, (msg || "") + " expected " + expected + " got " + actual);
}

function has(text, needle, msg) {
  assert.ok(String(text).indexOf(needle) !== -1, (msg || needle) + " missing from: " + text);
}

eq(S.formatPounds(0), "£0");
eq(S.formatPounds(250000), "£2,500");
eq(S.formatPounds(666667), "£6,666.67");
eq(S.formatPounds(2), "£0.02");
eq(S.formatPounds(100000050), "£1,000,000.50");

eq(S.moneyToPence(""), null);
eq(S.moneyToPence("6000"), 600000);
eq(S.moneyToPence("6000.01"), 600001);
eq(S.moneyToPence("£7,500.00"), 750000);
eq(isNaN(S.moneyToPence("-1")), true);
eq(isNaN(S.moneyToPence("10.555")), true);

eq(S.RULES.chattelLimitPence, 600000);
eq(S.RULES.marginalCeilingPence, 1500000);
eq(S.RULES.annualExemptPence, 300000);
eq(S.RULES.tradingAllowancePence, 100000);
eq(S.RULES.tradingAllowanceNextPence, 300000);
eq(S.RULES.platformSales, 30);
eq(S.RULES.platformEuros, 2000);
eq(S.RULES.checked, "2026-11-27");

eq(S.marginalCapPence(600000), 0, "£6,000 is not over the line");
eq(S.marginalCapPence(600001), 2, "1p over rounds to 2p");
eq(S.marginalCapPence(750000), 250000, "HS293 mirror");
eq(S.marginalCapPence(780000), 300000, "£7,800 caps at the exempt amount");
eq(S.marginalCapPence(1000000), 666667, "£10,000 caps at £6,666.67");
eq(S.marginalCapPence(1500000), 1500000, "£15,000 cap equals the price");
eq(S.marginalCapPence(1500001), null, "above £15,000 has no cap");

var blank = S.check({});
eq(blank.ok, false);
has(blank.error, "own used things");

var ownNoPrice = S.check({ activity: "own" });
eq(ownNoPrice.ok, false);
has(ownNoPrice.error, "sale price");

var badPrice = S.check({ activity: "own", sale: "12.345", soldForLess: "no", asset: "neither" });
eq(badPrice.ok, false);

var noSold = S.check({ activity: "own", sale: "100", asset: "neither" });
eq(noSold.ok, false);
has(noSold.error, "less than you paid");

var noAsset = S.check({ activity: "own", sale: "100", soldForLess: "no" });
eq(noAsset.ok, false);

var carNeedsBusiness = S.check({ activity: "own", sale: "50000", soldForLess: "no", asset: "car" });
eq(carNeedsBusiness.ok, false);
has(carNeedsBusiness.error, "business");

var under = S.check({ activity: "own", sale: "40", soldForLess: "no", asset: "neither" });
eq(under.ok, true);
eq(under.outcome, "under-limit");
eq(under.tone, "clear");
has(under.paragraphs.join(" "), "did not exceed £6,000");
has(under.paragraphs.join(" "), "not a tax");
eq(under.showSideHustleLinks, false);

var exact = S.check({ activity: "own", sale: "6000", soldForLess: "no", asset: "neither" });
eq(exact.outcome, "under-limit", "exactly £6,000 is not over the line");
has(exact.paragraphs.join(" "), "did not exceed £6,000");

var justOver = S.check({ activity: "own", sale: "6000.01", soldForLess: "no", asset: "neither" });
eq(justOver.outcome, "over-limit");
eq(justOver.marginalRelief, true);
eq(justOver.maxChargeableGainPence, 2);
eq(justOver.aboveExempt, false);

var mirror = S.check({ activity: "own", sale: "7500", soldForLess: "no", asset: "neither" });
eq(mirror.outcome, "over-limit");
eq(mirror.maxChargeableGainPence, 250000);
eq(mirror.aboveExempt, false);
eq(mirror.annualExemptPence, 300000);
has(mirror.headline, "may be due");
has(mirror.paragraphs.join(" "), "£2,500");
has(mirror.paragraphs.join(" "), "£3,000");
has(mirror.paragraphs.join(" "), "5/3");

var atExempt = S.check({ activity: "own", sale: "7800", soldForLess: "unknown", asset: "neither" });
eq(atExempt.maxChargeableGainPence, 300000);
eq(atExempt.aboveExempt, false, "exactly £3,000 is not above the allowance");
has(atExempt.paragraphs.join(" "), "do not know what you paid");

var highCap = S.check({ activity: "own", sale: "10000", soldForLess: "no", asset: "neither" });
eq(highCap.maxChargeableGainPence, 666667);
eq(highCap.aboveExempt, true);
has(highCap.paragraphs.join(" "), "18%");
has(highCap.paragraphs.join(" "), "24%");

var noCap = S.check({ activity: "own", sale: "15000.01", soldForLess: "no", asset: "neither" });
eq(noCap.outcome, "over-limit");
eq(noCap.marginalRelief, false);
eq(noCap.maxChargeableGainPence, null);
eq(noCap.aboveExempt, null);
has(noCap.paragraphs.join(" "), "more than £15,000");

var atCeiling = S.check({ activity: "own", sale: "15000", soldForLess: "no", asset: "neither" });
eq(atCeiling.marginalRelief, true);
eq(atCeiling.maxChargeableGainPence, 1500000);

var lossUnder = S.check({ activity: "own", sale: "20", soldForLess: "yes", asset: "neither" });
eq(lossUnder.outcome, "no-gain");
eq(lossUnder.lossRestricted, true);
has(lossUnder.paragraphs.join(" "), "no Capital Gains Tax");
has(lossUnder.paragraphs.join(" "), "as if you had sold the possession for £6,000");

var lossExact = S.check({ activity: "own", sale: "6000", soldForLess: "yes", asset: "neither" });
eq(lossExact.outcome, "no-gain");
eq(lossExact.lossRestricted, false);

var lossOver = S.check({ activity: "own", sale: "8000", soldForLess: "yes", asset: "neither" });
eq(lossOver.outcome, "no-gain");
eq(lossOver.lossRestricted, false);
has(lossOver.paragraphs.join(" "), "£6,000 or more");

var car = S.check({ activity: "own", sale: "40000", soldForLess: "no", asset: "car", businessUse: "no" });
eq(car.outcome, "car-exempt");
eq(car.tone, "clear");
has(car.paragraphs.join(" "), "unless you have used it for business");

var carBiz = S.check({ activity: "own", sale: "4000", soldForLess: "yes", asset: "car", businessUse: "yes" });
eq(carBiz.outcome, "car-business");
has(carBiz.headline, "may not apply");
has(carBiz.paragraphs.join(" "), "cannot treat it as exempt");

var wasting = S.check({ activity: "own", sale: "9000", soldForLess: "no", asset: "wasting", businessUse: "no" });
eq(wasting.outcome, "wasting-exempt");
has(wasting.paragraphs.join(" "), "50 years");
has(wasting.paragraphs.join(" "), "exempt");

var wastingBiz = S.check({ activity: "own", sale: "500", soldForLess: "unknown", asset: "wasting", businessUse: "yes" });
eq(wastingBiz.outcome, "wasting-business");
has(wastingBiz.paragraphs.join(" "), "capital allowances");
has(wastingBiz.paragraphs.join(" "), "jewellery");

var resell = S.check({ activity: "resell" });
eq(resell.ok, true);
eq(resell.outcome, "trading");
eq(resell.showSideHustleLinks, true);
has(resell.paragraphs.join(" "), "£1,000");
has(resell.paragraphs.join(" "), "6 April 2027");
has(resell.paragraphs.join(" "), "£3,000");
has(resell.paragraphs.join(" "), "badges of trade");
has(resell.paragraphs.join(" "), "fewer than 30 sales");
has(resell.paragraphs.join(" "), "not a tax");
has(resell.paragraphs.join(" "), "not tax advice");

var make = S.check({ activity: "make", sale: "12", soldForLess: "no", asset: "neither" });
eq(make.outcome, "trading");
has(make.paragraphs[0], "make items to sell");
eq(make.showSideHustleLinks, true);

var badTradePrice = S.check({ activity: "resell", sale: "nope" });
eq(badTradePrice.ok, false);

var gift = S.check({ activity: "own", sale: "0", soldForLess: "unknown", asset: "neither" });
eq(gift.outcome, "under-limit");
has(gift.paragraphs.join(" "), "market value");

["under-limit", "over-limit", "no-gain", "car-exempt", "car-business", "wasting-exempt", "wasting-business", "trading"].forEach(function (name) {
  assert.ok(name);
});

var outcomes = [
  S.check({ activity: "own", sale: "10", soldForLess: "no", asset: "neither" }),
  S.check({ activity: "own", sale: "7500", soldForLess: "no", asset: "neither" }),
  S.check({ activity: "own", sale: "15", soldForLess: "yes", asset: "neither" }),
  S.check({ activity: "own", sale: "1", soldForLess: "no", asset: "car", businessUse: "no" }),
  S.check({ activity: "own", sale: "1", soldForLess: "no", asset: "car", businessUse: "yes" }),
  S.check({ activity: "own", sale: "1", soldForLess: "no", asset: "wasting", businessUse: "no" }),
  S.check({ activity: "own", sale: "1", soldForLess: "no", asset: "wasting", businessUse: "yes" }),
  S.check({ activity: "make" })
];
outcomes.forEach(function (r) {
  eq(r.ok, true, r.outcome);
  has(r.paragraphs.join(" "), "not a tax", r.outcome);
  has(r.paragraphs.join(" "), "not tax advice", r.outcome);
});

var files = ["selling.js", "selling.test.js", "app.js", "index.html"];
files.forEach(function (name) {
  var src = fs.readFileSync(path.join(__dirname, name), "utf8");
  var spaced = " " + "-" + " ";
  assert.ok(src.indexOf("\u2014") === -1, name + " has an em dash");
  assert.ok(src.indexOf("\u2013") === -1, name + " has an en dash");
  assert.ok(src.indexOf(spaced) === -1, name + " has a spaced hyphen used as a dash");
});

var page = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.ok(page.indexOf("FAQPage") !== -1);
assert.ok(page.indexOf("WebApplication") !== -1);
assert.ok(page.indexOf("Do I pay tax selling my old stuff?") !== -1);
assert.ok(page.indexOf("Do I pay tax selling on Vinted?") !== -1);
assert.ok(page.indexOf("tax on eBay sales") !== -1);
assert.ok(page.indexOf("HMRC Vinted 30 sales rule") !== -1);
assert.ok(page.indexOf("selling personal items") !== -1);
assert.ok(page.indexOf("not tax advice") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/capital-gains-tax-personal-possessions") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/government/publications/chattels-and-capital-gains-tax-hs293-self-assessment-helpsheet/personal-possessions-and-capital-gains-tax-2026-hs293") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/guidance/capital-gains-tax-rates-and-allowances") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/guidance/check-if-you-need-to-register-as-a-digital-platform-operator") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/government/publications/income-tax-increasing-the-trading-allowance/increasing-the-trading-allowance") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/hmrc-internal-manuals/business-income-manual/bim20205") !== -1);
assert.ok(page.indexOf("../side-hustle-trading-allowance-checker/") !== -1);
assert.ok(page.indexOf("../side-hustle-tax-calculator/") !== -1);
assert.ok(page.indexOf("27 November 2026") !== -1);
assert.ok(page.indexOf("£3,000") !== -1);
assert.ok(page.indexOf("£6,000") !== -1);
assert.ok(page.indexOf("gumroad") === -1);
assert.ok(page.indexOf("50becbbfccc84869ae6ea32a24a32453") !== -1);

console.log("selling.test.js: all assertions passed");
