/* Energy price cap rates for the January 2027 bill calculator.
   ENERGY_CAP_RATES.next holds Ofgem's official cap for 1 January to
   31 March 2027, published 25 November 2026. status is "official".
   Gas includes VAT at 5%. Electricity has no VAT from 1 October 2026
   to 30 June 2027.
   Last checked 26 November 2026.
*/
(function (root) {
  "use strict";

  var ENERGY_CAP_RATES = {
  lastChecked: "2026-11-26",
  daysInYear: 365,
  vat: {
    electricityPercent: 0,
    gasPercent: 5,
    electricityVatUntil: "2027-06-30",
    note: "Gas rates include VAT at 5%. Electricity has no VAT from 1 October 2026 to 30 June 2027. The pence rates below already include that VAT treatment, so the calculator does not add VAT on top."
  },
  tdcv: {
    from: "2026-07-01",
    electricity: { low: 1600, typical: 2500, high: 3800 },
    gas: { low: 6000, typical: 9500, high: 14000 },
    previousTypical: { electricityKwh: 2700, gasKwh: 11500, until: "2026-06-30" },
    sourceUrl: "https://www.ofgem.gov.uk/sites/default/files/2026-05/Review%20of%20typical%20domestic%20consumption%20values%20decision.pdf",
    sourceTitle: "Ofgem, Review of typical domestic consumption values: decision, 27 May 2026"
  },
  payments: [
    { id: "directDebit", label: "Direct Debit" },
    { id: "standardCredit", label: "Standard credit" },
    { id: "prepayment", label: "Prepayment" }
  ],
  regions: [
    { id: "gb", label: "Great Britain average" },
    { id: "northWest", label: "North Western England" },
    { id: "northEast", label: "North Eastern England" },
    { id: "yorkshire", label: "Yorkshire" },
    { id: "northernScotland", label: "Northern Scotland" },
    { id: "southern", label: "Southern England" },
    { id: "southernScotland", label: "Southern Scotland" },
    { id: "merseysideNorthWales", label: "Merseyside and Northern Wales" },
    { id: "london", label: "London" },
    { id: "southEast", label: "South Eastern England" },
    { id: "eastern", label: "Eastern England" },
    { id: "eastMidlands", label: "East Midlands" },
    { id: "westMidlands", label: "West Midlands" },
    { id: "southWest", label: "South Western England" },
    { id: "southWales", label: "Southern Wales" }
  ],
  current: {
    status: "official",
    label: "1 October to 31 December 2026",
    period: { from: "2026-10-01", to: "2026-12-31" },
    published: "2026-08-26",
    /* Ofgem rounds these typical dual fuel bills to the nearest pound. */
    headlinePounds: { directDebit: 1723, standardCredit: 1861, prepayment: 1678 },
    sourceTitle: "Ofgem, Energy price cap unit rates and standing charges, 1 October to 31 December 2026",
    sourceUrl: "https://www.ofgem.gov.uk/your-energy-supply/your-energy-bill/energy-price-cap-unit-rates-and-standing-charges",
    tablesTitle: "Ofgem, Benchmark maximum charges for charge restriction period 17a (cap tables PDF), 26 August 2026",
    tablesUrl: "https://www.ofgem.gov.uk/sites/default/files/2026-08/17a-PDF-Cap-Tables.pdf",
    newsTitle: "Ofgem, Changes to the energy price cap between 1 October and 31 December 2026, 26 August 2026",
    newsUrl: "https://www.ofgem.gov.uk/news/changes-energy-price-cap-between-1-october-and-31-december-2026",
    summaryTitle: "Ofgem, Summary of changes to the energy price cap, 1 October to 31 December 2026",
    summaryUrl: "https://www.ofgem.gov.uk/sites/default/files/2026-08/Summary-of-changes-to-energy-price-cap-1-October-to-31-December-2026.pdf",
    /* gb is the average Ofgem publishes. It is not a simple mean of the 14 regions.
       Regional pence rates are derived from the cap tables PDF, which is exclusive
       of VAT: electricity is unchanged because VAT is 0%, and gas is increased by 5%,
       then rounded half up to 2 decimal places. */

    rates: {
      directDebit: {
        gb: { electricityStandingPence: 54.83, electricityUnitPence: 26.32, gasStandingPence: 29.68, gasUnitPence: 7.97 },
        northWest: { electricityStandingPence: 45.68, electricityUnitPence: 26.49, gasStandingPence: 29.81, gasUnitPence: 7.86 },
        northEast: { electricityStandingPence: 61.58, electricityUnitPence: 25.46, gasStandingPence: 29.79, gasUnitPence: 7.92 },
        yorkshire: { electricityStandingPence: 61.67, electricityUnitPence: 25.60, gasStandingPence: 29.77, gasUnitPence: 7.90 },
        northernScotland: { electricityStandingPence: 55.14, electricityUnitPence: 26.35, gasStandingPence: 29.87, gasUnitPence: 7.87 },
        southern: { electricityStandingPence: 47.81, electricityUnitPence: 26.47, gasStandingPence: 29.16, gasUnitPence: 8.17 },
        southernScotland: { electricityStandingPence: 61.41, electricityUnitPence: 26.11, gasStandingPence: 29.89, gasUnitPence: 7.87 },
        merseysideNorthWales: { electricityStandingPence: 67.66, electricityUnitPence: 27.86, gasStandingPence: 30.08, gasUnitPence: 7.91 },
        london: { electricityStandingPence: 42.92, electricityUnitPence: 26.60, gasStandingPence: 30.20, gasUnitPence: 8.15 },
        southEast: { electricityStandingPence: 52.32, electricityUnitPence: 26.88, gasStandingPence: 29.26, gasUnitPence: 8.05 },
        eastern: { electricityStandingPence: 51.84, electricityUnitPence: 26.61, gasStandingPence: 29.34, gasUnitPence: 7.91 },
        eastMidlands: { electricityStandingPence: 51.45, electricityUnitPence: 25.36, gasStandingPence: 29.41, gasUnitPence: 7.82 },
        westMidlands: { electricityStandingPence: 57.23, electricityUnitPence: 25.60, gasStandingPence: 29.71, gasUnitPence: 7.90 },
        southWest: { electricityStandingPence: 55.58, electricityUnitPence: 26.58, gasStandingPence: 29.31, gasUnitPence: 8.12 },
        southWales: { electricityStandingPence: 55.41, electricityUnitPence: 26.55, gasStandingPence: 29.96, gasUnitPence: 8.09 }
      },
      standardCredit: {
        gb: { electricityStandingPence: 63.49, electricityUnitPence: 27.80, gasStandingPence: 37.49, gasUnitPence: 8.39 },
        northWest: { electricityStandingPence: 53.73, electricityUnitPence: 27.98, gasStandingPence: 37.50, gasUnitPence: 8.29 },
        northEast: { electricityStandingPence: 70.61, electricityUnitPence: 26.89, gasStandingPence: 37.50, gasUnitPence: 8.35 },
        yorkshire: { electricityStandingPence: 70.67, electricityUnitPence: 27.05, gasStandingPence: 37.50, gasUnitPence: 8.32 },
        northernScotland: { electricityStandingPence: 63.67, electricityUnitPence: 27.83, gasStandingPence: 37.50, gasUnitPence: 8.29 },
        southern: { electricityStandingPence: 56.41, electricityUnitPence: 27.95, gasStandingPence: 37.48, gasUnitPence: 8.61 },
        southernScotland: { electricityStandingPence: 70.19, electricityUnitPence: 27.58, gasStandingPence: 37.50, gasUnitPence: 8.29 },
        merseysideNorthWales: { electricityStandingPence: 76.72, electricityUnitPence: 29.43, gasStandingPence: 37.50, gasUnitPence: 8.33 },
        london: { electricityStandingPence: 50.51, electricityUnitPence: 28.09, gasStandingPence: 37.49, gasUnitPence: 8.58 },
        southEast: { electricityStandingPence: 61.19, electricityUnitPence: 28.39, gasStandingPence: 37.49, gasUnitPence: 8.48 },
        eastern: { electricityStandingPence: 60.62, electricityUnitPence: 28.11, gasStandingPence: 37.50, gasUnitPence: 8.34 },
        eastMidlands: { electricityStandingPence: 60.05, electricityUnitPence: 26.78, gasStandingPence: 37.50, gasUnitPence: 8.24 },
        westMidlands: { electricityStandingPence: 65.99, electricityUnitPence: 27.04, gasStandingPence: 37.50, gasUnitPence: 8.33 },
        southWest: { electricityStandingPence: 64.55, electricityUnitPence: 28.08, gasStandingPence: 37.49, gasUnitPence: 8.55 },
        southWales: { electricityStandingPence: 63.93, electricityUnitPence: 28.05, gasStandingPence: 37.49, gasUnitPence: 8.52 }
      },
      prepayment: {
        gb: { electricityStandingPence: 54.83, electricityUnitPence: 25.52, gasStandingPence: 29.68, gasUnitPence: 7.70 },
        northWest: { electricityStandingPence: 45.68, electricityUnitPence: 25.68, gasStandingPence: 29.81, gasUnitPence: 7.58 },
        northEast: { electricityStandingPence: 61.58, electricityUnitPence: 24.68, gasStandingPence: 29.79, gasUnitPence: 7.66 },
        yorkshire: { electricityStandingPence: 61.67, electricityUnitPence: 24.82, gasStandingPence: 29.77, gasUnitPence: 7.61 },
        northernScotland: { electricityStandingPence: 55.14, electricityUnitPence: 25.54, gasStandingPence: 29.87, gasUnitPence: 7.57 },
        southern: { electricityStandingPence: 47.81, electricityUnitPence: 25.66, gasStandingPence: 29.16, gasUnitPence: 7.94 },
        southernScotland: { electricityStandingPence: 61.41, electricityUnitPence: 25.31, gasStandingPence: 29.89, gasUnitPence: 7.57 },
        merseysideNorthWales: { electricityStandingPence: 67.66, electricityUnitPence: 27.01, gasStandingPence: 30.08, gasUnitPence: 7.62 },
        london: { electricityStandingPence: 42.92, electricityUnitPence: 25.78, gasStandingPence: 30.20, gasUnitPence: 7.90 },
        southEast: { electricityStandingPence: 52.32, electricityUnitPence: 26.06, gasStandingPence: 29.26, gasUnitPence: 7.78 },
        eastern: { electricityStandingPence: 51.84, electricityUnitPence: 25.80, gasStandingPence: 29.34, gasUnitPence: 7.68 },
        eastMidlands: { electricityStandingPence: 51.45, electricityUnitPence: 24.58, gasStandingPence: 29.41, gasUnitPence: 7.54 },
        westMidlands: { electricityStandingPence: 57.23, electricityUnitPence: 24.82, gasStandingPence: 29.71, gasUnitPence: 7.64 },
        southWest: { electricityStandingPence: 55.58, electricityUnitPence: 25.77, gasStandingPence: 29.31, gasUnitPence: 7.89 },
        southWales: { electricityStandingPence: 55.41, electricityUnitPence: 25.74, gasStandingPence: 29.96, gasUnitPence: 7.80 }
      }
    }

  },

  /* January to March 2027. Official Ofgem cap, published 25 November 2026. */
  next: {
    status: "official",
    label: "1 January to 31 March 2027",
    period: { from: "2027-01-01", to: "2027-03-31" },
    published: "2026-11-25",
    nextAnnouncementDate: "2027-02-23",
    nextPeriodLabel: "1 April to 30 June 2027",
    /* Ofgem rounds these typical dual fuel bills to the nearest pound. */
    headlinePounds: { directDebit: 2166, standardCredit: 2328, prepayment: 2108 },
    sourceTitle: "Ofgem, Energy price cap unit rates and standing charges, 1 January to 31 March 2027",
    sourceUrl: "https://www.ofgem.gov.uk/your-energy-supply/your-energy-bill/energy-price-cap-unit-rates-and-standing-charges",
    newsTitle: "Ofgem, Changes to the energy price cap between 1 January and 31 March 2027, 25 November 2026",
    newsUrl: "https://www.ofgem.gov.uk/news/changes-energy-price-cap-between-1-january-and-31-march-2027",
    tablesTitle: "Ofgem, Benchmark maximum charges for charge restriction period 17b, 25 November 2026",
    tablesUrl: "https://www.ofgem.gov.uk/sites/default/files/2026-11/energy-price-cap-levels-1-January-to-31-March-2027.pdf",
    summaryTitle: "Ofgem, Summary of changes to the energy price cap, 1 January to 31 March 2027",
    summaryUrl: "https://www.ofgem.gov.uk/sites/default/files/2026-11/summary-of-changes-to-energy-price-cap-1-January-to-31-March-2027.pdf",
    /* gb is the average Ofgem publishes. Regional pence rates match Ofgem's
       consumer tables and the cap tables PDF with 5% VAT on gas and no VAT
       on electricity. */
    rates: {
      directDebit: {
        gb: { electricityStandingPence: 54.77, electricityUnitPence: 32.69, gasStandingPence: 29.65, gasUnitPence: 10.96 },
        northWest: { electricityStandingPence: 45.62, electricityUnitPence: 32.85, gasStandingPence: 29.78, gasUnitPence: 10.85 },
        northEast: { electricityStandingPence: 61.51, electricityUnitPence: 31.69, gasStandingPence: 29.77, gasUnitPence: 10.92 },
        yorkshire: { electricityStandingPence: 61.59, electricityUnitPence: 32.11, gasStandingPence: 29.73, gasUnitPence: 10.89 },
        northernScotland: { electricityStandingPence: 55.07, electricityUnitPence: 32.40, gasStandingPence: 29.84, gasUnitPence: 10.86 },
        southern: { electricityStandingPence: 47.74, electricityUnitPence: 32.78, gasStandingPence: 29.10, gasUnitPence: 11.16 },
        southernScotland: { electricityStandingPence: 61.33, electricityUnitPence: 32.57, gasStandingPence: 29.86, gasUnitPence: 10.86 },
        merseysideNorthWales: { electricityStandingPence: 67.59, electricityUnitPence: 34.44, gasStandingPence: 30.06, gasUnitPence: 10.90 },
        london: { electricityStandingPence: 42.88, electricityUnitPence: 33.08, gasStandingPence: 30.19, gasUnitPence: 11.14 },
        southEast: { electricityStandingPence: 52.25, electricityUnitPence: 33.29, gasStandingPence: 29.21, gasUnitPence: 11.04 },
        eastern: { electricityStandingPence: 51.76, electricityUnitPence: 33.05, gasStandingPence: 29.28, gasUnitPence: 10.90 },
        eastMidlands: { electricityStandingPence: 51.38, electricityUnitPence: 31.65, gasStandingPence: 29.37, gasUnitPence: 10.81 },
        westMidlands: { electricityStandingPence: 57.16, electricityUnitPence: 32.00, gasStandingPence: 29.68, gasUnitPence: 10.89 },
        southWest: { electricityStandingPence: 55.51, electricityUnitPence: 32.86, gasStandingPence: 29.26, gasUnitPence: 11.11 },
        southWales: { electricityStandingPence: 55.35, electricityUnitPence: 32.92, gasStandingPence: 29.94, gasUnitPence: 11.08 }
      },
      standardCredit: {
        gb: { electricityStandingPence: 63.37, electricityUnitPence: 34.52, gasStandingPence: 37.38, gasUnitPence: 11.55 },
        northWest: { electricityStandingPence: 53.62, electricityUnitPence: 34.68, gasStandingPence: 37.38, gasUnitPence: 11.44 },
        northEast: { electricityStandingPence: 70.48, electricityUnitPence: 33.46, gasStandingPence: 37.38, gasUnitPence: 11.50 },
        yorkshire: { electricityStandingPence: 70.54, electricityUnitPence: 33.90, gasStandingPence: 37.38, gasUnitPence: 11.47 },
        northernScotland: { electricityStandingPence: 63.55, electricityUnitPence: 34.21, gasStandingPence: 37.38, gasUnitPence: 11.45 },
        southern: { electricityStandingPence: 56.30, electricityUnitPence: 34.61, gasStandingPence: 37.37, gasUnitPence: 11.76 },
        southernScotland: { electricityStandingPence: 70.06, electricityUnitPence: 34.39, gasStandingPence: 37.38, gasUnitPence: 11.45 },
        merseysideNorthWales: { electricityStandingPence: 76.60, electricityUnitPence: 36.36, gasStandingPence: 37.38, gasUnitPence: 11.48 },
        london: { electricityStandingPence: 50.40, electricityUnitPence: 34.92, gasStandingPence: 37.37, gasUnitPence: 11.74 },
        southEast: { electricityStandingPence: 61.07, electricityUnitPence: 35.15, gasStandingPence: 37.37, gasUnitPence: 11.63 },
        eastern: { electricityStandingPence: 60.50, electricityUnitPence: 34.90, gasStandingPence: 37.38, gasUnitPence: 11.49 },
        eastMidlands: { electricityStandingPence: 59.92, electricityUnitPence: 33.42, gasStandingPence: 37.38, gasUnitPence: 11.40 },
        westMidlands: { electricityStandingPence: 65.87, electricityUnitPence: 33.78, gasStandingPence: 37.38, gasUnitPence: 11.48 },
        southWest: { electricityStandingPence: 64.43, electricityUnitPence: 34.69, gasStandingPence: 37.37, gasUnitPence: 11.70 },
        southWales: { electricityStandingPence: 63.81, electricityUnitPence: 34.76, gasStandingPence: 37.37, gasUnitPence: 11.67 }
      },
      prepayment: {
        gb: { electricityStandingPence: 54.77, electricityUnitPence: 31.70, gasStandingPence: 29.65, gasUnitPence: 10.60 },
        northWest: { electricityStandingPence: 45.62, electricityUnitPence: 31.85, gasStandingPence: 29.78, gasUnitPence: 10.49 },
        northEast: { electricityStandingPence: 61.51, electricityUnitPence: 30.72, gasStandingPence: 29.77, gasUnitPence: 10.57 },
        yorkshire: { electricityStandingPence: 61.59, electricityUnitPence: 31.13, gasStandingPence: 29.73, gasUnitPence: 10.52 },
        northernScotland: { electricityStandingPence: 55.07, electricityUnitPence: 31.41, gasStandingPence: 29.84, gasUnitPence: 10.48 },
        southern: { electricityStandingPence: 47.74, electricityUnitPence: 31.78, gasStandingPence: 29.10, gasUnitPence: 10.84 },
        southernScotland: { electricityStandingPence: 61.33, electricityUnitPence: 31.58, gasStandingPence: 29.86, gasUnitPence: 10.48 },
        merseysideNorthWales: { electricityStandingPence: 67.59, electricityUnitPence: 33.39, gasStandingPence: 30.06, gasUnitPence: 10.53 },
        london: { electricityStandingPence: 42.88, electricityUnitPence: 32.07, gasStandingPence: 30.19, gasUnitPence: 10.80 },
        southEast: { electricityStandingPence: 52.25, electricityUnitPence: 32.28, gasStandingPence: 29.21, gasUnitPence: 10.69 },
        eastern: { electricityStandingPence: 51.76, electricityUnitPence: 32.05, gasStandingPence: 29.28, gasUnitPence: 10.58 },
        eastMidlands: { electricityStandingPence: 51.38, electricityUnitPence: 30.69, gasStandingPence: 29.37, gasUnitPence: 10.44 },
        westMidlands: { electricityStandingPence: 57.16, electricityUnitPence: 31.02, gasStandingPence: 29.68, gasUnitPence: 10.54 },
        southWest: { electricityStandingPence: 55.51, electricityUnitPence: 31.86, gasStandingPence: 29.26, gasUnitPence: 10.79 },
        southWales: { electricityStandingPence: 55.35, electricityUnitPence: 31.92, gasStandingPence: 29.94, gasUnitPence: 10.70 }
      }
    }
  }
};

  var api = { ENERGY_CAP_RATES: ENERGY_CAP_RATES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EnergyCapRates = api;
})(typeof window !== "undefined" ? window : this);
