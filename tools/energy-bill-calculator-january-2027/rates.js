/* Energy price cap rates for the January 2027 bill calculator.
   This is the only file to edit when Ofgem publishes the January cap.

   On 25 November 2026, edit the object ENERGY_CAP_RATES.next in this file:
     1. Set status to "official".
     2. Fill rates in the same shape as current.rates (pence per day and
        pence per kWh, for each payment method and region, including gb).
        Use the VAT treatment Ofgem publishes. Gas currently includes VAT
        at 5%. Electricity has no VAT from 1 October 2026 to 31 March 2027.
     3. Leave forecast in place as a record. The calculator ignores it
        once status is "official" and rates is filled in.
   The page banner reads next.status and switches from FORECAST to official.

   Last checked 24 November 2026.
*/
(function (root) {
  "use strict";

  var ENERGY_CAP_RATES = {
  lastChecked: "2026-11-24",
  daysInYear: 365,
  vat: {
    electricityPercent: 0,
    gasPercent: 5,
    electricityVatUntil: "2027-03-31",
    note: "Gas rates include VAT at 5%. Electricity has no VAT from 1 October 2026 to 31 March 2027. The pence rates below already include that VAT treatment, so the calculator does not add VAT on top."
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

  /* January to March 2027. status is "forecast" until Ofgem's figures are pasted in. */
  next: {
    status: "forecast",
    label: "1 January to 31 March 2027",
    period: { from: "2027-01-01", to: "2027-03-31" },
    announcementDate: "2026-11-25",
    announcementSourceUrl: "https://www.ofgem.gov.uk/news/changes-energy-price-cap-between-1-october-and-31-december-2026",
    /* Paste official rates here on 25 November 2026. null means "use the forecast scale". */
    rates: null,
    forecast: {
      published: "2026-11-18",
      sourceName: "Cornwall Insight",
      sourceTitle: "Cornwall Insight, Energy bills set for steep rise in January, 18 November 2026",
      sourceUrl: "https://www.cornwall-insight.com/press-releases/energy-bills-set-for-steep-rise-in-january/",
      confirmSourceTitle: "Selectra, Energy bills are forecast to jump in January, 18 November 2026",
      confirmSourceUrl: "https://selectra.co.uk/energy/news/energy-price-cap-january-2027-cornwall-forecast",
      /* Headline figures as published. 443 / 1723 is 25.7%, which they call 26%. */
      reportedRisePercent: 26,
      currentHeadlinePounds: 1723,
      typicalDualFuelDirectDebitPounds: 2166,
      increaseOnHeadlinePounds: 443,
      tableTotalPounds: 2165.89,
      /* Standing charges in the press table are rounded to the nearest penny.
         The yearly fuel costs imply 55.78p and 31.04p a day. The calculator
         uses those implied daily rates so the typical Direct Debit bill
         matches the £1,017.09 and £1,148.80 in the table. */
      basis: {
        payment: "directDebit",
        region: "gb",
        electricityKwh: 2500,
        gasKwh: 9500,
        electricity: { unitPence: 32.54, annualPounds: 1017.09, standingPoundsPerDayDisplayed: 0.56 },
        gas: { unitPence: 10.90, annualPounds: 1148.80, standingPoundsPerDayDisplayed: 0.31 }
      },
      method: "Scale each current unit rate and standing charge by the ratio of Cornwall Insight's Great Britain average Direct Debit forecast to Ofgem's current Great Britain average Direct Debit rate. Electricity and gas are scaled separately, and the unit rate is scaled separately from the standing charge. The same scales are applied to every region and payment method, because the forecast was published only for the Direct Debit average. Standing charges use the daily rate implied by the published yearly fuel cost."
    }
  }
};

  var api = { ENERGY_CAP_RATES: ENERGY_CAP_RATES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EnergyCapRates = api;
})(typeof window !== "undefined" ? window : this);
