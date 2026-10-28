/* BUDGET_2026: the "after the Budget" column. See BUDGET_UPDATE.md in the repo root.
   Updated 28 October 2026 with the confirmed Budget 2026 figures for 2027/28, checked on GOV.UK:
     Budget 2026: Overview of tax legislation and rates (OOTLAR), Annex A: rates and allowances
       https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances
     Budget 2026 (HTML)
       https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html
   Annex A sets the 2027/28 Personal Allowance (12,570), the £100,000 taper, the main Income Tax
   rates and bands (20% to 37,700, 40% to 125,140, 45% above) and employee Class 1 NI (8% from the
   Primary Threshold of £242 a week to the UEL of £967 a week, 2% above) at the same level as 2026/27.
   So no figure below changes. The Budget raises the savings and property Income Tax rates to 24%,
   44% and 49% from 6 April 2027, but that does not touch pay from a job.
   Student loans: the Budget caps Plan 2 and Plan 3 interest at 6% from 1 September 2026 to
   31 August 2027 (interest, not repayments) and the Plan 2 threshold stays frozen at 29,385
   (announced at Budget 2025). No other student loan threshold is set in the Budget documents.
   Scotland: the Scottish Parliament sets Scottish Income Tax, so the Scottish bands stay at 2026/27. */
(function (root) {
  "use strict";
  var BUDGET_2026 = {
    id: "budget-2026",
    label: "After the Budget",
    announced: true,                  // Budget 2026 figures checked on 28 October 2026
    effectiveFrom: "6 April 2027",    // start of the 2027/28 tax year; no mid year changes to pay in the Budget
    period: "6 April 2027 to 5 April 2028",
    checked: "2026-10-28",
    summary: "Nothing in the 28 October 2026 Budget changes tax on pay. The Personal Allowance, the Income Tax rates and bands and employee National Insurance stay the same for 2027/28, and there is no change to student loan repayments, so your take home pay from a job does not change because of the Budget.",
    sources: { budget: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html" },
    personalAllowance: 12570,
    taperStart: 100000,
    incomeTax: {
      ruk: [ { name: "Basic rate", rate: 0.20, to: 37700 }, { name: "Higher rate", rate: 0.40, to: 125140 }, { name: "Additional rate", rate: 0.45, to: null } ],
      scotland: [ { name: "Starter rate", rate: 0.19, to: 3967 }, { name: "Basic rate", rate: 0.20, to: 16956 }, { name: "Intermediate rate", rate: 0.21, to: 31092 },
        { name: "Higher rate", rate: 0.42, to: 62430 }, { name: "Advanced rate", rate: 0.45, to: 125140 }, { name: "Top rate", rate: 0.48, to: null } ]
    },
    ni: { primaryThreshold: 12570, upperEarningsLimit: 50270, mainRate: 0.08, upperRate: 0.02 },
    studentLoan: {
      plan1: { threshold: 26900, rate: 0.09 }, plan2: { threshold: 29385, rate: 0.09 },
      plan4: { threshold: 33795, rate: 0.09 }, plan5: { threshold: 25000, rate: 0.09 },
      postgrad: { threshold: 21000, rate: 0.06 }
    },
    reliefAtSourceRate: 0.20
  };
  function compare(Pay, input) {
    var now = Pay.calculate(input, Pay.CONFIGS[0]), after = Pay.calculate(input, BUDGET_2026);
    if (now.error) return { error: true, errors: now.errors };
    var d = after.takeHome - now.takeHome;
    return { error: false, now: now, after: after, diffYear: d, diffMonth: d / 12, announced: BUDGET_2026.announced };
  }
  var api = { BUDGET_2026: BUDGET_2026, compare: compare };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Budget = api;
})(typeof window !== "undefined" ? window : this);
