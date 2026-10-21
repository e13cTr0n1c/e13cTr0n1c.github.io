/* Take-home pay calculator. Pure logic, no DOM. Browser: window.Pay. Node: require.
   ALL rates and thresholds live in CONFIGS. To show a second set (for example after a Budget),
   add another object to CONFIGS with its own id and label, verified against GOV.UK, and the page
   shows the configs side by side. Do not edit the 2026/27 object once it is verified. */
(function (root) {
  "use strict";
  var CONFIGS = [
    {
      id: "2026-27",
      label: "2026/27 rates",
      period: "6 April 2026 to 5 April 2027",
      checked: "2026-10-20",
      sources: {
        incomeTax: "https://www.gov.uk/income-tax-rates",
        payroll: "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027",
        scotland: "https://www.gov.uk/scottish-income-tax",
        pensionRelief: "https://www.gov.uk/tax-on-your-private-pension/pension-tax-relief"
      },
      personalAllowance: 12570,
      taperStart: 100000,          // allowance falls by £1 for every £2 of adjusted net income above this
      // bands on taxable income (pay above the Personal Allowance in use); "to" is the top of each band, null for no top
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
    }
  ];
  var PLANS = ["none", "plan1", "plan2", "plan4", "plan5"];

  function bandTax(taxable, bands) {
    var tax = 0, lo = 0, parts = [];
    bands.forEach(function (b) {
      var hi = b.to === null ? Infinity : b.to, amt = Math.max(0, Math.min(taxable, hi) - lo);
      tax += amt * b.rate; parts.push({ name: b.name, rate: b.rate, amount: amt, tax: amt * b.rate }); lo = hi;
    });
    return { tax: tax, parts: parts };
  }
  function allowance(cfg, ani) {
    var over = Math.max(0, ani - cfg.taperStart);
    return Math.max(0, cfg.personalAllowance - Math.floor(over / 2));
  }
  // pay: pay after any salary sacrifice. less: an amount taken off for adjusted net income and taxable income (used to price a relief at source claim)
  function incomeTax(cfg, region, pay, less) {
    less = less || 0;
    var pa = allowance(cfg, pay - less), taxable = Math.max(0, pay - less - pa);
    var r = bandTax(taxable, cfg.incomeTax[region]);
    return { tax: r.tax, parts: r.parts, personalAllowance: pa, taxable: taxable };
  }
  function ni(cfg, gross) {
    var n = cfg.ni;
    return Math.max(0, Math.min(gross, n.upperEarningsLimit) - n.primaryThreshold) * n.mainRate + Math.max(0, gross - n.upperEarningsLimit) * n.upperRate;
  }
  function loan(p, gross) { return Math.max(0, gross - p.threshold) * p.rate; }

  function num(v) { if (v === "" || v === null || v === undefined) return null; var n = Number(String(v).replace(/[£,\s]/g, "")); return isFinite(n) ? n : NaN; }

  // input: { salary, region: 'ruk'|'scotland', plan: 'none'|'plan1'.., postgrad: bool, pensionPct, pensionType: 'sacrifice'|'ras' }
  function calculate(input, cfg) {
    cfg = cfg || CONFIGS[0];
    var errors = {};
    var salary = num(input.salary), pct = num(input.pensionPct);
    if (salary === null) errors.salary = "Enter your yearly pay before tax.";
    else if (isNaN(salary) || salary < 0 || salary > 10000000) errors.salary = "Enter an amount between £0 and £10,000,000.";
    if (pct === null) pct = 0;
    if (isNaN(pct) || pct < 0 || pct > 100) errors.pensionPct = "Enter a percentage between 0 and 100.";
    var region = input.region === "scotland" ? "scotland" : "ruk";
    var plan = PLANS.indexOf(input.plan) >= 0 ? input.plan : "none";
    var type = input.pensionType === "ras" ? "ras" : "sacrifice";
    if (Object.keys(errors).length) return { error: true, errors: errors };

    var pension = salary * pct / 100;           // the gross pension contribution
    var sacrifice = type === "sacrifice" ? pension : 0;
    var rasGross = type === "ras" ? pension : 0;
    var rasNet = rasGross * (1 - cfg.reliefAtSourceRate);
    var pay = salary - sacrifice;               // pay that tax, NI and student loans are worked on

    var it = incomeTax(cfg, region, pay, 0);    // PAYE does not know about relief at source
    var itClaim = rasGross > 0 ? incomeTax(cfg, region, pay, rasGross) : it;
    // relief above the 20% added at source, claimed through Self Assessment or by asking HMRC: widening the bands by the gross
    // contribution gives the same answer as tax on pay less the contribution, minus the 20% already added
    var extraRelief = rasGross > 0 ? Math.max(0, it.tax - itClaim.tax - (rasGross - rasNet)) : 0;
    var nic = ni(cfg, pay);
    var sl = plan === "none" ? 0 : loan(cfg.studentLoan[plan], pay);
    var pg = input.postgrad ? loan(cfg.studentLoan.postgrad, pay) : 0;
    var takeHome = pay - it.tax - nic - sl - pg - rasNet;
    function per(x) { return { year: x, month: x / 12, week: x / 52 }; }
    return {
      error: false, config: cfg.id, label: cfg.label, region: region,
      salary: salary, pension: pension, sacrifice: sacrifice, rasNet: rasNet, rasGross: rasGross, pay: pay,
      personalAllowance: it.personalAllowance, taxable: it.taxable, bands: it.parts,
      incomeTax: it.tax, ni: nic, studentLoan: sl, postgrad: pg, extraRelief: extraRelief,
      takeHome: takeHome, takeHomeAfterClaim: takeHome + extraRelief,
      perPeriod: per(takeHome)
    };
  }
  function calculateAll(input) { return CONFIGS.map(function (c) { return calculate(input, c); }); }
  var api = { CONFIGS: CONFIGS, PLANS: PLANS, calculate: calculate, calculateAll: calculateAll, incomeTax: incomeTax, ni: ni, allowance: allowance,
    ctaHref: function (url, ref) {
      url = String(url || "").trim();
      if (!/^https:\/\/[^\s]+$/i.test(url)) return "";
      var hash = "", i = url.indexOf("#");
      if (i >= 0) { hash = url.slice(i); url = url.slice(0, i); }
      if (/[?&]ref=/.test(url)) return url + hash;
      return url + (url.indexOf("?") >= 0 ? "&" : "?") + "ref=" + encodeURIComponent(ref) + hash;
    } };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Pay = api;
})(typeof window !== "undefined" ? window : this);
