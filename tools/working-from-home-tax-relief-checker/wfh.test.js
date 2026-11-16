/* Unit tests for the working from home tax relief checker.
   Run: node wfh.test.js
   The £1.20 a week figure is the GOV.UK basic rate example.
   Deadlines are 5 April, four years after the tax year ends. */
"use strict";
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var W = require("./wfh.js");

function eq(actual, expected, msg) {
  assert.strictEqual(actual, expected, (msg || "") + " expected " + expected + " got " + actual);
}

eq(W.formatPounds(6240), "£62.40", "basic year");
eq(W.formatPounds(12480), "£124.80", "higher year");
eq(W.formatPounds(14040), "£140.40", "additional year");
eq(W.formatPounds(250000), "£2,500.00", "P87 line");
eq(W.formatPounds(100000050), "£1,000,000.50", "large exact cost");
eq(W.formatDate("2027-04-05"), "5 April 2027");
eq(W.formatDate("2026-04-06"), "6 April 2026");
eq(W.countdownLabel(140), "140 days left");
eq(W.countdownLabel(1), "1 day left");
eq(W.countdownLabel(0), "Closes today");
eq(W.countdownLabel(-1), "Closed");

eq(W.RULES.weeklyPence, 600, "£6 a week");
eq(W.RULES.defaultWeeks, 52);
eq(W.RULES.p87Pence, 250000);
eq(W.RULES.noRelief.id, "2026-27");
eq(W.RULES.noRelief.from, "2026-04-06");
eq(W.yearById, undefined, "year lookup stays private");

// 2022/23 ends 5 April 2023 and closes 5 April 2027. Same shape for the later years.
var expectClose = {
  "2022-23": "2027-04-05",
  "2023-24": "2028-04-05",
  "2024-25": "2029-04-05",
  "2025-26": "2030-04-05"
};
W.RULES.years.forEach(function (y) {
  eq(y.claimBy, expectClose[y.id], y.label + " close");
  var end = y.end.split("-");
  var close = y.claimBy.split("-");
  eq(close[1] + "-" + close[2], "04-05", "closes on 5 April");
  eq(Number(close[0]), Number(end[0]) + 4, "four years after the year ends");
});

var on16Nov = W.deadlines("2026-11-16");
eq(on16Nov.length, 4);
eq(on16Nov[0].daysLeft, 140, "2022/23 countdown from 16 November 2026");
eq(on16Nov[0].countdown, "140 days left");
eq(on16Nov[0].open, true);
eq(on16Nov[0].claimByLabel, "5 April 2027");
eq(on16Nov[1].daysLeft, 506);
eq(on16Nov[2].daysLeft, 871);
eq(on16Nov[3].daysLeft, 1236);
eq(on16Nov[3].claimByLabel, "5 April 2030");

var closingDay = W.deadlines("2027-04-05");
eq(closingDay[0].daysLeft, 0);
eq(closingDay[0].open, true);
eq(closingDay[0].countdown, "Closes today");
var dayAfter = W.deadlines("2027-04-06");
eq(dayAfter[0].daysLeft, -1);
eq(dayAfter[0].open, false);
eq(dayAfter[0].countdown, "Closed");
eq(dayAfter[1].open, true, "2023/24 still open the day 2022/23 closes");

// GOV.UK example: 20% of £6 is £1.20 a week. 52 weeks is £62.40.
var basic = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "basic",
  today: "2026-11-16",
  years: [{ id: "2025-26" }]
});
eq(basic.ok, true);
eq(basic.eligible, true);
eq(basic.years[0].weeks, 52, "blank weeks means 52");
eq(basic.years[0].expensePence, 31200);
eq(basic.years[0].reliefPence, 6240);
eq(basic.totalReliefPence, 6240);
eq(basic.weeklyRelief, "£1.20 a week");
eq(basic.years[0].working, "£6 a week for 52 weeks is £312.00. At 20% the relief is £62.40. That is £1.20 a week.");
eq(basic.route, "online");
eq(basic.years[0].overP87, false);
eq(basic.years[0].claimBy, "2030-04-05");

var higher = W.calculate({
  reason: "far-away",
  mode: "flat",
  rateId: "higher",
  today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 52 }]
});
eq(higher.years[0].reliefPence, 12480, "40% of £312");
eq(higher.weeklyRelief, "£2.40 a week");

var additional = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "additional",
  today: "2026-11-16",
  years: [{ id: "2024-25", weeks: "52" }]
});
eq(additional.years[0].reliefPence, 14040, "45% of £312");
eq(additional.weeklyRelief, "£2.70 a week");

// Scottish style other rate. 21% of £312 is £65.52. 42% is £131.04.
var scottish = W.calculate({
  reason: "far-away",
  mode: "flat",
  rateId: "other",
  otherPercent: "21",
  today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 52 }]
});
eq(scottish.rateText, "21%");
eq(scottish.years[0].reliefPence, 6552);

