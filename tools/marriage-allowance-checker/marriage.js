/* Marriage Allowance engine for Plain Sums. Pure logic, no DOM.
   Checked 3 November 2026 on GOV.UK:
   https://www.gov.uk/marriage-allowance (transfer £1,260, saving up to £252, backdate to 6 April 2022,
   partner basic rate: £12,571 to £50,270, or in Scotland £12,571 to £43,662)
   https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances
   (Marriage Allowance £1,260 in 2026 to 2027 and 2027 to 2028) */
(function (root) {
  "use strict";
  var PA = 12570, TRANSFER = 1260, RATE = 0.2;
  var HIGHER = { ruk: 50270, scot: 43662 };
  var BACK_YEARS = ["2022/23", "2023/24", "2024/25", "2025/26"];
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { if (v === "" || v === undefined || v === null) return null; var n = Number(v); return isFinite(n) && n >= 0 ? n : NaN; }
  function calculate(input) {
    input = input || {};
    var low = num(input.lowIncome), high = num(input.highIncome), region = input.region === "scot" ? "scot" : "ruk";
    var back = input.backYears === undefined || input.backYears === "" ? 0 : Number(input.backYears);
    if (low === null || high === null) return { error: "Enter both incomes to see the answer." };
    if (isNaN(low) || isNaN(high)) return { error: "Enter each income as a number of £0 or more." };
    if (!(back >= 0 && back <= 4 && Math.floor(back) === back)) return { error: "Pick between 0 and 4 earlier years." };
    if (low > high) { var t = low; low = high; high = t; }
    var limit = HIGHER[region];
    var reasons = [];
    if (input.married === false) reasons.push("You need to be married or in a civil partnership. Living together is not enough.");
    if (high <= PA) reasons.push("The higher earner's income is not over the £12,570 Personal Allowance, so there is no tax for the allowance to cut.");
    if (high > limit) reasons.push("The higher earner's income is over £" + limit.toLocaleString("en-GB") + ", so they pay higher rate tax and cannot receive it.");
    var eligible = reasons.length === 0;
    var relief = eligible ? r2(RATE * Math.min(TRANSFER, high - PA)) : 0;
    var lowExtra = eligible ? r2(RATE * Math.min(TRANSFER, Math.max(0, low - (PA - TRANSFER)))) : 0;
    var net = r2(relief - lowExtra);
    var worthIt = eligible && net > 0;
    if (eligible && !worthIt) reasons.push("The lower earner's income is £12,570 or more, so the extra tax they pay cancels out the saving.");
    var backTotal = worthIt ? r2(net * back) : 0;
    return {
      error: false, eligible: eligible, worthIt: worthIt, reasons: reasons, region: region, limit: limit,
      transfer: TRANSFER, low: low, high: high, relief: relief, lowExtra: lowExtra, net: worthIt ? net : 0,
      backYears: back, backList: BACK_YEARS.slice(4 - back), backTotal: backTotal, total: r2((worthIt ? net : 0) + backTotal)
    };
  }
  var api = { PA: PA, TRANSFER: TRANSFER, HIGHER: HIGHER, BACK_YEARS: BACK_YEARS, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Marriage = api;
})(this);
