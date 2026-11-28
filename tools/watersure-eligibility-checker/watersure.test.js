/* Unit tests for the WaterSure eligibility checker.
   Run: node watersure.test.js
   Rules checked 28 November 2026 against the 2015 regulations,
   GOV.UK on 6 March 2026 and 27 November 2026, CCW, and Ofwat's 2025-26 report. */
"use strict";
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var W = require("./watersure.js");

function eq(actual, expected, msg) {
  assert.strictEqual(actual, expected, (msg || "") + " expected " + expected + " got " + actual);
}

function base(over) {
  var row = {
    nation: "england",
    meter: "meter",
    benefit: "universal-credit",
    reason: "children",
    childBenefit: "yes",
    blockedUse: "no"
  };
  if (!over) return row;
  Object.keys(over).forEach(function (key) { row[key] = over[key]; });
  return row;
}

eq(W.RULES.checked, "2026-11-28");
eq(W.RULES.childAgeUnder, 19);
eq(W.RULES.requireFullTimeEducation, false, "Ofwat mentions full-time education; the regulations do not");
eq(W.RULES.futureInForce, false);
eq(W.RULES.futureIncomeCapPounds, 25745);
eq(W.RULES.govNov2026PoundsOff, 428);
eq(W.RULES.govNov2026CallsItAverage, false);
eq(W.RULES.govNov2026IsFixedPayment, false);
eq(W.RULES.ofwat202526AverageSavingPounds, 413);
eq(W.RULES.gov202425AverageReductionPounds, 325);
eq(W.RULES.poolLitres, 10000);
eq(W.RULES.qualifyingBenefits.length, 8);
eq(W.RULES.qualifyingBenefits.indexOf("disability-only"), -1);
eq(W.RULES.qualifyingBenefits.indexOf("universal-credit") !== -1, true);
eq(W.RULES.qualifyingBenefits.indexOf("income-related-esa") !== -1, true);
eq(W.RULES.ccwNamedBenefits.length, 3, "CCW's FAQ names only three benefits");
eq(W.RULES.listedConditions.length, 7);

var likely = W.check(base());
eq(likely.ok, true);
eq(likely.status, "likely");
eq(likely.code, "likely");
eq(likely.message.indexOf("not a fixed payment") !== -1, true);
eq(likely.points.join(" ").indexOf("£428") !== -1, true);
eq(likely.points.join(" ").indexOf("does not call £428 an average") !== -1, true);
eq(likely.points.join(" ").indexOf("£413") !== -1, true);
eq(likely.points.join(" ").indexOf("does not change the tests") !== -1, true);
eq(likely.points.join(" ").indexOf("full-time education") !== -1, true);
eq(likely.points.join(" ").indexOf("already 19 does not count") !== -1, true);

["pension-credit", "income-support", "income-based-jsa", "income-related-esa", "housing-benefit", "working-tax-credit"].forEach(function (benefit) {
  var row = W.check(base({ benefit: benefit }));
  eq(row.status, "likely", benefit);
});

var ctc = W.check(base({ benefit: "child-tax-credit", ctcIndividual: "yes" }));
eq(ctc.status, "likely", "CTC with the individual element");

var ctcNo = W.check(base({ benefit: "child-tax-credit", ctcIndividual: "no" }));
eq(ctcNo.status, "not-eligible");
eq(ctcNo.code, "ctc-no-individual");

var ctcUnsure = W.check(base({ benefit: "child-tax-credit", ctcIndividual: "unsure" }));
eq(ctcUnsure.status, "check");
eq(ctcUnsure.code, "ctc-unsure");

var waiting = W.check(base({ meter: "waiting" }));
eq(waiting.status, "likely", "GOV.UK and Ofwat include waiting for a meter");
eq(waiting.points.join(" ").indexOf("waiting for a meter") !== -1, true);

var assessed = W.check(base({ meter: "assessed" }));
eq(assessed.status, "check");
eq(assessed.code, "assessed-charge");
eq(assessed.message.indexOf("not calling it a pass") !== -1, true);

var noMeter = W.check(base({ meter: "none" }));
eq(noMeter.status, "not-eligible");
eq(noMeter.code, "no-meter");

var meterUnsure = W.check(base({ meter: "unsure" }));
eq(meterUnsure.status, "check");
eq(meterUnsure.code, "meter-unsure");