var scottishHigher = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "other",
  otherPercent: "42.5",
  today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 1 }]
});
eq(scottishHigher.rateText, "42.5%");
eq(scottishHigher.years[0].expensePence, 600);
eq(scottishHigher.years[0].reliefPence, 255, "42.5% of £6 is £2.55");
eq(scottishHigher.years[0].working, "£6 a week for 1 week is £6.00. At 42.5% the relief is £2.55. That is £2.55 a week.");

var partYear = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "basic",
  today: "2026-11-16",
  years: [{ id: "2023-24", weeks: 26 }]
});
eq(partYear.years[0].expensePence, 15600);
eq(partYear.years[0].reliefPence, 3120, "26 weeks at 20%");

// Two full years at basic rate.
var two = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "basic",
  today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 52 }, { id: "2022-23", weeks: 52 }]
});
eq(two.years[0].id, "2022-23", "years come out in date order");
eq(two.years[1].id, "2025-26");
eq(two.totalReliefPence, 12480, "two basic years");
eq(two.totalClaimPence, 62400);

// Employer paid some of it back. Relief is only on the rest.
var partPaid = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "basic",
  today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 52, employerPaid: "100" }]
});
eq(partPaid.years[0].claimPence, 21200);
eq(partPaid.years[0].reliefPence, 4240);
eq(partPaid.years[0].working, "£6 a week for 52 weeks is £312.00. Your employer already paid £100.00, so £212.00 is left. At 20% the relief is £42.40.");
eq(partPaid.route, "online");

var paidBack = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "basic",
  today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 52, employerPaid: "312" }]
});
eq(paidBack.totalReliefPence, 0);
eq(paidBack.allFullyReimbursed, true);
eq(paidBack.route, "none");
eq(paidBack.years[0].fullyReimbursed, true);
eq(paidBack.message, "There is nothing left to claim. Your employer has already paid these costs back.");

var paidMore = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "higher",
  today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 52, employerPaid: "400.00" }]
});
eq(paidMore.years[0].claimPence, 0);
eq(paidMore.years[0].reliefPence, 0);

// Exact costs. Receipts are required. £400 at 20% is £80.
var exact = W.calculate({
  reason: "far-away",
  mode: "exact",
  rateId: "basic",
  today: "2026-11-16",
  years: [{ id: "2024-25", exact: "400" }]
});
eq(exact.years[0].expensePence, 40000);
eq(exact.years[0].reliefPence, 8000);
eq(exact.years[0].receipts, true);
eq(exact.years[0].weeks, null);
eq(exact.years[0].working, "Exact extra costs of £400.00. At 20% the relief is £80.00. You need receipts or bills for this amount.");

// £2,500 can still use P87. A penny over cannot.
var atLimit = W.calculate({
  reason: "no-office",
  mode: "exact",
  rateId: "basic",
  today: "2026-11-16",
  years: [{ id: "2025-26", exact: "2500" }]
});
eq(atLimit.years[0].claimPence, 250000);
eq(atLimit.years[0].overP87, false);
eq(atLimit.years[0].reliefPence, 50000, "20% of £2,500");
eq(atLimit.route, "online");

var overLimit = W.calculate({
  reason: "no-office",
  mode: "exact",
  rateId: "basic",
  today: "2026-11-16",
  years: [{ id: "2025-26", exact: "2500.01" }]
});
eq(overLimit.years[0].overP87, true);
eq(overLimit.route, "return");
eq(overLimit.anyOverP87, true);

var mixed = W.calculate({
  reason: "no-office",
  mode: "exact",
  rateId: "basic",
  today: "2026-11-16",
  years: [
    { id: "2024-25", exact: "100" },
    { id: "2025-26", exact: "3000" }
  ]
});
eq(mixed.route, "mixed");
eq(mixed.years[0].overP87, false);
eq(mixed.years[1].overP87, true);

var sa = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "basic",
  selfAssessment: true,
  today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 52 }]
});
eq(sa.route, "return", "Self Assessment filers claim on the return");
eq(sa.totalReliefPence, 6240);

// Penny rounding on an awkward rate. 33.33% of £6 is 199.98 pence, which rounds to £2.00.
var awkward = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "other",
  otherPercent: "33.33",
  today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 1 }]
});
eq(awkward.rateBasis, 3333);
eq(awkward.years[0].reliefPence, 200);

var zeroWeeks = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "basic",
  today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 0 }]
});
eq(zeroWeeks.totalReliefPence, 0);
eq(zeroWeeks.years[0].working, "£6 a week for 0 weeks is £0.00. There is no relief for this year.");
eq(zeroWeeks.message.indexOf("Enter the weeks") !== -1, true);

var longYear = W.calculate({
  reason: "no-office",
  mode: "flat",
  rateId: "basic",
  today: "2026-11-16",
  years: [{ id: "2023-24", weeks: 53 }]
});
eq(longYear.years[0].weeksNote.indexOf("53 weeks") !== -1, true);
eq(longYear.years[0].reliefPence, 6360);

