/* Do I pay tax selling my own used things?
   Pure logic, no DOM. Browser: window.Selling. Node: require.
   Checked 27 November 2026.

   Personal possessions, the £6,000 line, cars and limited lifespan:
   https://www.gov.uk/capital-gains-tax-personal-possessions
   Gains, the 5/3 cap, sets, wasting assets and business use (HS293, 2025 to 2026):
   https://www.gov.uk/government/publications/chattels-and-capital-gains-tax-hs293-self-assessment-helpsheet/personal-possessions-and-capital-gains-tax-2026-hs293
   Annual exempt amount £3,000 for 2026 to 2027:
   https://www.gov.uk/guidance/capital-gains-tax-rates-and-allowances
   When a gain is above that allowance:
   https://www.gov.uk/capital-gains-tax/work-out-need-to-pay
   Rates 18% and 24% from 6 April 2026:
   https://www.gov.uk/capital-gains-tax/rates
   Selling personal possessions online, and buying or making goods to sell:
   https://www.gov.uk/guidance/check-if-you-need-to-tell-hmrc-about-your-income-from-online-platforms
   Trading allowance £1,000, and the cases where it does not apply:
   https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income
   Rise to £3,000 from 6 April 2027:
   https://www.gov.uk/government/publications/income-tax-increasing-the-trading-allowance/increasing-the-trading-allowance
   https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar
   Platform reports are not a tax. Fewer than 30 sales and under 2,000 euros:
   https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform
   Operator wording, 2,000 euros or less for fewer than 30 sales of goods:
   https://www.gov.uk/guidance/check-if-you-need-to-register-as-a-digital-platform-operator
   Badges of trade, weighed together:
   https://www.gov.uk/hmrc-internal-manuals/business-income-manual/bim20205

   I follow HS293 where it is more precise than the short personal possessions page.
   A sale that did not exceed £6,000 is not a gain I calculate.
   The 5/3 cap applies when proceeds exceeded £6,000 but were not more than £15,000.
*/
(function (root) {
  "use strict";

  var RULES = {
    checked: "2026-11-27",
    checkedLabel: "27 November 2026",
    chattelLimitPence: 600000,
    marginalCeilingPence: 1500000,
    annualExemptPence: 300000,
    annualExemptYear: "2026 to 2027",
    tradingAllowancePence: 100000,
    tradingAllowanceUntil: "5 April 2027",
    tradingAllowanceNextPence: 300000,
    tradingAllowanceNextFrom: "6 April 2027",
    platformSales: 30,
    platformEuros: 2000,
    platformPoundsAbout: 1700,
    cgtBasicPercent: 18,
    cgtHigherPercent: 24,
    cgtRatesFrom: "6 April 2026"
  };

  var SOURCES = {
    possessions: "https://www.gov.uk/capital-gains-tax-personal-possessions",
    hs293: "https://www.gov.uk/government/publications/chattels-and-capital-gains-tax-hs293-self-assessment-helpsheet/personal-possessions-and-capital-gains-tax-2026-hs293",
    exempt: "https://www.gov.uk/guidance/capital-gains-tax-rates-and-allowances",
    pay: "https://www.gov.uk/capital-gains-tax/work-out-need-to-pay",
    rates: "https://www.gov.uk/capital-gains-tax/rates",
    platformsIncome: "https://www.gov.uk/guidance/check-if-you-need-to-tell-hmrc-about-your-income-from-online-platforms",
    allowance: "https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income",
    allowanceRise: "https://www.gov.uk/government/publications/income-tax-increasing-the-trading-allowance/increasing-the-trading-allowance",
    ootlar: "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar",
    platforms: "https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform",
    operators: "https://www.gov.uk/guidance/check-if-you-need-to-register-as-a-digital-platform-operator",
    badges: "https://www.gov.uk/hmrc-internal-manuals/business-income-manual/bim20205",
    sideHustleChecker: "../side-hustle-trading-allowance-checker/",
    sideHustleTax: "../side-hustle-tax-calculator/"
  };

  function moneyToPence(value) {
    if (value === "" || value === null || value === undefined) return null;
    var s = String(value).trim().replace(/£/g, "").replace(/,/g, "");
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return NaN;
    var parts = s.split(".");
    var frac = parts[1] ? parts[1] : "";
    while (frac.length < 2) frac += "0";
    return Number(parts[0]) * 100 + Number(frac);
  }

  function formatPounds(pence) {
    var n = Math.abs(Math.round(Number(pence)));
    var pounds = Math.floor(n / 100);
    var frac = n % 100;
    var s = String(pounds);
    var out = "";
    while (s.length > 3) {
      out = "," + s.slice(-3) + out;
      s = s.slice(0, -3);
    }
    if (frac === 0) return "£" + s + out;
    return "£" + s + out + "." + (frac < 10 ? "0" : "") + frac;
  }

  /* Nearest penny, half up. Excess of 1p is 2p. £1,500 over the line is £2,500. */
  function fiveThirds(pence) {
    var num = pence * 5;
    var q = Math.floor(num / 3);
    if (num % 3 >= 2) q += 1;
    return q;
  }

  function marginalCapPence(salePence) {
    if (salePence <= RULES.chattelLimitPence) return 0;
    if (salePence > RULES.marginalCeilingPence) return null;
    return fiveThirds(salePence-RULES.chattelLimitPence);
  }

  function platformParagraph() {
    return "A report from Vinted, eBay or another platform is not a tax. From 1 January 2024 a UK platform does not report a seller of goods who, in the same calendar year, makes fewer than 30 sales and receives less than 2,000 euros (about £1,700) for those sales. The page for platform operators describes that exception as 2,000 euros or less for fewer than 30 sales of goods. It does not cover services, renting transport, or renting property. GOV.UK says the report does not mean you owe tax.";
  }

  function estimateLine() {
    return "This is an estimate and general guidance, not tax advice. I do not know your other income, your other sales, or what HMRC would decide.";
  }

  function tradingResult(activity) {
    var how = activity === "make"
      ? "You said you make items to sell."
      : "You said you buy things to resell.";
    return {
      ok: true,
      outcome: "trading",
      tone: "attention",
      activity: activity,
      headline: "This looks like trading",
      paragraphs: [
        how + " GOV.UK says you are probably trading if you bought goods intending to sell them for a profit, or you made them, including as a hobby. Profit from that is Income Tax, not Capital Gains Tax on a personal possession.",
        "The trading allowance is £1,000 of gross trading and miscellaneous income for a tax year up to 5 April 2027. From 6 April 2027 it rises to £3,000. The Self Assessment reporting threshold for trading income rises to £3,000 at the same time. If your total for the year is within the allowance, you may not need to pay tax or tell HMRC. Casual services and online content count towards the same allowance. Some income still has to be reported, including income from a partnership or from your employer, or the employer of your spouse or civil partner.",
        "HMRC weighs the badges of trade together. One answer is not conclusive. GOV.UK lists a profit seeking motive, how many times you sell and how often, the kind of item, similar trading you already do, changes you made so it would sell, the way the sale was carried out, whether you borrowed to buy it, how soon you sold it, and whether you bought it or were given it.",
        platformParagraph(),
        estimateLine()
      ],
      tradingAllowancePence: RULES.tradingAllowancePence,
      tradingAllowanceNextPence: RULES.tradingAllowanceNextPence,
      showSideHustleLinks: true
    };
  }

  function finish(outcome, tone, headline, paragraphs, extra) {
    var result = {
      ok: true,
      outcome: outcome,
      tone: tone,
      headline: headline,
      paragraphs: paragraphs.concat([platformParagraph(), estimateLine()]),
      showSideHustleLinks: false,
      tradingAllowancePence: RULES.tradingAllowancePence,
      tradingAllowanceNextPence: RULES.tradingAllowanceNextPence
    };
    if (extra) {
      for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) result[k] = extra[k];
    }
    return result;
  }

  function check(input) {
    input = input || {};
    var activity = input.activity;
    if (activity !== "own" && activity !== "resell" && activity !== "make") {
      return { ok: false, error: "Say whether you are selling your own used things, buying to resell, or making items to sell." };
    }
    if (activity === "resell" || activity === "make") {
      if (input.sale !== "" && input.sale !== null && input.sale !== undefined) {
        var traded = moneyToPence(input.sale);
        if (isNaN(traded)) return { ok: false, error: "Enter the sale price in pounds and pence." };
      }
      return tradingResult(activity);
    }

    var sale = moneyToPence(input.sale);
    if (sale === null) return { ok: false, error: "Enter the sale price of the item, or of the set if you sold the pieces together." };
    if (isNaN(sale)) return { ok: false, error: "Enter the sale price in pounds and pence." };

    var sold = input.soldForLess;
    if (sold !== "yes" && sold !== "no" && sold !== "unknown") {
      return { ok: false, error: "Say whether you sold it for less than you paid." };
    }

    var asset = input.asset;
    if (asset !== "neither" && asset !== "car" && asset !== "wasting") {
      return { ok: false, error: "Say whether this is a car, another wasting asset, or neither." };
    }

    var business = input.businessUse;
    if (asset === "car" || asset === "wasting") {
      if (business !== "yes" && business !== "no") {
        return { ok: false, error: "Say whether you used it in a business, trade, profession or vocation." };
      }
    }

    var priceLine = "You put the sale price at " + formatPounds(sale) + ". A set of items that belong together, such as matching vases or chess pieces, uses one £6,000 limit for the whole set.";
    var gift = sale === 0
      ? "A gift, or a sale to a connected person such as a relative, can use market value instead of the price you typed. I have used the figure you entered."
      : "";

    if (asset === "car" && business === "no") {
      var carParas = [
        "You do not pay Capital Gains Tax on your car, unless you have used it for business. You said this is your car and you have not used it for a business. The sale price does not change that exemption.",
        priceLine
      ];
      if (gift) carParas.push(gift);
      return finish("car-exempt", "clear", "No Capital Gains Tax on this car", carParas, {
        salePence: sale,
        exempt: true
      });
    }

    if (asset === "car" && business === "yes") {
      return finish("car-business", "attention", "The car exemption may not apply", [
        "GOV.UK says you do not pay Capital Gains Tax on your car unless you have used it for business. You said you have used this car for business, so I cannot treat it as exempt.",
        "A gain on a possession used in a business can be chargeable, and capital allowances change the figure. HS293 says a wasting asset used in a business is not exempt when capital allowances were, or could have been, claimed. I do not know that about this car.",
        priceLine
      ], { salePence: sale, exempt: false });
    }

    if (asset === "wasting" && business === "no") {
      var wasteParas = [
        "A wasting asset has a predictable life of 50 years or less. Plant and machinery are always treated as wasting assets. Clocks are the example on the personal possessions page, and most electronics and machinery are in this group.",
        "A gain or a loss on a personal possession that is a wasting asset is exempt from Capital Gains Tax, unless you have used it in a business and capital allowances were, or could have been, claimed. You said you have not used it in a business, so this sale is exempt. The £6,000 line does not decide it.",
        priceLine
      ];
      if (gift) wasteParas.push(gift);
      return finish("wasting-exempt", "clear", "This wasting asset is exempt", wasteParas, {
        salePence: sale,
        exempt: true
      });
    }

    if (asset === "wasting" && business === "yes") {
      return finish("wasting-business", "attention", "The wasting asset exemption may not apply", [
        "You said this is a wasting asset and you used it in a business, trade, profession or vocation. The exemption does not apply if you have claimed capital allowances for it, or you could have claimed them. Any gain then goes on your tax return, after you take those allowances into account.",
        "There is a separate case on HS293. If you loaned a possession with a predictable life of more than 50 years, such as jewellery, a work of art or an antique, to a business which used it as plant, a gain on that possession is not exempt either.",
        priceLine
      ], { salePence: sale, exempt: false });
    }

    if (sold === "yes") {
      var restricted = sale < RULES.chattelLimitPence;
      var lossParas = [
        "You sold it for less than you paid, so there is no gain. There is no Capital Gains Tax on this sale.",
        priceLine
      ];
      if (restricted) {
        lossParas.push("If you want to claim the loss, GOV.UK restricts it when the proceeds were less than £6,000. You recalculate the loss as if you had sold the possession for £6,000. You cannot claim a loss on a private car or, in most cases, on a wasting asset. There are different rules for reporting a loss, and you do not have to claim it.");
      } else {
        lossParas.push("The proceeds were £6,000 or more, so GOV.UK does not restrict a loss on a personal possession in that way. You cannot claim a loss on a private car or, in most cases, on a wasting asset. There are different rules for reporting a loss, and you do not have to claim it.");
      }
      if (gift) lossParas.push(gift);
      return finish("no-gain", "clear", "No gain, so no Capital Gains Tax", lossParas, {
        salePence: sale,
        lossRestricted: restricted,
        exempt: false
      });
    }

    if (sale <= RULES.chattelLimitPence) {
      var underParas = [
        "The disposal proceeds did not exceed £6,000. You do not need to calculate a gain on this personal possession, and HS293 says you only include a gain in your tax return where the proceeds were more than £6,000.",
        "GOV.UK's own example is clearing out unwanted things. If no item is worth more than £6,000, it is unlikely you need to tell HMRC or pay any tax, however many items you sell.",
        priceLine
      ];
      if (sold === "unknown") {
        underParas.push("You do not know what you paid. That does not change this result. Proceeds of £6,000 or less are outside the calculation even if you sold for more than you paid.");
      } else {
        underParas.push("You said you did not sell for less than you paid. A profit on a single personal possession is still outside Capital Gains Tax when the proceeds did not exceed £6,000.");
      }
      if (gift) underParas.push(gift);
      return finish("under-limit", "clear", "No Capital Gains Tax and nothing to report for this item", underParas, {
        salePence: sale,
        exempt: false,
        overChattelLimit: false
      });
    }

    var cap = marginalCapPence(sale);
    var marginal = cap !== null;
    var overParas = [
      "The proceeds are over £6,000, so Capital Gains Tax may be due if you made a gain. You only pay it if your overall gains for the tax year, after losses and reliefs, are above the annual exempt amount. For 2026 to 2027 that amount is £3,000 for an individual.",
      priceLine
    ];
    if (sold === "unknown") {
      overParas.push("You do not know what you paid. If you sold for the same or less than you paid, there is no gain. If you sold for more, there may be a gain. Costs of selling come off the price before you work the gain out.");
    } else {
      overParas.push("You said you did not sell for less than you paid. If the price was higher than you paid, there is a gain. If it was the same, there is no gain once you take off any costs of selling. I do not know the amount you paid, so I have not worked out the actual gain.");
    }
    var above = null;
    if (marginal) {
      above = cap > RULES.annualExemptPence;
      overParas.push(
        "GOV.UK caps the chargeable gain when the proceeds exceeded £6,000 but were not more than £15,000. Take the amount over £6,000 and multiply by 5/3. That maximum is " +
        formatPounds(cap) + " on this sale. You use the lower of that figure and your actual gain."
      );
      if (!above) {
        overParas.push("That maximum is not above the £3,000 annual exempt amount. This sale on its own does not give a taxable gain above the allowance. Other gains in the same tax year still count, and I have not seen them.");
      } else {
        overParas.push("That maximum is above £3,000. Tax may be due if your actual gain, together with your other gains and losses for the year, ends up above £3,000. The chargeable gain is the lower of your actual gain and " + formatPounds(cap) + ". From 6 April 2026 an individual pays 18% or 24% on gains above the allowance, depending on their taxable income. I have not worked out a tax bill.");
      }
    } else {
      overParas.push("The proceeds are more than £15,000. HS293 says you then work out the actual gain in the normal way. The 5/3 cap is for proceeds that were not more than £15,000. I do not know what you paid, so I cannot say whether the gain is above £3,000.");
    }
    overParas.push("If you already send a Self Assessment return, GOV.UK says you report gains when the total amount you sold chargeable assets for in the tax year was more than £50,000, for 2023 to 2024 onwards, even if the gains are under the allowance. Possessions sold for £6,000 or less are not part of that gain calculation. I can only see this one sale.");
    if (gift) overParas.push(gift);

    return finish("over-limit", "attention", "Capital Gains Tax may be due on the gain", overParas, {
      salePence: sale,
      overChattelLimit: true,
      marginalRelief: marginal,
      maxChargeableGainPence: cap,
      aboveExempt: above,
      annualExemptPence: RULES.annualExemptPence,
      exempt: false
    });
  }

  var api = {
    RULES: RULES,
    SOURCES: SOURCES,
    moneyToPence: moneyToPence,
    formatPounds: formatPounds,
    fiveThirds: fiveThirds,
    marginalCapPence: marginalCapPence,
    platformParagraph: platformParagraph,
    check: check
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Selling = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
