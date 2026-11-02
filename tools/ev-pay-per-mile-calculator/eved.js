/* Electric Vehicle Excise Duty (eVED) pay per mile estimate, compared with petrol Fuel Duty.
   Pure logic, no DOM. Works in the browser (window.Eved) and in Node (require).
   Figures checked 28 October 2026 against the Budget 2026 documents on GOV.UK:
     eVED 3p and 1.5p a mile from 1 April 2028: Budget 2026: Overview of tax legislation and rates (OOTLAR), para 1.76
       https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar
     Fuel Duty 52.95p a litre until 30 June 2027, then 60.59p from 1 July 2027: OOTLAR para 2.18 and Annex A
       https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances */
(function (root) {
  "use strict";
  var RATES = {
    checked: "2026-10-28",
    status: "confirmed",           // confirmed at Budget 2026; eVED still needs Finance Bill 2026-27 to pass
    evedStart: "1 April 2028",
    // pence per mile
    eved: { bev: 3, hydrogen: 3, phev: 1.5 },
    // unleaded petrol Fuel Duty, pence per litre, in force today (Budget 2026 extends the 5p cut to 30 June 2027)
    fuelDutyPpl: 52.95,
    fuelDutyFromJuly2027Ppl: 60.59,
    fuelDutyNote: "52.95p a litre until 30 June 2027, then 60.59p from 1 July 2027 (Budget 2026)",
    defaultMpg: 45,
    litresPerUkGallon: 4.54609,
    sources: {
      eved: "https://www.gov.uk/government/publications/electric-vehicle-excise-duty-eved/electric-vehicle-excise-duty-eved",
      evedResponse: "https://www.gov.uk/government/consultations/consultation-on-the-introduction-of-electric-vehicle-excise-duty-eved/outcome/the-introduction-of-electric-vehicle-excise-duty-eved-consultation-response",
      fuelDuty: "https://www.gov.uk/government/publications/amended-fuel-duty-rates-for-2026-to-2027/amended-fuel-duty-rates-2026-to-2027",
      budget2026: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar",
      budget2026Rates: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances"
    }
  };
  var PERIODS = { year: 1, month: 12, week: 52 };
  function round2(n) { return Math.round(n * 100) / 100; }
  function annualMiles(miles, period) {
    var m = Number(miles), f = PERIODS[period];
    if (!f || !isFinite(m) || m < 0) return NaN;
    return m * f;
  }
  function calculate(input) {
    var miles = annualMiles(input.miles, input.period || "year");
    if (isNaN(miles)) return { error: "Enter how many miles you drive." };
    var rate = RATES.eved[input.type];
    if (rate === undefined) return { error: "Choose the type of car." };
    var mpg = Number(input.mpg === undefined || input.mpg === "" ? RATES.defaultMpg : input.mpg);
    if (!isFinite(mpg) || mpg <= 0) return { error: "Enter a petrol mpg above 0." };
    var duty = input.dutyPpl === undefined ? RATES.fuelDutyPpl : Number(input.dutyPpl);
    var evedYear = miles * rate / 100;
    var litres = miles / mpg * RATES.litresPerUkGallon;
    var petrolYear = litres * duty / 100;
    var petrolPpm = RATES.litresPerUkGallon * duty / mpg;
    return {
      annualMiles: miles, ratePpm: rate,
      evedYear: round2(evedYear), evedMonth: round2(evedYear / 12),
      litres: round2(litres), petrolPpm: Math.round(petrolPpm * 100) / 100,
      petrolYear: round2(petrolYear), petrolMonth: round2(petrolYear / 12),
      difference: round2(petrolYear - evedYear)
    };
  }
  var api = { RATES: RATES, annualMiles: annualMiles, calculate: calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Eved = api;
})(this);
