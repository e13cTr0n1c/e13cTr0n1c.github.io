/* Unit tests for the Self Assessment late penalty engine.
   Run: node penalties.test.js
   Worked dates follow HMRC manuals, not a rounded guess.
   Interest is the shared HMRC calculator, not a second rate table. */
"use strict";
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var P = require("./penalties.js");
var H = require("../hmrc-late-payment-interest-calculator/hmrc-interest.js");

function eq(actual, expected, msg) {
  assert.strictEqual(actual, expected, (msg || "") + " expected " + expected + " got " + actual);
}
function item(res, id) {
  for (var i = 0; i < res.timeline.length; i++) if (res.timeline[i].id === id) return res.timeline[i];
  throw new Error("missing timeline " + id);
}

var src = fs.readFileSync(path.join(__dirname, "penalties.js"), "utf8");
assert.ok(src.indexOf("hmrc-late-payment-interest-calculator/hmrc-interest.js") !== -1, "uses shared interest engine");
assert.ok(src.indexOf("late: 8") === -1, "does not copy the rate table");
eq(H.RATES[H.RATES.length - 1].from, "2026-11-24");
eq(H.RATES[H.RATES.length - 1].late, 8);

// On time. Online 2025 to 2026.
var onTime = P.calculate({
  taxYear: "2025-26", method: "online", amount: 5000,
  filedDate: "2027-01-31", paidDate: "2027-01-31", today: "2027-02-01"
});
eq(onTime.filing.total, 0, "on time filing");
eq(onTime.payment.total, 0, "on time payment");
eq(onTime.interest, 0, "on time interest");
eq(onTime.total, 0, "on time total");
eq(onTime.next.sentence, "Nothing in this estimate is late.");
eq(item(onTime, "filing-initial").status, "avoided");
eq(item(onTime, "pay-30").status, "avoided");

// £100 only. Filed the day after the deadline, tax paid on time.
var hundred = P.calculate({
  taxYear: "2025-26", method: "online", amount: 2000,
  filedDate: "2027-02-01", paidDate: "2027-01-31", today: "2027-02-15"
});
eq(hundred.filing.initial, 100);
eq(hundred.filing.dailyDays, 0);
eq(hundred.filing.six, 0);
eq(hundred.filing.twelve, 0);
eq(hundred.filing.total, 100);
eq(hundred.payment.total, 0);
eq(hundred.interest, 0);
eq(hundred.total, 100);
eq(hundred.filing.dates.penalty, "2027-02-01");
eq(hundred.filing.dates.dailyStart, "2027-05-01");
eq(hundred.filing.dates.six, "2027-08-01");
eq(hundred.filing.dates.twelve, "2028-02-01");

// Day before daily penalties start. Still only £100.
var beforeDaily = P.calculate({
  taxYear: "2025-26", method: "online", amount: 2000,
  filedDate: "2027-04-30", paidDate: "2027-01-31", today: "2027-04-30"
});
eq(beforeDaily.filing.initial, 100);
eq(beforeDaily.filing.dailyDays, 0);
eq(beforeDaily.filing.total, 100);

// First day of daily penalties: 1 May is one day, £10. SAM61230 counts the filing day.
var firstDaily = P.calculate({
  taxYear: "2025-26", method: "online", amount: 2000,
  filedDate: "2027-05-01", paidDate: "2027-01-31", today: "2027-05-01"
});
eq(firstDaily.filing.dailyDays, 1);
eq(firstDaily.filing.daily, 10);
eq(firstDaily.filing.total, 110);

// SAM61230 example 1, moved to 2025 to 2026: filed 16 June, 31 days in May plus 16 days in June.
var samDaily = P.calculate({
  taxYear: "2025-26", method: "online", amount: 4000,
  filedDate: "2027-06-16", paidDate: "2027-01-31", today: "2027-06-16"
});
eq(samDaily.filing.dailyDays, 47, "May 31 plus June 16");
eq(samDaily.filing.daily, 470);
eq(samDaily.filing.six, 0, "6 month penalty is 1 August");
eq(samDaily.filing.total, 570);

