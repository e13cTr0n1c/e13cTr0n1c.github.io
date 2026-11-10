/* Self Assessment late filing penalties, late payment penalties and interest.
   Pure logic, no DOM. Browser: window.SaPenalties. Node: require.
   Checked 10 November 2026.

   Filing penalties: Finance Act 2009 Schedule 55, as HMRC applies it to
   income tax self assessment.
   https://www.gov.uk/self-assessment-tax-returns/penalties
   https://www.gov.uk/hmrc-internal-manuals/compliance-handbook/ch62080
   https://www.gov.uk/hmrc-internal-manuals/compliance-handbook/ch62100
   https://www.gov.uk/hmrc-internal-manuals/compliance-handbook/ch62120
   https://www.gov.uk/hmrc-internal-manuals/compliance-handbook/ch62140
   https://www.gov.uk/hmrc-internal-manuals/compliance-handbook/ch62240
   https://www.gov.uk/hmrc-internal-manuals/self-assessment-manual/sam61230

   The penalty date is the day after the filing date (CH62100).
   £100 arises on the penalty date.
   Daily penalties of £10 start 3 months after the penalty date and run for
   up to 90 days, including the day the return is received (CH62140 example,
   CH63520, SAM61230 example 1).
   The 6 month penalty arises 6 months after the penalty date (CH62140).
   The 12 month penalty arises 12 months after the penalty date.
   The 6 and 12 month amounts here are the greater of 5% of the net tax
   liability and £300. That is the "not deliberate" 12 month case (CH62240).
   A deliberate withholding can be 70% or 100%, or more with an offshore
   matter. This estimate does not calculate that.

   Late payment penalties: Finance Act 2009 Schedule 56.
   https://www.gov.uk/hmrc-internal-manuals/self-assessment-legal-framework/salf308a
   https://www.gov.uk/hmrc-internal-manuals/self-assessment-manual/sam61250
   https://www.gov.uk/hmrc-internal-manuals/self-assessment-manual/sam61390
   Each penalty is 5% of the tax unpaid at the end of the trigger date.
   The trigger is 30 days after the due date, then 5 months and 11 months
   after that first trigger. SALF308A: a 31 January 2013 bill is still
   penalised if unpaid at midnight on 2 March 2013, on 2 August 2013 and on
   2 February 2014. SAM61390: in a leap year those dates are one day earlier
   (1 March, 1 August, 1 February for a 31 January 2012 bill).

   Interest uses tools/hmrc-late-payment-interest-calculator, which reads
   rates.js. Day count follows CH140220: the gap between the due date and
   the payment date. Due on 31 January and paid on 1 February is 1 day.
*/
(function (root) {
  "use strict";
  var H = (typeof module !== "undefined" && module.exports)
    ? require("../hmrc-late-payment-interest-calculator/hmrc-interest.js")
    : root.HmrcInterest;

  var YEARS = [
    { id: "2022-23", label: "2022 to 2023", paper: "2023-10-31", online: "2024-01-31", pay: "2024-01-31", opens: "2023-04-06" },
    { id: "2023-24", label: "2023 to 2024", paper: "2024-10-31", online: "2025-01-31", pay: "2025-01-31", opens: "2024-04-06" },
    { id: "2024-25", label: "2024 to 2025", paper: "2025-10-31", online: "2026-01-31", pay: "2026-01-31", opens: "2025-04-06" },
    { id: "2025-26", label: "2025 to 2026", paper: "2026-10-31", online: "2027-01-31", pay: "2027-01-31", opens: "2026-04-06" },
    { id: "2026-27", label: "2026 to 2027", paper: "2027-10-31", online: "2028-01-31", pay: "2028-01-31", opens: "2027-04-06" }
  ];

  var CHECKED = "2026-11-10";
  var MIN_GEARED_PENCE = 30000;

  function yearById(id) {
    for (var i = 0; i < YEARS.length; i++) if (YEARS[i].id === id) return YEARS[i];
    return null;
  }
  function addMonths(dayNum, months) {
    var d = new Date(dayNum * 86400000);
    var total = d.getUTCMonth() + months;
    var ty = d.getUTCFullYear() + Math.floor(total / 12);
    var tm = ((total % 12) + 12) % 12;
    var day = d.getUTCDate();
    var last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
    return Date.UTC(ty, tm, Math.min(day, last)) / 86400000;
  }
  function toPence(pounds) { return Math.round((pounds + Number.EPSILON) * 100); }
  function fromPence(pence) { return pence / 100; }
  function percent5(pounds) { return Math.round(toPence(pounds) * 5 / 100) / 100; }
  function gearedPence(pounds) {
    var p = Math.round(toPence(pounds) * 5 / 100);
    return p > MIN_GEARED_PENCE ? p : MIN_GEARED_PENCE;
  }
  function money(n) {
    return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function parseMoney(raw, what) {
    if (raw === "" || raw == null) return { empty: true };
    var n = Number(String(raw).replace(/[£,\s]/g, ""));
    if (!isFinite(n) || n < 0) return { error: "Enter the " + what + " as a number, or 0 if nothing is due." };
    if (n > 1000000000) return { error: "Enter an amount up to £1,000,000,000." };
    return { value: fromPence(toPence(n)) };
  }
  function parseDay(raw, missing) {
    if (raw === "" || raw == null) return { empty: true };
    var n = H.parse(raw);
    if (isNaN(n)) return { error: missing };
    return { value: n };
  }

  function event(id, day, endDay, title, detail, amount, status) {
    return {
      id: id,
      date: H.iso(day),
      dateNice: H.nice(day),
      endDate: endDay == null ? null : H.iso(endDay),
      endNice: endDay == null ? null : H.nice(endDay),
      title: title,
      detail: detail,
      amount: amount,
      status: status
    };
  }

  function calculate(input) {
    input = input || {};
    var year = yearById(input.taxYear || "2025-26");
    if (!year) return { error: "Choose a tax year from the list." };
    var method = input.method === "paper" ? "paper" : (input.method === "online" || input.method == null || input.method === "" ? "online" : null);
    if (!method) return { error: "Choose online or paper." };

    var tax = parseMoney(input.amount, "tax due on 31 January");
    if (tax.error) return { error: tax.error };
    if (tax.empty) return { error: "Enter the tax due on 31 January. Use 0 if nothing is due." };

    var liabilityAssumed = false;
    var liability;
    if (input.liability === "" || input.liability == null) {
      liability = tax.value;
      liabilityAssumed = true;
    } else {
      var liab = parseMoney(input.liability, "net tax on the return");
      if (liab.error) return { error: liab.error };
      if (liab.empty) {
        liability = tax.value;
        liabilityAssumed = true;
      } else liability = liab.value;
    }

    var today = parseDay(input.today, "Enter today's date.");
    if (today.error) return { error: today.error };
    if (today.empty) return { error: "Enter today's date." };

    var filed = parseDay(input.filedDate, "Enter the date you filed, or leave it blank if you have not filed yet.");
    if (filed.error) return { error: filed.error };
    var paid = parseDay(input.paidDate, "Enter the date you paid, or leave it blank if you have not paid yet.");
    if (paid.error) return { error: paid.error };

    var opens = H.parse(year.opens);
    if (!filed.empty && filed.value < opens) {
      return { error: "A " + year.label + " return can be filed from " + H.nice(opens) + "." };
    }

    var filingDeadline = H.parse(method === "paper" ? year.paper : year.online);
    var onlineDeadline = H.parse(year.online);
    var payDue = H.parse(year.pay);
    var penaltyDate = filingDeadline + 1;
    var dailyStart = addMonths(penaltyDate, 3);
    var sixMonth = addMonths(penaltyDate, 6);
    var twelveMonth = addMonths(penaltyDate, 12);
    var dailyEnd = dailyStart + 89;
    var pay30 = payDue + 30;
    var pay6 = addMonths(pay30, 5);
    var pay12 = addMonths(pay30, 11);

    var mtd = input.mtd === true || input.mtd === "yes" || input.mtd === "true";
    var interestEnd = paid.empty ? today.value : paid.value;
    var interest = { interest: 0, days: 0, periods: [], charging: false };
    if (tax.value > 0 && interestEnd > payDue) {
      interest = H.calculate({
        amount: tax.value,
        dueDate: H.iso(payDue),
        paidDate: H.iso(interestEnd),
        mode: "late"
      });
      if (interest.error) return { error: interest.error };
    }

    var base = {
      taxYear: year.id,
      yearLabel: year.label,
      method: method,
      amount: tax.value,
      liability: liability,
      liabilityAssumed: liabilityAssumed,
      mtd: mtd,
      today: H.iso(today.value),
      filedDate: filed.empty ? null : H.iso(filed.value),
      paidDate: paid.empty ? null : H.iso(paid.value),
      deadlines: {
        filing: H.iso(filingDeadline),
        filingNice: H.nice(filingDeadline),
        online: H.iso(onlineDeadline),
        onlineNice: H.nice(onlineDeadline),
        payment: H.iso(payDue),
        paymentNice: H.nice(payDue)
      },
      interest: interest.interest || 0,
      interestDays: interest.days || 0,
      interestPeriods: interest.periods || [],
      interestFrom: interest.charging ? interest.periods[0].from : null,
      interestTo: interest.charging ? interest.periods[interest.periods.length - 1].to : null,
      paperCanStillFileOnline: method === "paper" && filed.empty && today.value <= onlineDeadline,
      deliberateAssumed: true,
      checked: CHECKED
    };

    if (mtd) {
      base.penaltiesApply = false;
      base.regime = "mtd";
      base.filing = null;
      base.payment = null;
      base.timeline = [];
      base.total = base.interest;
      base.totalIncludesPenalties = false;
      base.next = {
        by: null,
        payBy: null,
        fileBy: null,
        sentence: "The current late filing and late payment penalties do not apply if you are already in Making Tax Digital for Income Tax for this tax year. I have not estimated the points regime. Late payment interest still works in the same way, and it is included above."
      };
      return base;
    }

    var filedDay = filed.empty ? null : filed.value;
    var paidDay = paid.empty ? null : paid.value;

    function filingHit(trigger) {
      if (filedDay != null) return filedDay >= trigger;
      return today.value >= trigger;
    }
    function filingState(trigger) {
      if (filedDay != null && filedDay < trigger) return "avoided";
      if (filingHit(trigger)) return "charged";
      return "upcoming";
    }
    function unpaidAt(trigger) {
      if (paidDay != null) return paidDay > trigger ? tax.value : 0;
      return today.value > trigger ? tax.value : 0;
    }
    function payState(trigger) {
      if (unpaidAt(trigger) > 0) return "charged";
      if (paidDay != null && paidDay <= trigger) return "avoided";
      return "upcoming";
    }

    var initialHit = filingHit(penaltyDate);
    var initialPence = initialHit ? 10000 : 0;

    var dailyDays = 0;
    if (filedDay != null) {
      if (filedDay >= dailyStart) dailyDays = Math.min(90, filedDay - dailyStart + 1);
    } else if (today.value >= dailyStart) {
      dailyDays = Math.min(90, today.value - dailyStart + 1);
    }
    var dailyPence = dailyDays * 1000;
    var dailyState = "upcoming";
    if (filedDay != null && filedDay < dailyStart) dailyState = "avoided";
    else if (filedDay == null && today.value < dailyStart) dailyState = "upcoming";
    else if (filedDay == null && today.value >= dailyStart && today.value <= dailyEnd && dailyDays < 90) dailyState = "accruing";
    else if (dailyDays > 0) dailyState = "charged";
    else dailyState = "avoided";

    var sixState = filingState(sixMonth);
    var twelveState = filingState(twelveMonth);
    var sixPence = sixState === "charged" ? gearedPence(liability) : 0;
    var twelvePence = twelveState === "charged" ? gearedPence(liability) : 0;
    var filingPence = initialPence + dailyPence + sixPence + twelvePence;

    var firstUnpaid = unpaidAt(pay30);
    var secondUnpaid = unpaidAt(pay6);
    var thirdUnpaid = unpaidAt(pay12);
    var firstPence = toPence(percent5(firstUnpaid));
    var secondPence = toPence(percent5(secondUnpaid));
    var thirdPence = toPence(percent5(thirdUnpaid));
    var paymentPence = firstPence + secondPence + thirdPence;

    var potentialGeared = fromPence(gearedPence(liability));
    var potentialPay = percent5(tax.value);

    var timeline = [
      event(
        "filing-deadline",
        filingDeadline,
        null,
        method === "paper" ? "Paper filing deadline" : "Online filing deadline",
        method === "paper"
          ? "HMRC must receive a paper return by the end of this day. Filing online by " + H.nice(onlineDeadline) + " uses the later deadline instead."
          : "HMRC must receive the online return by the end of this day.",
        null,
        filedDay == null
          ? (today.value > filingDeadline ? "missed" : "upcoming")
          : (filedDay > filingDeadline ? "missed" : "met")
      ),
      event(
        "filing-initial",
        penaltyDate,
        null,
        "£100 late filing penalty",
        "Charged on the day after the filing deadline, even if no tax is due and even if the tax was paid on time.",
        100,
        filingState(penaltyDate)
      ),
      event(
        "filing-daily",
        dailyStart,
        dailyEnd,
        "Daily late filing penalties",
        "£10 a day for up to 90 days, including the day the return is received. The total of the daily penalties is one penalty, capped at £900.",
        dailyState === "avoided" || dailyState === "upcoming" ? 0 : fromPence(dailyPence),
        dailyState
      ),
      event(
        "filing-six",
        sixMonth,
        null,
        "6 month late filing penalty",
        "The greater of 5% of the net tax on the return and £300. This one does not depend on whether the delay was deliberate.",
        sixState === "charged" ? fromPence(sixPence) : potentialGeared,
        sixState
      ),
      event(
        "filing-twelve",
        twelveMonth,
        null,
        "12 month late filing penalty",
        "The greater of 5% of the net tax on the return and £300, if you did not deliberately withhold information. Deliberate cases can be much higher. I do not estimate those.",
        twelveState === "charged" ? fromPence(twelvePence) : potentialGeared,
        twelveState
      ),
      event(
        "pay-due",
        payDue,
        null,
        "Tax due",
        "Balancing payment, including any payment on account for this year that is still unpaid. A 31 July payment on account is a different date and is not in this figure.",
        tax.value,
        paidDay == null
          ? (today.value > payDue ? "missed" : "upcoming")
          : (paidDay > payDue ? "missed" : "met")
      ),
      event(
        "pay-30",
        pay30,
        null,
        "30 day late payment penalty",
        "5% of the tax still unpaid at the end of this day. HMRC can first charge it on " + H.nice(pay30 + 1) + ".",
        payState(pay30) === "charged" ? fromPence(firstPence) : potentialPay,
        payState(pay30)
      ),
      event(
        "pay-6",
        pay6,
        null,
        "6 month late payment penalty",
        "Another 5% of the tax still unpaid at the end of this day. HMRC can first charge it on " + H.nice(pay6 + 1) + ".",
        payState(pay6) === "charged" ? fromPence(secondPence) : potentialPay,
        payState(pay6)
      ),
      event(
        "pay-12",
        pay12,
        null,
        "12 month late payment penalty",
        "Another 5% of the tax still unpaid at the end of this day. HMRC can first charge it on " + H.nice(pay12 + 1) + ".",
        payState(pay12) === "charged" ? fromPence(thirdPence) : potentialPay,
        payState(pay12)
      )
    ];

    var fileBits = [];
    var fileBy = null;
    if (filedDay == null) {
      if (today.value < penaltyDate) {
        fileBy = filingDeadline;
        fileBits.push("File by " + H.nice(filingDeadline) + " to avoid the £100 late filing penalty.");
      } else if (today.value < dailyStart) {
        fileBy = dailyStart - 1;
        fileBits.push("File by " + H.nice(dailyStart - 1) + " to avoid daily penalties of £10 a day, up to £900.");
      } else if (today.value < dailyEnd) {
        fileBy = today.value;
        fileBits.push("File by the end of today (" + H.nice(today.value) + ") to stop the daily penalties. Each further day adds £10, up to £900 in total.");
        if (today.value < sixMonth) {
          fileBits.push("File by " + H.nice(sixMonth - 1) + " to avoid the 6 month filing penalty of " + money(potentialGeared) + ".");
        }
      } else if (today.value < sixMonth) {
        fileBy = sixMonth - 1;
        fileBits.push("File by " + H.nice(sixMonth - 1) + " to avoid the 6 month filing penalty of " + money(potentialGeared) + ".");
      } else if (today.value < twelveMonth) {
        fileBy = twelveMonth - 1;
        fileBits.push("File by " + H.nice(twelveMonth - 1) + " to avoid the 12 month filing penalty of " + money(potentialGeared) + ".");
      }
    }

    var payBits = [];
    var payBy = null;
    if (paidDay == null && tax.value > 0) {
      if (today.value <= pay30) {
        payBy = pay30;
        if (today.value <= payDue) {
          payBits.push("Pay by " + H.nice(pay30) + " to avoid the 30 day late payment penalty of " + money(potentialPay) + ".");
        } else {
          payBits.push("Pay by " + H.nice(pay30) + " to avoid the 30 day late payment penalty of " + money(potentialPay) + ". Interest is already running.");
        }
      } else if (today.value <= pay6) {
        payBy = pay6;
        payBits.push("Pay by " + H.nice(pay6) + " to avoid the next late payment penalty of " + money(potentialPay) + ".");
      } else if (today.value <= pay12) {
        payBy = pay12;
        payBits.push("Pay by " + H.nice(pay12) + " to avoid the next late payment penalty of " + money(potentialPay) + ".");
      }
    }

    var bits = fileBits.concat(payBits);
    var sentence;
    if (bits.length) sentence = bits.join(" ");
    else if (paidDay == null && tax.value > 0 && today.value > payDue) {
      sentence = "Every penalty in this estimate has already arisen. Interest keeps running until you pay the tax.";
    } else if (filingPence === 0 && paymentPence === 0) {
      sentence = "Nothing in this estimate is late.";
    } else {
      sentence = "Every penalty in this estimate has already arisen.";
    }

    var by = null;
    if (fileBy != null && payBy != null) by = H.iso(Math.min(fileBy, payBy));
    else if (fileBy != null) by = H.iso(fileBy);
    else if (payBy != null) by = H.iso(payBy);

    base.penaltiesApply = true;
    base.regime = "current";
    base.filing = {
      initial: fromPence(initialPence),
      dailyDays: dailyDays,
      daily: fromPence(dailyPence),
      six: fromPence(sixPence),
      twelve: fromPence(twelvePence),
      total: fromPence(filingPence),
      dates: {
        penalty: H.iso(penaltyDate),
        dailyStart: H.iso(dailyStart),
        dailyEnd: H.iso(dailyEnd),
        six: H.iso(sixMonth),
        twelve: H.iso(twelveMonth)
      }
    };
    base.payment = {
      first: fromPence(firstPence),
      second: fromPence(secondPence),
      third: fromPence(thirdPence),
      total: fromPence(paymentPence),
      dates: {
        first: H.iso(pay30),
        firstCharge: H.iso(pay30 + 1),
        second: H.iso(pay6),
        secondCharge: H.iso(pay6 + 1),
        third: H.iso(pay12),
        thirdCharge: H.iso(pay12 + 1)
      }
    };
    base.timeline = timeline;
    base.total = fromPence(filingPence + paymentPence + toPence(base.interest));
    base.totalIncludesPenalties = true;
    base.next = {
      by: by,
      fileBy: fileBy == null ? null : H.iso(fileBy),
      payBy: payBy == null ? null : H.iso(payBy),
      sentence: sentence
    };
    return base;
  }

  var api = {
    YEARS: YEARS,
    CHECKED: CHECKED,
    calculate: calculate,
    percent5: percent5
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SaPenalties = api;
})(this);
