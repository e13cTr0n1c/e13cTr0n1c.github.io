/* HMRC late payment and repayment interest rates.
   One table, newest last. Update this file when GOV.UK publishes a new row.
   Checked 9 November 2026 against:
   https://www.gov.uk/government/publications/rates-and-allowances-hmrc-interest-rates-for-late-and-early-payments/rates-and-allowances-hmrc-interest-rates
   (page updated 6 November 2026)
   These are the main rates for Income Tax, National Insurance, Capital Gains Tax,
   Stamp Duty Land Tax, Stamp Duty, Stamp Duty Reserve Tax from 1 October 1999,
   and VAT for periods starting on or after 1 January 2023.
   From 29 September 2009 the same percentages are also on the Corporation Tax
   (normal due date) and Inheritance Tax rows. Corporation Tax quarterly
   instalments use a different table and are not in this file.
   Late payment is base rate plus 4% from 6 April 2025, and base rate plus 2.5% before that.
   Repayment interest is base rate minus 1%, with a minimum of 0.5% under the current rule.
   The rows below are the published percentages, not a formula I recompute. */
(function (root) {
  "use strict";
  var RATES = [
    { from: "2000-02-06", late: 8.50, repayment: 4.00 },
    { from: "2001-05-06", late: 7.50, repayment: 3.00 },
    { from: "2001-11-06", late: 6.50, repayment: 2.25 },
    { from: "2003-08-06", late: 5.50, repayment: 1.50 },
    { from: "2003-12-06", late: 6.50, repayment: 2.25 },
    { from: "2004-09-06", late: 7.50, repayment: 3.00 },
    { from: "2005-09-06", late: 6.50, repayment: 2.25 },
    { from: "2006-09-06", late: 7.50, repayment: 3.00 },
    { from: "2007-08-06", late: 8.50, repayment: 4.00 },
    { from: "2008-01-06", late: 7.50, repayment: 3.00 },
    { from: "2008-11-06", late: 6.50, repayment: 2.25 },
    { from: "2008-12-06", late: 5.50, repayment: 1.50 },
    { from: "2009-01-06", late: 4.50, repayment: 0.75 },
    { from: "2009-01-27", late: 3.50, repayment: 0.00 },
    { from: "2009-03-24", late: 2.50, repayment: 0.00 },
    { from: "2009-09-29", late: 3.00, repayment: 0.50 },
    { from: "2016-08-23", late: 2.75, repayment: 0.50 },
    { from: "2017-11-21", late: 3.00, repayment: 0.50 },
    { from: "2018-08-21", late: 3.25, repayment: 0.50 },
    { from: "2020-03-30", late: 2.75, repayment: 0.50 },
    { from: "2020-04-07", late: 2.60, repayment: 0.50 },
    { from: "2022-01-07", late: 2.75, repayment: 0.50 },
    { from: "2022-02-21", late: 3.00, repayment: 0.50 },
    { from: "2022-04-05", late: 3.25, repayment: 0.50 },
    { from: "2022-05-24", late: 3.50, repayment: 0.50 },
    { from: "2022-07-05", late: 3.75, repayment: 0.50 },
    { from: "2022-08-23", late: 4.25, repayment: 0.75 },
    { from: "2022-10-11", late: 4.75, repayment: 1.25 },
    { from: "2022-11-22", late: 5.50, repayment: 2.00 },
    { from: "2023-01-06", late: 6.00, repayment: 2.50 },
    { from: "2023-02-21", late: 6.50, repayment: 3.00 },
    { from: "2023-04-13", late: 6.75, repayment: 3.25 },
    { from: "2023-05-31", late: 7.00, repayment: 3.50 },
    { from: "2023-07-11", late: 7.50, repayment: 4.00 },
    { from: "2023-08-22", late: 7.75, repayment: 4.25 },
    { from: "2024-08-20", late: 7.50, repayment: 4.00 },
    { from: "2024-11-26", late: 7.25, repayment: 3.75 },
    { from: "2025-02-25", late: 7.00, repayment: 3.50 },
    { from: "2025-04-06", late: 8.50, repayment: 3.50 },
    { from: "2025-05-28", late: 8.25, repayment: 3.25 },
    { from: "2025-08-27", late: 8.00, repayment: 3.00 },
    { from: "2026-01-09", late: 7.75, repayment: 2.75 },
    { from: "2026-11-24", late: 8.00, repayment: 3.00 }
  ];
  var api = {
    RATES: RATES,
    EARLIEST: RATES[0].from,
    CHECKED: "2026-11-09",
    SOURCE: "https://www.gov.uk/government/publications/rates-and-allowances-hmrc-interest-rates-for-late-and-early-payments/rates-and-allowances-hmrc-interest-rates",
    DAYS_GUIDE: "https://www.gov.uk/hmrc-internal-manuals/compliance-handbook/ch140220",
    NEWS: "https://www.gov.uk/government/news/hmrc-interest-rates-update--2"
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HmrcRates = api;
})(this);