// 90 day cap ends 29 July. 30 July is still £900 and still before the 6 month penalty.
var cap = P.calculate({
  taxYear: "2025-26", method: "online", amount: 1000, liability: 10000,
  filedDate: "2027-07-29", paidDate: "2027-01-31", today: "2027-07-29"
});
eq(cap.filing.dates.dailyEnd, "2027-07-29");
eq(cap.filing.dailyDays, 90);
eq(cap.filing.daily, 900);
eq(cap.filing.six, 0);
eq(cap.filing.total, 1000);

var capNext = P.calculate({
  taxYear: "2025-26", method: "online", amount: 1000, liability: 10000,
  filedDate: "2027-07-30", paidDate: "2027-01-31", today: "2027-07-30"
});
eq(capNext.filing.dailyDays, 90);
eq(capNext.filing.six, 0);
eq(capNext.filing.total, 1000);

// 6 month penalty on 1 August. 5% of £10,000 is £500. 5% of £1,000 is below £300.
var sixHigh = P.calculate({
  taxYear: "2025-26", method: "online", amount: 1000, liability: 10000,
  filedDate: "2027-08-01", paidDate: "2027-01-31", today: "2027-08-01"
});
eq(sixHigh.filing.six, 500);
eq(sixHigh.filing.twelve, 0);
eq(sixHigh.filing.total, 1500);
eq(item(sixHigh, "filing-six").status, "charged");

var sixLow = P.calculate({
  taxYear: "2025-26", method: "online", amount: 1000, liability: 1000,
  filedDate: "2027-08-01", paidDate: "2027-01-31", today: "2027-08-01"
});
eq(sixLow.filing.six, 300, "minimum £300");
eq(sixLow.filing.total, 1300);

var dayBeforeSix = P.calculate({
  taxYear: "2025-26", method: "online", amount: 1000, liability: 10000,
  filedDate: "2027-07-31", paidDate: "2027-01-31", today: "2027-07-31"
});
eq(dayBeforeSix.filing.six, 0);
eq(dayBeforeSix.filing.daily, 900);
eq(dayBeforeSix.filing.total, 1000);

// 12 month penalty on 1 February the following year. Filing on 31 January avoids it.
var beforeTwelve = P.calculate({
  taxYear: "2025-26", method: "online", amount: 0, liability: 10000,
  filedDate: "2028-01-31", paidDate: "2027-01-31", today: "2028-01-31"
});
eq(beforeTwelve.filing.six, 500);
eq(beforeTwelve.filing.twelve, 0);
eq(beforeTwelve.filing.total, 1500);

var twelve = P.calculate({
  taxYear: "2025-26", method: "online", amount: 0, liability: 10000,
  filedDate: "2028-02-01", paidDate: "2027-01-31", today: "2028-02-01"
});
eq(twelve.filing.initial, 100);
eq(twelve.filing.daily, 900);
eq(twelve.filing.six, 500);
eq(twelve.filing.twelve, 500);
eq(twelve.filing.total, 2000);
eq(twelve.payment.total, 0, "no tax due, so no late payment penalty");
eq(twelve.interest, 0);

// Nil liability still has the £300 minimum at 6 and 12 months. £100 plus £900 plus £300 plus £300.
var nil = P.calculate({
  taxYear: "2025-26", method: "online", amount: 0, liability: 0,
  filedDate: "2028-02-01", paidDate: "2027-01-31", today: "2028-02-01"
});
eq(nil.filing.six, 300);
eq(nil.filing.twelve, 300);
eq(nil.filing.total, 1600);
eq(nil.total, 1600);

