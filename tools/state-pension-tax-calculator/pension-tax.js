/* Pension Tax Allowance checker, 2027/28. Pure logic, no DOM.
 * Browser: window.PensionTaxAllowance. Node: require.
 *
 * Sources, checked 29 October 2026:
 *  Pension Tax Allowance explainer (published 28 October 2026):
 *    https://www.gov.uk/government/publications/pension-tax-allowance-explainer/pension-tax-allowance-explainer
 *  Budget 2026 OOTLAR Annex A, rates and allowances (PTA table, bands, rates, allowances):
 *    https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances
 *
 * Confirmed on GOV.UK for 2027/28:
 *  Full annual value of the new State Pension £13,036.40 (explainer).
 *  Full PTA if total income is £13,037 or less; withdrawn at £1 for every £3 above £13,037;
 *    no PTA at £13,319 or more (Annex A and explainer).
 *  Full PTA "worth up to £94" (explainer). 13,037 + 3 x 94 = 13,319, which ties the three figures together.
 *  PTA is a tax reduction, not a change to the Personal Allowance; it never creates a refund.
 *  PTA uses the 20% basic rate even for Scottish taxpayers (explainer FAQ). Scottish bands are not modelled here.
 *  Savings income counts towards total income even when the starting rate or Personal Savings Allowance covers it;
 *    ISA income does not count (explainer FAQ).
 *  Rates 2027/28: main 20/40/45, property 24/44/49, savings 24/44/49, dividends 10.75/35.75/39.35 (Annex A).
 *  Personal Allowance £12,570, taper over £100,000; basic band £37,700; additional over £125,140 (Annex A).
 *  Starting rate for savings 0% on £5,000; PSA £1,000 basic, £500 higher; Dividend Allowance £500 (Annex A).
 * To be confirmed:
 *  The exact PTA thresholds for 2028/29 and 2029/30 (GOV.UK says they rise with the new State Pension).
 *  Whether HMRC rounds the PTA; the GOV.UK examples are shown to the nearest pound.
 *  The order the Personal Allowance is set against property income versus other income from April 2027.
 */
