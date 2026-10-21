/* BUDGET_2026: the "after the Budget" column. See BUDGET_UPDATE.md in the repo root.
   Until 28 October 2026 this is a copy of the confirmed 2026/27 rules in pay.js, so the difference is £0.
   On the day: set announced to true, fill in the dates and sources, and change only the numbers that changed. */
(function (root) {
  "use strict";
  var BUDGET_2026 = {
    id: "budget-2026",
    label: "After the Budget",
    announced: false,                 // true once the new figures below are in; hides the "added on 28 October" banner
    effectiveFrom: "",                // when the changes start, for example "6 April 2027"; shown under the column heading
    period: "",                       // tax year the figures apply to, for example "6 April 2027 to 5 April 2028"
    checked: "",                      // date you checked the figures, YYYY-MM-DD
    summary: "",                      // one plain sentence on what changed, shown above the results
    sources: { budget: "" },          // GOV.UK Budget document or policy paper URLs
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