// Paper return, leap year daily count. SAM61230: 1 February to 18 April 2012 was 78 days.
// 2022 to 2023 paper deadline is 31 October 2023, so daily penalties start 1 February 2024.
var paper = P.calculate({
  taxYear: "2022-23", method: "paper", amount: 1000,
  filedDate: "2024-04-18", paidDate: "2024-01-31", today: "2024-04-18"
});
eq(paper.deadlines.filing, "2023-10-31");
eq(paper.filing.dates.penalty, "2023-11-01");
eq(paper.filing.dates.dailyStart, "2024-02-01");
eq(paper.filing.dates.six, "2024-05-01");
eq(paper.filing.dates.dailyEnd, "2024-04-30", "leap February makes day 90 fall on 30 April");
eq(paper.filing.dailyDays, 78);
eq(paper.filing.daily, 780);
eq(paper.filing.six, 0);
eq(paper.filing.total, 880);

// Same filing date online would have been on time. The method chooses the deadline.
var asOnline = P.calculate({
  taxYear: "2025-26", method: "online", amount: 500,
  filedDate: "2026-11-15", paidDate: "2027-01-31", today: "2026-11-15"
});
eq(asOnline.filing.total, 0, "15 November is before the online deadline");
var asPaper = P.calculate({
  taxYear: "2025-26", method: "paper", amount: 500,
  filedDate: "2026-11-15", paidDate: "2027-01-31", today: "2026-11-15"
});
eq(asPaper.filing.initial, 100);
eq(asPaper.filing.dailyDays, 0, "paper daily penalties start 1 February");
eq(asPaper.filing.total, 100);

// SALF308A dates on a non leap February. £3,750 unpaid at midnight on 2 March 2027.
var salf = P.calculate({
  taxYear: "2025-26", method: "online", amount: 3750,
  filedDate: "2027-01-31", paidDate: "2027-03-03", today: "2027-03-03"
});
eq(salf.payment.dates.first, "2027-03-02");
eq(salf.payment.dates.firstCharge, "2027-03-03");
eq(salf.payment.dates.second, "2027-08-02");
eq(salf.payment.dates.third, "2028-02-02");
eq(salf.payment.first, 187.5);
eq(salf.payment.second, 0);
eq(salf.payment.third, 0);
eq(salf.filing.total, 0);
eq(salf.interestDays, 31, "1 February to 3 March 2027");
eq(salf.interest, 25.48, "31 days at 8%");
eq(salf.interestPeriods.length, 1);
eq(salf.interestPeriods[0].rate, 8);
eq(salf.total, 212.98);

// Paying on the trigger date avoids the penalty. Interest still runs up to that day.
var payOnTrigger = P.calculate({
  taxYear: "2025-26", method: "online", amount: 3750,
  filedDate: "2027-01-31", paidDate: "2027-03-02", today: "2027-03-02"
});
eq(payOnTrigger.payment.first, 0);
eq(payOnTrigger.interestDays, 30);
eq(payOnTrigger.interest, 24.66);

// Not yet the end of the trigger day: the penalty is not in the total.
var triggerDay = P.calculate({
  taxYear: "2025-26", method: "online", amount: 3750,
  filedDate: "2027-01-31", paidDate: "", today: "2027-03-02"
});
eq(triggerDay.payment.first, 0);
eq(triggerDay.next.payBy, "2027-03-02");
eq(triggerDay.next.sentence, "Pay by 2 March 2027 to avoid the 30 day late payment penalty of £187.50. Interest is already running.");

var dayAfterTrigger = P.calculate({
  taxYear: "2025-26", method: "online", amount: 3750,
  filedDate: "2027-01-31", paidDate: "", today: "2027-03-03"
});
eq(dayAfterTrigger.payment.first, 187.5);
eq(dayAfterTrigger.next.payBy, "2027-08-02");

// Second penalty: unpaid at the end of 2 August. Paying that day avoids it.
var beforeSecond = P.calculate({
  taxYear: "2025-26", method: "online", amount: 3750,
  filedDate: "2027-01-31", paidDate: "2027-08-02", today: "2027-08-02"
});
eq(beforeSecond.payment.first, 187.5);
eq(beforeSecond.payment.second, 0);
eq(beforeSecond.payment.total, 187.5);

var second = P.calculate({
  taxYear: "2025-26", method: "online", amount: 3750,
  filedDate: "2027-01-31", paidDate: "2027-08-03", today: "2027-08-03"
});
eq(second.payment.first, 187.5);
eq(second.payment.second, 187.5);
eq(second.payment.third, 0);
eq(second.payment.total, 375);

