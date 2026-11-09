/* HMRC late payment and repayment interest. Pure logic, no DOM.
   Browser: window.HmrcInterest. Node: require.
   Day count follows HMRC Compliance Handbook CH140220 and CH141120:
   interest runs from the start date to the end date, and the number of days
   is the gap between them. Due on 31 January and paid on 1 February is 1 day.
   Paid on the start date is none. Simple interest, not compound (CH140260).
   Each day uses the rate in force that day. I divide by 365, including in a leap year.
   The total is the sum of the daily interest, rounded to the nearest penny.
   Rates live in rates.js. */
(function (root) {
  "use strict";
  var data = (typeof module !== "undefined" && module.exports) ? require("./rates.js") : root.HmrcRates;
  var RATES = data.RATES;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAY = 86400000;

  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return NaN;
    var y = +m[1], mo = +m[2], d = +m[3], t = Date.UTC(y, mo - 1, d), dt = new Date(t);
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return NaN;
    return t / DAY;
  }
  function iso(n) { return new Date(n * DAY).toISOString().slice(0, 10); }
  function nice(n) {
    var d = new Date(n * DAY);
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function round2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }
  function pennies(pounds) { return Math.round((pounds + Number.EPSILON) * 100); }

  // Interest in pounds, unrounded. rate is a percentage, for example 7.75.
  function exact(taxPence, rate, days) {
    return taxPence * rate * days / 3650000;
  }

  function slices(startDay, endDay, mode) {
    var out = [];
    var first = parse(RATES[0].from);
    for (var i = 0; i < RATES.length; i++) {
      var from = parse(RATES[i].from);
      var until = i + 1 < RATES.length ? parse(RATES[i + 1].from) : Infinity;
      var a = Math.max(from, startDay);
      var b = Math.min(until, endDay + 1); // exclusive end
      if (b > a && a >= first) {
        out.push({
          from: a,
          to: b - 1,
          days: b - a,
          rate: mode === "repayment" ? RATES[i].repayment : RATES[i].late
        });
      }
    }
    return out;
  }

  /* input: { amount, dueDate, paidDate, mode: "late"|"repayment", today }
     dueDate is the interest start date (the day the tax was due, or the
     repayment interest start date). paidDate is the interest end date.
     Interest days are the days after dueDate up to and including paidDate. */
  function calculate(input) {
    input = input || {};
    var mode = input.mode === "repayment" ? "repayment" : (input.mode === "late" || input.mode == null || input.mode === "" ? "late" : null);
    if (!mode) return { error: "Choose late payment interest or repayment interest." };
    var raw = input.amount;
    if (raw === "" || raw == null) return { error: mode === "repayment" ? "Enter the amount HMRC owes you." : "Enter the tax that was paid late." };
    var amount = Number(String(raw).replace(/[£,\s]/g, ""));
    if (!isFinite(amount) || amount <= 0) return { error: "Enter an amount above £0." };
    if (amount > 1000000000) return { error: "Enter an amount up to £1,000,000,000." };
    var due = parse(input.dueDate);
    if (isNaN(due)) return { error: mode === "repayment" ? "Enter the repayment interest start date." : "Enter the date the tax was due." };
    var paidRaw = input.paidDate || input.today;
    var paid = parse(paidRaw);
    if (isNaN(paid)) return { error: mode === "repayment" ? "Enter the date HMRC repaid you, or today if they have not." : "Enter the date you paid, or today if it is still unpaid." };
    var earliest = parse(data.EARLIEST);
    var res = {
      mode: mode,
      amount: round2(amount),
      dueDate: iso(due),
      dueNice: nice(due),
      paidDate: iso(paid),
      paidNice: nice(paid),
      earliest: data.EARLIEST,
      earliestNice: nice(earliest)
    };
    var days = paid - due;
    if (days <= 0) {
      res.charging = false;
      res.days = 0;
      res.interest = 0;
      res.periods = [];
      return res;
    }
    if (due + 1 < earliest) {
      return { error: "I only have HMRC rates from " + nice(earliest) + ". Interest on a due date before " + nice(earliest - 1) + " needs an earlier rate, and I have not added one." };
    }
    var taxPence = pennies(amount);
    var parts = slices(due + 1, paid, mode);
    var covered = 0;
    for (var i = 0; i < parts.length; i++) covered += parts[i].days;
    if (covered !== days) {
      return { error: "Part of this period is before " + nice(earliest) + ", which is the first rate I hold." };
    }
    var exacts = [];
    var sumExact = 0;
    for (var j = 0; j < parts.length; j++) {
      var ex = exact(taxPence, parts[j].rate, parts[j].days);
      exacts.push(ex);
      sumExact += ex;
    }
    var totalPence = Math.round(sumExact * 100);
    var shown = [];
    var shownSum = 0;
    for (var k = 0; k < parts.length; k++) {
      var p = Math.round(exacts[k] * 100);
      shown.push(p);
      shownSum += p;
    }
    if (shown.length) shown[shown.length - 1] += totalPence - shownSum;
    res.charging = true;
    res.days = days;
    res.interest = totalPence / 100;
    res.periods = parts.map(function (part, idx) {
      return {
        from: iso(part.from),
        to: iso(part.to),
        fromNice: nice(part.from),
        toNice: nice(part.to),
        days: part.days,
        rate: part.rate,
        interest: shown[idx] / 100
      };
    });
    return res;
  }

  var api = {
    RATES: RATES,
    CHECKED: data.CHECKED,
    SOURCE: data.SOURCE,
    DAYS_GUIDE: data.DAYS_GUIDE,
    NEWS: data.NEWS,
    EARLIEST: data.EARLIEST,
    parse: parse,
    iso: iso,
    nice: nice,
    calculate: calculate
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HmrcInterest = api;
})(this);