// People who chose, whose contract allows it, or whose office was full.
["chose", "contract", "office-full"].forEach(function (reason) {
  var fail = W.calculate({
    reason: reason,
    mode: "flat",
    rateId: "basic",
    today: "2026-11-16",
    years: [{ id: "2025-26", weeks: 52 }]
  });
  eq(fail.ok, true, reason);
  eq(fail.eligible, false, reason);
  eq(fail.totalReliefPence, 0, reason);
  eq(fail.message.indexOf("You cannot claim.") === 0, true, reason);
  eq(fail.employerNote.indexOf("£6 a week") !== -1, true, reason);
  eq(fail.employerNote.indexOf("not a cap") !== -1, true, reason);
});

var noReason = W.calculate({ mode: "flat", rateId: "basic", today: "2026-11-16", years: [{ id: "2025-26" }] });
eq(noReason.ok, false);

var noYear = W.calculate({ reason: "no-office", mode: "flat", rateId: "basic", today: "2026-11-16", years: [] });
eq(noYear.ok, false);
eq(noYear.error.indexOf("Tick the years") === 0, true);

var future = W.calculate({
  reason: "no-office", mode: "flat", rateId: "basic", today: "2026-11-16",
  years: [{ id: "2026-27", weeks: 52 }]
});
eq(future.ok, false);
eq(future.error.indexOf("2026/27") !== -1, true);

var closed = W.calculate({
  reason: "no-office", mode: "flat", rateId: "basic", today: "2027-04-06",
  years: [{ id: "2022-23", weeks: 52 }]
});
eq(closed.ok, false);
eq(closed.error, "2022/23 closed on 5 April 2027.");

var stillOpen = W.calculate({
  reason: "no-office", mode: "flat", rateId: "basic", today: "2027-04-05",
  years: [{ id: "2022-23", weeks: 52 }]
});
eq(stillOpen.ok, true);
eq(stillOpen.years[0].daysLeft, 0);
eq(stillOpen.totalReliefPence, 6240);

var badWeeks = W.calculate({
  reason: "no-office", mode: "flat", rateId: "basic", today: "2026-11-16",
  years: [{ id: "2025-26", weeks: "10.5" }]
});
eq(badWeeks.ok, false);

var tooManyWeeks = W.calculate({
  reason: "no-office", mode: "flat", rateId: "basic", today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 54 }]
});
eq(tooManyWeeks.ok, false);

var missingExact = W.calculate({
  reason: "no-office", mode: "exact", rateId: "basic", today: "2026-11-16",
  years: [{ id: "2025-26" }]
});
eq(missingExact.ok, false);

var badRate = W.calculate({
  reason: "no-office", mode: "flat", rateId: "other", otherPercent: "101",
  today: "2026-11-16", years: [{ id: "2025-26", weeks: 52 }]
});
eq(badRate.ok, false);

var missingOther = W.calculate({
  reason: "no-office", mode: "flat", rateId: "other", today: "2026-11-16",
  years: [{ id: "2025-26", weeks: 52 }]
});
eq(missingOther.ok, false);

var zeroRate = W.calculate({
  reason: "no-office", mode: "flat", rateId: "other", otherPercent: "0",
  today: "2026-11-16", years: [{ id: "2025-26", weeks: 52 }]
});
eq(zeroRate.ok, true);
eq(zeroRate.totalReliefPence, 0);
eq(zeroRate.totalClaimPence, 31200, "the costs stay claimable at a zero rate");

// The page and the engine must not use an em dash or an en dash in the copy.
var files = ["wfh.js", "wfh.test.js", "app.js", "index.html"];
files.forEach(function (name) {
  var src = fs.readFileSync(path.join(__dirname, name), "utf8");
  assert.ok(src.indexOf("\u2014") === -1, name + " has an em dash");
  assert.ok(src.indexOf("\u2013") === -1, name + " has an en dash");
});

var page = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.ok(page.indexOf("5 April 2027") !== -1);
assert.ok(page.indexOf("5 April 2028") !== -1);
assert.ok(page.indexOf("5 April 2029") !== -1);
assert.ok(page.indexOf("5 April 2030") !== -1);
assert.ok(page.indexOf("6 April 2026") !== -1);
assert.ok(page.indexOf("FAQPage") !== -1);
assert.ok(page.indexOf("WebApplication") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/tax-relief-for-employees/working-at-home") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-expenses-by-post-or-phone") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/hmrc-internal-manuals/employment-income-manual/eim32759") !== -1);
assert.ok(page.indexOf("https://www.gov.uk/hmrc-internal-manuals/employment-income-manual/eim32760") !== -1);
assert.ok(page.indexOf("https://arthurverse67.gumroad.com/l/taxreliefclaimlite?ref=ps-wfh") !== -1);
assert.ok(page.indexOf("https://arthurverse67.gumroad.com/l/taxreliefclaimpack?ref=ps-wfh") !== -1);
assert.ok(page.indexOf("../mileage-allowance-tax-relief-calculator/") !== -1);
assert.ok(page.indexOf("static.cloudflareinsights.com/beacon.min.js") !== -1);
assert.ok(page.indexOf("50becbbfccc84869ae6ea32a24a32453") !== -1);
assert.ok(page.indexOf("£2,500") !== -1);
assert.ok(page.indexOf("not tax advice") !== -1);

console.log("wfh.test.js: all assertions passed");