// Third penalty. End of 2 February 2028 avoids it. 3 February incurs it. 15% in all.
var beforeThird = P.calculate({
  taxYear: "2025-26", method: "online", amount: 3750,
  filedDate: "2027-01-31", paidDate: "2028-02-02", today: "2028-02-02"
});
eq(beforeThird.payment.third, 0);
eq(beforeThird.payment.total, 375);

var third = P.calculate({
  taxYear: "2025-26", method: "online", amount: 3750,
  filedDate: "2027-01-31", paidDate: "2028-02-03", today: "2028-02-03"
});
eq(third.payment.first, 187.5);
eq(third.payment.second, 187.5);
eq(third.payment.third, 187.5);
eq(third.payment.total, 562.5);

// Leap year payment triggers. Due 31 January 2024. SAM61390 pattern: 1 March, 1 August, 1 February.
var leapPay = P.calculate({
  taxYear: "2022-23", method: "online", amount: 5000,
  filedDate: "2024-01-31", paidDate: "2024-03-01", today: "2024-03-01"
});
eq(leapPay.payment.dates.first, "2024-03-01");
eq(leapPay.payment.dates.second, "2024-08-01");
eq(leapPay.payment.dates.third, "2025-02-01");
eq(leapPay.payment.first, 0, "paid on the leap year trigger");

var leapLate = P.calculate({
  taxYear: "2022-23", method: "online", amount: 5000,
  filedDate: "2024-01-31", paidDate: "2024-03-02", today: "2024-03-02"
});
eq(leapLate.payment.first, 250);

// 31 January 2028 is also a leap year trigger.
var leap2028 = P.calculate({
  taxYear: "2026-27", method: "online", amount: 100,
  filedDate: "2028-01-31", paidDate: "", today: "2028-01-31"
});
eq(leap2028.payment.dates.first, "2028-03-01");
eq(leap2028.payment.dates.second, "2028-08-01");
eq(leap2028.payment.dates.third, "2029-02-01");

// Page worked example: filed 16 June 2027, paid 3 March 2027, tax £3,750.
var worked = P.calculate({
  taxYear: "2025-26", method: "online", amount: 3750,
  filedDate: "2027-06-16", paidDate: "2027-03-03", today: "2027-06-16"
});
eq(worked.filing.initial, 100);
eq(worked.filing.daily, 470);
eq(worked.filing.six, 0);
eq(worked.payment.first, 187.5);
eq(worked.interest, 25.48);
eq(worked.total, 782.98);
eq(worked.next.sentence, "Every penalty in this estimate has already arisen.");

// Not yet filed or paid on 15 May 2027. Daily penalties are accruing. 30 day payment penalty has landed.
var open = P.calculate({
  taxYear: "2025-26", method: "online", amount: 2000,
  filedDate: "", paidDate: "", today: "2027-05-15"
});
eq(open.filing.initial, 100);
eq(open.filing.dailyDays, 15);
eq(open.filing.daily, 150);
eq(open.filing.total, 250);
eq(open.payment.first, 100);
eq(open.payment.second, 0);
eq(open.interestDays, 104);
eq(open.interest, 45.59);
eq(open.total, 395.59);
eq(item(open, "filing-daily").status, "accruing");
eq(open.next.fileBy, "2027-05-15");
eq(open.next.payBy, "2027-08-02");
assert.ok(open.next.sentence.indexOf("File by the end of today (15 May 2027)") === 0, open.next.sentence);
assert.ok(open.next.sentence.indexOf("File by 31 July 2027 to avoid the 6 month filing penalty of £300.00.") !== -1, open.next.sentence);
assert.ok(open.next.sentence.indexOf("Pay by 2 August 2027 to avoid the next late payment penalty of £100.00.") !== -1, open.next.sentence);

