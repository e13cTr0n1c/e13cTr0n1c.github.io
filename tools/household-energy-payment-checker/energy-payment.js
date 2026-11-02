/* Household Energy Payment checker (Budget 2026). Pure logic, no DOM.
   Works in the browser (window.EnergyPayment) and in Node (require). Checked 28 October 2026. */
(function (root) {
  "use strict";
  var RULES = {
    amount: 100,
    from: "January 2027",
    nation: "england",
    bands: ["A", "B", "C", "D"],
    sources: {
      budget: "https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html",
      bands: "https://www.gov.uk/council-tax-bands"
    }
  };
  var NATIONS = { england: "England", scotland: "Scotland", wales: "Wales", ni: "Northern Ireland" };
  var BANDS = { england: "ABCDEFGH", scotland: "ABCDEFGH", wales: "ABCDEFGHI", ni: "" };
  function check(input) {
    var nation = input.nation, band = String(input.band || "").toUpperCase();
    if (!NATIONS[nation]) return { error: "Choose where you live." };
    if (nation === "ni") return { status: "devolved", nation: NATIONS[nation], reason: "Northern Ireland has domestic rates, not council tax bands. The Budget says the devolved governments get their share of the funding through the Barnett formula, and it is for them to decide any similar support." };
    if (BANDS[nation].indexOf(band) === -1 || band === "") return { error: "Choose your council tax band." };
    if (nation !== RULES.nation) return { status: "devolved", nation: NATIONS[nation], band: band, reason: "The £100 payment announced in the Budget is for households in England. The " + (nation === "wales" ? "Welsh" : "Scottish") + " Government gets its share of the funding through the Barnett formula and decides whether to offer similar support. Nothing has been confirmed for " + NATIONS[nation] + " yet." };
    if (RULES.bands.indexOf(band) !== -1) return { status: "yes", nation: NATIONS[nation], band: band, amount: RULES.amount, reason: "Households in England in council tax bands A to D are due a one off £" + RULES.amount + " Household Energy Payment from " + RULES.from + ", paid through the council tax system." };
    return { status: "no", nation: NATIONS[nation], band: band, reason: "Band " + band + " is above band D, so the £100 payment does not apply. The Budget gives councils in England £100 million for extra targeted help, including for some homes above band D, so ask your council if energy bills are a struggle." };
  }
  var api = { RULES: RULES, NATIONS: NATIONS, BANDS: BANDS, check: check };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.EnergyPayment = api;
})(this);
