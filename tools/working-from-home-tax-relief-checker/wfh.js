/* Working from home tax relief for employees. Pure logic, no DOM.
   Browser: window.Wfh. Node: require.
   Checked 16 November 2026.

   Who can claim, the £6 a week, and the exact costs route:
   https://www.gov.uk/tax-relief-for-employees/working-at-home
   Four year time limit and the £2,500 P87 line:
   https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-expenses-by-post-or-phone
   Online service linked from that GOV.UK page (Start now):
   https://www.tax.service.gov.uk/claim-tax-relief-expenses/only-claiming-working-from-home-tax-relief
   Tests before 6 April 2026: EIM32760 (section 336 ITEPA 2003).
   https://www.gov.uk/hmrc-internal-manuals/employment-income-manual/eim32760
   No employee deduction from 6 April 2026: EIM32759 (section 360B ITEPA 2003,
   inserted by the Finance Act 2026 for 2026/27 and later years).
   https://www.gov.uk/hmrc-internal-manuals/employment-income-manual/eim32759
   https://www.legislation.gov.uk/ukpga/2003/1/section/360B
   Employer payments can continue. £6 a week needs no bills. It is not a cap:
   EIM01472 and EIM01476 (section 316A ITEPA 2003).
   https://www.gov.uk/hmrc-internal-manuals/employment-income-manual/eim01476
   Part repayment and the tax paid cap:
   https://www.gov.uk/guidance/claim-income-tax-relief-for-your-employment-expenses-p87

   A tax year ends on 5 April. The claim closes on 5 April four years later.
   2022/23 ends on 5 April 2023 and closes on 5 April 2027.
   I treat the closing date as the last day a claim is still in time.
   Days left are calendar days from today until that date. 0 means it closes today.
*/
(function (root) {
  "use strict";

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var RULES = {
    checked: "2026-11-16",
    weeklyPence: 600,
    defaultWeeks: 52,
    maxWeeks: 53,
    p87Pence: 250000,
    employerGuidelinePence: 600,
    onlineUrl: "https://www.tax.service.gov.uk/claim-tax-relief-expenses/only-claiming-working-from-home-tax-relief",
    postUrl: "https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-expenses-by-post-or-phone",
    guideUrl: "https://www.gov.uk/tax-relief-for-employees/working-at-home",
    rates: {
      basic: { basis: 2000, label: "Basic rate 20%" },
      higher: { basis: 4000, label: "Higher rate 40%" },
      additional: { basis: 4500, label: "Additional rate 45%" },
      other: { basis: null, label: "Other rate" }
    },
    reasons: {
      "no-office": { eligible: true },
      "far-away": { eligible: true },
      chose: { eligible: false },
      contract: { eligible: false },
      "office-full": { eligible: false }
    },
    years: [
      { id: "2022-23", label: "2022/23", end: "2023-04-05", claimBy: "2027-04-05" },
      { id: "2023-24", label: "2023/24", end: "2024-04-05", claimBy: "2028-04-05" },
      { id: "2024-25", label: "2024/25", end: "2025-04-05", claimBy: "2029-04-05" },
      { id: "2025-26", label: "2025/26", end: "2026-04-05", claimBy: "2030-04-05" }
    ],
    noRelief: {
      id: "2026-27",
      label: "2026/27",
      from: "2026-04-06",
      to: "2027-04-05"
    }
  };

  var FAIL = "You cannot claim. GOV.UK says you can claim only if you had to work from home, for example because your employer has no office or your job needs you to live far away from the office. You cannot claim if you chose to work from home, if your contract lets you work from home, or if the office was full.";

  var EMPLOYER = "Your employer can still pay you £6 a week for extra household costs without you having to show the bills. HMRC's £6 is not a cap. They can pay more if they keep evidence of the extra cost. That payment can stay tax free, including from 6 April 2026. It is not the same as you claiming relief yourself.";

  function yearById(id) {
    for (var i = 0; i < RULES.years.length; i++) if (RULES.years[i].id === id) return RULES.years[i];
    return null;
  }

  function parseISO(iso) {
    var p = String(iso).split("-");
    if (p.length !== 3) return NaN;
    var y = Number(p[0]), m = Number(p[1]), d = Number(p[2]);
    if (!y || m < 1 || m > 12 || d < 1 || d > 31) return NaN;
    return Date.UTC(y, m - 1, d);
  }

  function daysUntil(today, deadline) {
    var a = parseISO(today), b = parseISO(deadline);
    if (!isFinite(a) || !isFinite(b)) return null;
    return Math.round((b - a) / 86400000);
  }

  function formatDate(iso) {
    var p = String(iso).split("-");
    return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0];
  }

  function formatPounds(pence) {
    var n = Math.abs(Math.round(Number(pence)));
    var pounds = Math.floor(n / 100);
    var frac = n % 100;
    var s = String(pounds);
    var out = "";
    while (s.length > 3) {
      out = "," + s.slice(-3) + out;
      s = s.slice(0, -3);
    }
    return "£" + s + out + "." + (frac < 10 ? "0" : "") + frac;
  }

  function countdownLabel(days) {
    if (days > 1) return days + " days left";
    if (days === 1) return "1 day left";
    if (days === 0) return "Closes today";
    return "Closed";
  }

  function deadlines(today) {
    return RULES.years.map(function (y) {
      var days = daysUntil(today, y.claimBy);
      return {
        id: y.id,
        label: y.label,
        end: y.end,
        claimBy: y.claimBy,
        claimByLabel: formatDate(y.claimBy),
        daysLeft: days,
        open: days !== null && days >= 0,
        countdown: days === null ? "" : countdownLabel(days)
      };
    });
  }

  function moneyToPence(value) {
    if (value === "" || value === null || value === undefined) return 0;
    var s = String(value).trim();
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    var parts = s.split(".");
    var frac = parts[1] ? parts[1] : "";
    while (frac.length < 2) frac += "0";
    return Number(parts[0]) * 100 + Number(frac);
  }

  function percentToBasis(value) {
    var s = String(value).trim();
    if (!/^\d{1,3}(\.\d{1,2})?$/.test(s)) return null;
    var parts = s.split(".");
    var frac = parts[1] ? parts[1] : "";
    while (frac.length < 2) frac += "0";
    var basis = Number(parts[0]) * 100 + Number(frac);
    if (basis > 10000) return null;
    return basis;
  }

  function basisLabel(basis) {
    var whole = Math.floor(basis / 100);
    var frac = basis % 100;
    if (frac === 0) return String(whole) + "%";
    if (frac % 10 === 0) return whole + "." + (frac / 10) + "%";
    return whole + "." + (frac < 10 ? "0" : "") + frac + "%";
  }

  function weeklyReliefLabel(basis) {
    var pence = Math.round(RULES.weeklyPence * basis / 10000);
    return formatPounds(pence) + " a week";
  }

  function failResult() {
    return {
      ok: true,
      eligible: false,
      totalReliefPence: 0,
      message: FAIL,
      employerNote: EMPLOYER,
      noRelief: RULES.noRelief
    };
  }

  /* input:
     { reason, mode: "flat"|"exact", rateId, otherPercent,
       selfAssessment: boolean, today: "YYYY-MM-DD",
       years: [{ id, weeks, exact, employerPaid }] }
     Flat mode uses £6 times the weeks (52 if weeks is left blank).
     Exact mode uses the pounds entered for that year.
     Employer paid is taken off before the tax rate. */
  function calculate(input) {
    input = input || {};
    var reason = RULES.reasons[input.reason];
    if (!input.reason) return { ok: false, error: "Choose the sentence that matches your job." };
    if (!reason) return { ok: false, error: "Choose the sentence that matches your job." };
    if (!reason.eligible) return failResult();

    var mode = input.mode === "exact" ? "exact" : input.mode === "flat" ? "flat" : null;
    if (!mode) return { ok: false, error: "Choose £6 a week or the exact costs." };

    var rate = RULES.rates[input.rateId];
    if (!rate) return { ok: false, error: "Choose the tax rate you pay." };
    var basis = rate.basis;
    var rateLabel = rate.label;
    if (input.rateId === "other") {
      if (input.otherPercent === "" || input.otherPercent === null || input.otherPercent === undefined) {
        return { ok: false, error: "Enter your tax rate as a percentage." };
      }
      basis = percentToBasis(input.otherPercent);
      if (basis === null) return { ok: false, error: "Enter a tax rate from 0 to 100, with up to two decimal places." };
      rateLabel = "Other rate " + basisLabel(basis);
    }

    var today = input.today;
    if (!isFinite(parseISO(today))) return { ok: false, error: "I need today's date to count the days left." };

    var rows = input.years;
    if (!rows || !rows.length) return { ok: false, error: "Tick the years you had to work from home and have not claimed yet." };

    var seen = {};
    var byId = {};
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i] || {};
      if (row.id === RULES.noRelief.id) {
        return { ok: false, error: "There is no employee tax relief for working from home in 2026/27. That starts on 6 April 2026." };
      }
      var spec = yearById(row.id);
      if (!spec) return { ok: false, error: "Choose a tax year from 2022/23 to 2025/26." };
      if (seen[row.id]) return { ok: false, error: "Each tax year should only be listed once." };
      seen[row.id] = true;

      var days = daysUntil(today, spec.claimBy);
      if (days < 0) {
        return { ok: false, error: spec.label + " closed on " + formatDate(spec.claimBy) + "." };
      }

      var expense = 0;
      var weeks = null;
      var weeksNote = "";
      if (mode === "flat") {
        var weeksRaw = row.weeks;
        if (weeksRaw === "" || weeksRaw === null || weeksRaw === undefined) weeksRaw = RULES.defaultWeeks;
        if (!/^\d{1,2}$/.test(String(weeksRaw).trim())) return { ok: false, error: "Enter whole weeks for " + spec.label + "." };
        weeks = Number(String(weeksRaw).trim());
        if (weeks > RULES.maxWeeks) return { ok: false, error: "Enter 0 to 53 weeks for " + spec.label + "." };
        if (weeks > RULES.defaultWeeks) weeksNote = "53 weeks is longer than the tax year. A tax year is 52 weeks and a day, or two days when it includes 29 February.";
        expense = weeks * RULES.weeklyPence;
      } else {
        if (row.exact === "" || row.exact === null || row.exact === undefined) {
          return { ok: false, error: "Enter the exact extra costs for " + spec.label + "." };
        }
        expense = moneyToPence(row.exact);
        if (expense === null) return { ok: false, error: "Enter the exact extra costs for " + spec.label + " in pounds and pence." };
      }

      var paidRaw = row.employerPaid;
      if (paidRaw === "" || paidRaw === null || paidRaw === undefined) paidRaw = 0;
      var paid = moneyToPence(paidRaw);
      if (paid === null) return { ok: false, error: "Enter what your employer already paid for " + spec.label + " in pounds and pence." };

      var claim = expense - paid;
      if (claim < 0) claim = 0;
      var relief = Math.round(claim * basis / 10000);
      var working = workingLine(mode, weeks, expense, paid, claim, basis, relief);

      byId[spec.id] = {
        id: spec.id,
        label: spec.label,
        claimBy: spec.claimBy,
        claimByLabel: formatDate(spec.claimBy),
        daysLeft: days,
        countdown: countdownLabel(days),
        open: true,
        weeks: weeks,
        weeksNote: weeksNote,
        expensePence: expense,
        employerPence: paid,
        claimPence: claim,
        reliefPence: relief,
        fullyReimbursed: expense > 0 && claim === 0,
        overP87: claim > RULES.p87Pence,
        receipts: mode === "exact" && claim > 0,
        working: working
      };
    }

    var years = [];
    var totalExpense = 0, totalClaim = 0, totalRelief = 0;
    RULES.years.forEach(function (spec) {
      if (!byId[spec.id]) return;
      var y = byId[spec.id];
      years.push(y);
      totalExpense += y.expensePence;
      totalClaim += y.claimPence;
      totalRelief += y.reliefPence;
    });

    var anyOver = false, anyUnder = false, reimbursedYears = 0, emptyYears = 0;
    years.forEach(function (y) {
      if (y.claimPence > RULES.p87Pence) anyOver = true;
      if (y.claimPence > 0 && y.claimPence <= RULES.p87Pence) anyUnder = true;
      if (y.expensePence === 0) emptyYears++;
      else if (y.claimPence === 0) reimbursedYears++;
    });

    var route = "none";
    if (totalClaim > 0) {
      if (input.selfAssessment) route = "return";
      else if (anyOver && anyUnder) route = "mixed";
      else if (anyOver) route = "return";
      else route = "online";
    }

    var message = "";
    if (totalClaim === 0 && reimbursedYears > 0) {
      message = "There is nothing left to claim. Your employer has already paid these costs back.";
    } else if (totalClaim === 0) {
      message = "Enter the weeks you had to work from home, or the exact extra costs.";
    }

    return {
      ok: true,
      eligible: true,
      reason: input.reason,
      mode: mode,
      rateBasis: basis,
      rateLabel: rateLabel,
      rateText: basisLabel(basis),
      weeklyRelief: weeklyReliefLabel(basis),
      selfAssessment: !!input.selfAssessment,
      today: today,
      years: years,
      totalExpensePence: totalExpense,
      totalClaimPence: totalClaim,
      totalReliefPence: totalRelief,
      anyOverP87: anyOver,
      allFullyReimbursed: reimbursedYears > 0 && emptyYears === 0 && totalClaim === 0,
      route: route,
      employerNote: EMPLOYER,
      noRelief: RULES.noRelief,
      message: message
    };
  }

  function workingLine(mode, weeks, expense, paid, claim, basis, relief) {
    var rate = basisLabel(basis);
    var head;
    if (mode === "flat") {
      head = "£6 a week for " + weeks + (weeks === 1 ? " week" : " weeks") + " is " + formatPounds(expense) + ".";
    } else {
      head = "Exact extra costs of " + formatPounds(expense) + ".";
    }
    if (expense === 0) return head + " There is no relief for this year.";
    if (paid > 0 && claim === 0) {
      return head + " Your employer already paid " + formatPounds(paid) + ", so there is nothing left to claim.";
    }
    if (paid > 0) {
      head += " Your employer already paid " + formatPounds(paid) + ", so " + formatPounds(claim) + " is left.";
    }
    var tail = " At " + rate + " the relief is " + formatPounds(relief) + ".";
    if (mode === "flat" && paid === 0) tail += " That is " + weeklyReliefLabel(basis) + ".";
    if (mode === "exact" && claim > 0) tail += " You need receipts or bills for this amount.";
    return head + tail;
  }

  var api = {
    RULES: RULES,
    FAIL: FAIL,
    EMPLOYER: EMPLOYER,
    daysUntil: daysUntil,
    deadlines: deadlines,
    formatDate: formatDate,
    formatPounds: formatPounds,
    countdownLabel: countdownLabel,
    moneyToPence: moneyToPence,
    percentToBasis: percentToBasis,
    calculate: calculate
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Wfh = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