// Before either deadline: the next penalty is the £100, avoided by filing on 31 January.
var early = P.calculate({
  taxYear: "2025-26", method: "online", amount: 1000,
  filedDate: "", paidDate: "", today: "2026-11-10"
});
eq(early.filing.total, 0);
eq(early.payment.total, 0);
eq(early.interest, 0);
eq(early.total, 0);
eq(early.next.sentence, "File by 31 January 2027 to avoid the £100 late filing penalty. Pay by 2 March 2027 to avoid the 30 day late payment penalty of £50.00.");
eq(early.paperCanStillFileOnline, false);

// Paper, not filed, online deadline still open. The £100 has already arisen on the paper deadline.
var paperOpen = P.calculate({
  taxYear: "2025-26", method: "paper", amount: 1000,
  filedDate: "", paidDate: "", today: "2026-11-10"
});
eq(paperOpen.filing.initial, 100);
eq(paperOpen.paperCanStillFileOnline, true);
eq(paperOpen.filing.dates.dailyStart, "2027-02-01");
eq(paperOpen.next.fileBy, "2027-01-31");

// Liability for the filing percentage can be higher than the January bill.
var split = P.calculate({
  taxYear: "2025-26", method: "online", amount: 1000, liability: 20000,
  filedDate: "2027-08-01", paidDate: "2027-01-31", today: "2027-08-01"
});
eq(split.liabilityAssumed, false);
eq(split.filing.six, 1000, "5% of the net liability, not of the January bill");
eq(split.payment.total, 0);
eq(split.filing.total, 2000);

var assumed = P.calculate({
  taxYear: "2025-26", method: "online", amount: 1000,
  filedDate: "2027-08-01", paidDate: "2027-01-31", today: "2027-08-01"
});
eq(assumed.liabilityAssumed, true);
eq(assumed.filing.six, 300, "5% of £1,000 is below the £300 minimum");

// Interest across the 24 November 2026 rate change matches the shared calculator.
var across = P.calculate({
  taxYear: "2024-25", method: "online", amount: 5000,
  filedDate: "2026-01-31", paidDate: "2026-12-31", today: "2026-12-31"
});
var shared = H.calculate({ amount: 5000, dueDate: "2026-01-31", paidDate: "2026-12-31", mode: "late" });
eq(across.interest, shared.interest);
eq(across.interest, 355.89);
eq(across.interestPeriods.length, shared.periods.length);
eq(across.interestPeriods[1].from, "2026-11-24");
eq(across.interestPeriods[1].rate, 8);
eq(across.payment.first, 250);
eq(across.payment.second, 250);
eq(across.payment.third, 0);
eq(across.filing.total, 0);
eq(across.total, 855.89);

// Awkward pence. 5% of £10.10 is £0.505, rounded to the nearest penny.
eq(P.percent5(10.1), 0.51);
eq(P.percent5(3750), 187.5);

// Making Tax Digital for this tax year: do not present the old penalties as the bill.
var mtd = P.calculate({
  taxYear: "2025-26", method: "online", amount: 3750, mtd: true,
  filedDate: "", paidDate: "", today: "2027-06-01"
});
eq(mtd.penaltiesApply, false);
eq(mtd.regime, "mtd");
eq(mtd.filing, null);
eq(mtd.timeline.length, 0);
assert.ok(mtd.interest > 0, "interest still runs under Making Tax Digital");
eq(mtd.total, mtd.interest);
assert.ok(mtd.next.sentence.indexOf("Making Tax Digital") !== -1);

// Errors.
assert.ok(P.calculate({ taxYear: "2010-11", method: "online", amount: 1, today: "2027-01-01" }).error);
assert.ok(P.calculate({ taxYear: "2025-26", method: "online", amount: "", today: "2027-01-01" }).error);
assert.ok(P.calculate({ taxYear: "2025-26", method: "online", amount: -5, today: "2027-01-01" }).error);
assert.ok(P.calculate({ taxYear: "2025-26", method: "online", amount: 10, filedDate: "2026-04-05", today: "2026-11-10" }).error);
assert.ok(P.calculate({ taxYear: "2025-26", method: "fax", amount: 10, today: "2026-11-10" }).error);

console.log("penalties.test.js: all assertions passed");