var noBenefit = W.check(base({ benefit: "none" }));
eq(noBenefit.status, "not-eligible");
eq(noBenefit.code, "no-benefit");

var benefitUnsure = W.check(base({ benefit: "unsure" }));
eq(benefitUnsure.status, "check");
eq(benefitUnsure.code, "benefit-unsure");

var pip = W.check(base({ benefit: "disability-only", reason: "medical", medicalKind: "listed", condition: "crohns", extraWater: "yes" }));
eq(pip.status, "not-eligible");
eq(pip.code, "disability-not-in-force");
eq(pip.message.indexOf("£25,745") !== -1, true);
eq(pip.message.indexOf("early 2027") !== -1, true);
eq(pip.message.indexOf("not in force") !== -1, true);
eq(W.RULES.futureInForce, false);

var medical = W.check(base({
  reason: "medical",
  medicalKind: "listed",
  condition: "crohns",
  extraWater: "yes"
}));
eq(medical.status, "likely");
eq(medical.points.join(" ").indexOf("Crohn's disease") !== -1, true);
eq(medical.points.join(" ").indexOf("doctor's note") !== -1, true);

["desquamation", "weeping-skin", "incontinence", "abdominal-stoma", "ulcerative-colitis"].forEach(function (condition) {
  var row = W.check(base({
    reason: "medical",
    medicalKind: "listed",
    condition: condition,
    extraWater: "yes"
  }));
  eq(row.status, "likely", condition);
});

var dialysis = W.check(base({
  reason: "medical",
  medicalKind: "listed",
  condition: "dialysis",
  dialysisContribution: "no",
  extraWater: "yes"
}));
eq(dialysis.status, "likely");

var dialysisPaid = W.check(base({
  reason: "medical",
  medicalKind: "listed",
  condition: "dialysis",
  dialysisContribution: "yes",
  extraWater: "yes"
}));
eq(dialysisPaid.status, "not-eligible");
eq(dialysisPaid.code, "dialysis-contribution");

var dialysisUnsure = W.check(base({
  reason: "medical",
  medicalKind: "listed",
  condition: "dialysis",
  dialysisContribution: "unsure",
  extraWater: "yes"
}));
eq(dialysisUnsure.status, "check");
eq(dialysisUnsure.code, "medical-check");

var otherMedical = W.check(base({
  reason: "medical",
  medicalKind: "other",
  extraWater: "yes"
}));
eq(otherMedical.status, "check");
eq(otherMedical.code, "medical-check");
eq(otherMedical.points.join(" ").indexOf("registered medical practitioner") !== -1, true);

var noExtra = W.check(base({
  reason: "medical",
  medicalKind: "listed",
  condition: "incontinence",
  extraWater: "no"
}));
eq(noExtra.status, "not-eligible");
eq(noExtra.code, "no-extra-water");

var noChildren = W.check(base({ childBenefit: "no" }));
eq(noChildren.status, "not-eligible");
eq(noChildren.code, "no-child-benefit");
eq(noChildren.message.indexOf("full-time education") !== -1, true);

var childrenUnsure = W.check(base({ childBenefit: "unsure" }));
eq(childrenUnsure.status, "check");
eq(childrenUnsure.code, "child-benefit-unsure");

var neither = W.check(base({ reason: "neither" }));
eq(neither.status, "not-eligible");
eq(neither.code, "no-high-use");

var reasonUnsure = W.check(base({ reason: "unsure" }));
eq(reasonUnsure.status, "check");
eq(reasonUnsure.code, "confirm");

var bothSavedByMedical = W.check(base({
  reason: "both",
  childBenefit: "no",
  medicalKind: "listed",
  condition: "ulcerative-colitis",
  extraWater: "yes"
}));
eq(bothSavedByMedical.status, "likely", "one route is enough");

var bothFail = W.check(base({
  reason: "both",
  childBenefit: "no",
  medicalKind: "listed",
  condition: "crohns",
  extraWater: "no"
}));
eq(bothFail.status, "not-eligible");
eq(bothFail.code, "no-high-use");

var sprinkler = W.check(base({ blockedUse: "yes" }));
eq(sprinkler.status, "not-eligible");
eq(sprinkler.code, "blocked-use");
eq(sprinkler.message.indexOf("10,000 litres") !== -1, true);