(function (root) {
  "use strict";

  var C = {
    year: "2027-28",
    label: "2027/28",
    personalAllowance: 12570,
    paTaperStart: 100000,
    basicBand: 37700,
    additionalFrom: 125140,
    rates: {
      main: [0.20, 0.40, 0.45],
      property: [0.24, 0.44, 0.49],
      savings: [0.24, 0.44, 0.49],
      dividends: [0.1075, 0.3575, 0.3935]
    },
    startingRateLimit: 5000,
    psa: { basic: 1000, higher: 500, additional: 0 },
    dividendAllowance: 500,
    pta: {
      fullNewStatePension: 13036.40,
      threshold: 13037,
      removedAt: 13319,
      maxValue: 94,
      withdrawPerPound: 1 / 3,
      years: ["2027-28", "2028-29", "2029-30"]
    }
  };

  var SOURCES = [
    { label: "GOV.UK: Pension Tax Allowance explainer", href: "https://www.gov.uk/government/publications/pension-tax-allowance-explainer/pension-tax-allowance-explainer" },
    { label: "GOV.UK: Budget 2026 OOTLAR Annex A, rates and allowances", href: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances" }
  ];

  var SOURCES_KEYS = ["statePension", "privatePension", "work", "savings", "property", "dividends"];

  function r2(n) { return Math.round((n + (n >= 0 ? 1e-9 : -1e-9)) * 100) / 100; }
  function num(v) {
    if (v === "" || v === null || v === undefined) return 0;
    var n = Number(String(v).replace(/[£,\s]/g, ""));
    return isFinite(n) ? n : NaN;
  }

  // Tax on a slice of income stacked from position pos, split across the bands.
  function sliceTax(pos, amount, rates) {
    var tax = 0, edges = [C.basicBand, C.additionalFrom, Infinity], start = pos;
    var left = amount;
    for (var i = 0; i < 3 && left > 0; i++) {
      var room = Math.max(0, edges[i] - start);
      var take = Math.min(room, left);
      tax += take * rates[i];
      start += take; left -= take;
    }
    return tax;
  }

  // Income Tax before any Pension Tax Allowance, England, Wales and Northern Ireland bands.
  function incomeTax(inc) {
    var ns = inc.statePension + inc.privatePension + inc.work;
    var pr = inc.property, sv = inc.savings, dv = inc.dividends;
    var total = ns + pr + sv + dv;
    var pa = Math.max(0, C.personalAllowance - Math.max(0, total - C.paTaperStart) / 2);
    var left = pa;
    function usePA(x) { var u = Math.min(left, x); left -= u; return x - u; }
    var tNs = usePA(ns), tPr = usePA(pr), tSv = usePA(sv), tDv = usePA(dv);
    var taxable = tNs + tPr + tSv + tDv;
    var band = taxable > C.additionalFrom ? "additional" : (taxable > C.basicBand ? "higher" : "basic");
    var pos = 0, tax = 0;
    tax += sliceTax(pos, tNs, C.rates.main); pos += tNs;
    tax += sliceTax(pos, tPr, C.rates.property); pos += tPr;
    var srs = Math.max(0, C.startingRateLimit - (tNs + tPr));
    var srsUsed = Math.min(srs, tSv);
    var psaUsed = Math.min(C.psa[band], tSv - srsUsed);
    pos += srsUsed + psaUsed;
    var svCharged = tSv - srsUsed - psaUsed;
    tax += sliceTax(pos, svCharged, C.rates.savings); pos += svCharged;
    var daUsed = Math.min(C.dividendAllowance, tDv);
    pos += daUsed;
    tax += sliceTax(pos, tDv - daUsed, C.rates.dividends);
    return {
      totalIncome: r2(total), personalAllowance: r2(pa), taxable: r2(taxable), band: band,
      startingRateUsed: r2(srsUsed), psaUsed: r2(psaUsed), dividendAllowanceUsed: r2(daUsed),
      tax: r2(tax),
      taxRaw: tax
    };
  }

  // Value of the PTA before it is capped at the tax bill.
  function ptaValue(totalIncome, overSPA) {
    if (!overSPA) return 0;
    var p = C.pta;
    if (totalIncome <= p.threshold) return p.maxValue;
    if (totalIncome >= p.removedAt) return 0;
    return Math.max(0, p.maxValue - (totalIncome - p.threshold) * p.withdrawPerPound);
  }

  function taxAfter(inc, overSPA) {
    var it = incomeTax(inc);
    var value = ptaValue(it.totalIncome, overSPA);
    var reduction = Math.min(value, it.tax);
    return { it: it, ptaValue: r2(value), reduction: r2(reduction), taxAfter: r2(it.tax - reduction), rawAfter: it.taxRaw - Math.min(value, it.taxRaw) };
  }

  function band(totalIncome, overSPA) {
    if (!overSPA) return "notEligible";
    if (totalIncome <= C.personalAllowance) return "belowPA";
    if (totalIncome <= C.pta.threshold) return "full";
    if (totalIncome < C.pta.removedAt) return "taper";
    return "none";
  }

  // input: { statePension, privatePension, work, savings, property, dividends, overSPA (default true) }
  function calculate(input) {
    input = input || {};
    var inc = {}, errors = {};
    SOURCES_KEYS.forEach(function (k) {
      var v = num(input[k]);
      if (isNaN(v) || v < 0 || v > 10000000) errors[k] = "Enter an amount between £0 and £10,000,000.";
      inc[k] = v;
    });
    if (Object.keys(errors).length) return { error: true, errors: errors };
    var overSPA = input.overSPA !== false;
    var base = taxAfter(inc, overSPA);
    var without = base.it.tax;
    // Marginal rate and "extra £100 of pension", tested by adding £100 of private pension income.
    var plus100 = Object.assign({}, inc, { privatePension: inc.privatePension + 100 });
    var extra100Tax = r2(taxAfter(plus100, overSPA).rawAfter - base.rawAfter);
    return {
      error: false,
      errors: {},
      year: C.label,
      overSPA: overSPA,
      income: inc,
      totalIncome: base.it.totalIncome,
      personalAllowance: base.it.personalAllowance,
      taxable: base.it.taxable,
      taxBand: base.it.band,
      startingRateUsed: base.it.startingRateUsed,
      psaUsed: base.it.psaUsed,
      taxWithoutPTA: without,
      ptaValue: base.ptaValue,
      ptaReduction: base.reduction,
      taxWithPTA: base.taxAfter,
      ptaBand: band(base.it.totalIncome, overSPA),
      marginalRate: extra100Tax, // percent: tax on the next £100 of pension
      extra100Tax: extra100Tax,
      extra100Keep: r2(100 - extra100Tax)
    };
  }

  var api = { CONFIG: C, SOURCES: SOURCES, incomeTax: incomeTax, ptaValue: ptaValue, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PensionTaxAllowance = api;
})(typeof window !== "undefined" ? window : this);
