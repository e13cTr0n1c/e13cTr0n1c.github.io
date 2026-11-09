/* Unit tests for the HMRC interest engine. Run: node hmrc-interest.test.js */
"use strict";
var assert = require("assert");
var H = require("./hmrc-interest.js");

function approx(actual, expected, msg) {
  assert.strictEqual(actual, expected, (msg || "") + " expected " + expected + " got " + actual);
}

var one = H.calculate({ amount: 1000, dueDate: "2026-01-09", paidDate: "2026-01-10", mode: "late" });
approx(one.days, 1, "one day");
approx(one.periods.length, 1, "one period");
approx(one.periods[0].rate, 7.75, "7.75 rate");
approx(one.periods[0].from, "2026-01-10");
approx(one.periods[0].to, "2026-01-10");
approx(one.interest, 0.21, "one day interest");

var same = H.calculate({ amount: 5000, dueDate: "2026-01-31", paidDate: "2026-01-31" });
assert.strictEqual(same.charging, false);
approx(same.interest, 0);
approx(same.days, 0);

var early = H.calculate({ amount: 100, dueDate: "2000-01-01", paidDate: "2000-03-01" });
assert.ok(early.error, "before the table");

var leap = H.calculate({ amount: 1000, dueDate: "2024-01-31", paidDate: "2024-03-01", mode: "late" });
approx(leap.days, 30, "leap year day count");
approx(leap.periods.length, 1);
approx(leap.periods[0].rate, 7.75);
approx(leap.interest, 6.37, "leap year interest");

// 31 Jan 2025 to 31 Jan 2026 crosses six published rate changes.
var span = H.calculate({ amount: 1000, dueDate: "2025-01-31", paidDate: "2026-01-31", mode: "late" });
approx(span.days, 365, "full year days");
approx(span.periods.length, 6, "six rate periods");
var expectDays = [24, 40, 52, 91, 135, 23];
var expectRates = [7.25, 7, 8.5, 8.25, 8, 7.75];
var expectFrom = ["2025-02-01", "2025-02-25", "2025-04-06", "2025-05-28", "2025-08-27", "2026-01-09"];
var daySum = 0;
var moneySum = 0;
for (var i = 0; i < span.periods.length; i++) {
  approx(span.periods[i].days, expectDays[i], "period " + i + " days");
  approx(span.periods[i].rate, expectRates[i], "period " + i + " rate");
  approx(span.periods[i].from, expectFrom[i], "period " + i + " from");
  daySum += span.periods[i].days;
  moneySum += Math.round(span.periods[i].interest * 100);
}
approx(daySum, 365, "period days add up");
approx(moneySum, Math.round(span.interest * 100), "period pennies add up");
approx(span.interest, 79.59, "span total");

var repay = H.calculate({ amount: 1000, dueDate: "2025-01-31", paidDate: "2026-01-31", mode: "repayment" });
approx(repay.periods.length, 6);
var repayRates = [3.75, 3.5, 3.5, 3.25, 3, 2.75];
for (var r = 0; r < repay.periods.length; r++) approx(repay.periods[r].rate, repayRates[r], "repay rate " + r);
approx(repay.periods[0].days, 24);
approx(repay.interest, 32.22, "repayment total");

// Published rate from 24 November 2026, not a guessed date.
var boundary = H.calculate({ amount: 1000, dueDate: "2026-11-23", paidDate: "2026-11-25", mode: "late" });
approx(boundary.days, 2);
approx(boundary.periods.length, 1);
approx(boundary.periods[0].from, "2026-11-24");
approx(boundary.periods[0].rate, 8);
approx(boundary.interest, 0.44);

var beforeRise = H.calculate({ amount: 1000, dueDate: "2026-11-22", paidDate: "2026-11-23", mode: "late" });
approx(beforeRise.periods[0].rate, 7.75);
approx(beforeRise.interest, 0.21);

var across = H.calculate({ amount: 5000, dueDate: "2026-01-31", paidDate: "2026-12-31", mode: "late" });
approx(across.periods.length, 2);
approx(across.periods[0].days, 296);
approx(across.periods[0].rate, 7.75);
approx(across.periods[1].days, 38);
approx(across.periods[1].rate, 8);
approx(across.periods[1].from, "2026-11-24");
approx(across.days, 334);
approx(across.interest, 355.89, "across November 2026");

var repayNov = H.calculate({ amount: 1000, dueDate: "2026-11-01", paidDate: "2026-12-01", mode: "repayment" });
approx(repayNov.periods[0].rate, 2.75);
approx(repayNov.periods[1].rate, 3);
approx(repayNov.periods[0].days, 22);
approx(repayNov.periods[1].days, 8);
approx(repayNov.interest, 2.32);

assert.ok(H.calculate({ amount: "", dueDate: "2026-01-31", paidDate: "2026-02-01" }).error);
assert.ok(H.calculate({ amount: 10, dueDate: "not-a-date", paidDate: "2026-02-01" }).error);
assert.strictEqual(H.RATES[H.RATES.length - 1].from, "2026-11-24");
assert.strictEqual(H.RATES[H.RATES.length - 1].late, 8);
assert.strictEqual(H.RATES[H.RATES.length - 1].repayment, 3);

console.log("hmrc-interest.test.js: " + 1 + " file, all assertions passed");