var sprinklerUnsure = W.check(base({ blockedUse: "unsure" }));
eq(sprinklerUnsure.status, "check");
eq(sprinklerUnsure.code, "blocked-unsure");

var wales = W.check(base({ nation: "wales" }));
eq(wales.status, "check");
eq(wales.code, "wales-voluntary");
eq(wales.message.indexOf("voluntarily") !== -1, true);
eq(wales.points.join(" ").indexOf("Dŵr Cymru") !== -1, true);

var walesFail = W.check(base({ nation: "wales", benefit: "none" }));
eq(walesFail.status, "not-eligible");
eq(walesFail.code, "no-benefit");
eq(walesFail.points.join(" ").indexOf("voluntarily") !== -1, true);

var scotland = W.check(base({ nation: "scotland", meter: "none", benefit: "none" }));
eq(scotland.status, "check");
eq(scotland.code, "outside");
eq(scotland.message.indexOf("Scotland") !== -1, true);
eq(scotland.message.indexOf("not a finding that you get no help") !== -1, true);

var ni = W.check(base({ nation: "northern-ireland" }));
eq(ni.status, "check");
eq(ni.code, "outside");
eq(ni.message.indexOf("Northern Ireland") !== -1, true);

var missing = W.check({ nation: "england" });
eq(missing.ok, false);

var bad = W.check(base({ benefit: "council-tax-reduction" }));
eq(bad.ok, false);

var absentPage = "energy-bill-calculator-" + "january-2027";
["watersure.js", "watersure.test.js", "app.js", "index.html"].forEach(function (name) {
  var file = path.join(__dirname, name);
  if (!fs.existsSync(file)) return;
  var src = fs.readFileSync(file, "utf8");
  assert.ok(src.indexOf("\u2014") === -1, name + " has an em dash");
  assert.ok(src.indexOf("\u2013") === -1, name + " has an en dash");
  if (name !== "watersure.test.js") {
    assert.ok(src.indexOf(absentPage) === -1, name + " links a page that is not on main");
  }
});

var pagePath = path.join(__dirname, "index.html");
if (fs.existsSync(pagePath)) {
  var page = fs.readFileSync(pagePath, "utf8");
  assert.ok(page.indexOf("FAQPage") !== -1);
  assert.ok(page.indexOf("WebApplication") !== -1);
  assert.ok(page.indexOf("Can I get WaterSure?") !== -1);
  assert.ok(page.indexOf("Who qualifies for WaterSure?") !== -1);
  assert.ok(page.indexOf("How much does WaterSure save?") !== -1);
  assert.ok(page.indexOf("How do I apply?") !== -1);
  assert.ok(page.indexOf("https://www.gov.uk/government/news/over-half-a-million-households-to-get-help-with-water-bills") !== -1);
  assert.ok(page.indexOf("https://questions-statements.parliament.uk/written-statements/detail/2026-11-27/HCWS512") !== -1);
  assert.ok(page.indexOf("https://www.gov.uk/government/news/reduced-bills-for-around-300000-households-in-watersure-reform") !== -1);
  assert.ok(page.indexOf("https://www.ccw.org.uk/faq/what-is-watersure/") !== -1);
  assert.ok(page.indexOf("https://www.legislation.gov.uk/uksi/2015/365/regulation/2") !== -1);
  assert.ok(page.indexOf("https://www.ofwat.gov.uk/wp-content/uploads/2026/10/Customer-service-and-support-Company-performance-summary-2025-26.pdf") !== -1);
  assert.ok(page.indexOf("28 November 2026") !== -1);
  assert.ok(page.indexOf("general guidance") !== -1);
  assert.ok(page.indexOf("../household-energy-payment-checker/") !== -1);
  assert.ok(page.indexOf("../gas-standing-charge-calculator/") !== -1);
  assert.ok(page.indexOf("../can-i-live-on-this-wage/") !== -1);
  assert.ok(page.indexOf("../is-this-hmrc-message-real/") !== -1);
  assert.ok(page.indexOf("not a fixed payment") !== -1);
  assert.ok(page.indexOf("£25,745") !== -1);
  assert.ok(page.indexOf("early 2027") !== -1);
  assert.ok(page.indexOf("static.cloudflareinsights.com/beacon.min.js") !== -1);
}

console.log("watersure.test.js: all assertions passed");
