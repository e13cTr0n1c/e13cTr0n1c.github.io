/* Can I get WaterSure? Pure logic, no DOM.
   Browser: window.WaterSure. Node: require.
   Checked 28 November 2026.

   Current tests, in force:
   The Water Industry (Charges) (Vulnerable Groups) (Consolidation) Regulations 2015,
   regulations 2, 3, 4 and 5.
   https://www.legislation.gov.uk/uksi/2015/365/regulation/2
   https://www.legislation.gov.uk/uksi/2015/365/regulation/3
   https://www.legislation.gov.uk/uksi/2015/365/regulation/4
   https://www.legislation.gov.uk/uksi/2015/365/regulation/5

   GOV.UK current eligibility, and the early 2027 reforms that are not in force:
   https://www.gov.uk/government/news/reduced-bills-for-around-300000-households-in-watersure-reform
   Published 6 March 2026.

   27 November 2026 data matching announcement. It does not change the tests:
   https://www.gov.uk/government/news/over-half-a-million-households-to-get-help-with-water-bills
   https://questions-statements.parliament.uk/written-statements/detail/2026-11-27/HCWS512

   CCW, what is WaterSure:
   https://www.ccw.org.uk/faq/what-is-watersure/

   Ofwat, Customer service and support, company performance summary 2025-26,
   section 9 WaterSure. Average saving around £413. Meter or waiting for one.
   Regulations do not apply to Dŵr Cymru or Hafren Dyfrdwy.
   https://www.ofwat.gov.uk/wp-content/uploads/2026/10/Customer-service-and-support-Company-performance-summary-2025-26.pdf

   I do not treat the 27 November 2026 figure of £428 as an average or as a
   fixed payment. That GOV.UK page does not use the word average for it.
   Ofwat uses average for the £413 saving in 2025-26.
   The 6 March 2026 GOV.UK page says the average reduction in 2024/25 was £325.
*/
(function (root) {
  "use strict";

  var RULES = {
    checked: "2026-11-28",
    childAgeUnder: 19,
    requireFullTimeEducation: false,
    poolLitres: 10000,
    entitlementMonths: 12,
    futureInForce: false,
    futureIncomeCapPounds: 25745,
    futureExtraHouseholds: 53000,
    dataMatchHouseholds: 250000,
    govNov2026PoundsOff: 428,
    govNov2026CallsItAverage: false,
    govNov2026IsFixedPayment: false,
    ofwat202526AverageSavingPounds: 413,
    gov202425AverageReductionPounds: 325,
    alreadySupportedNov2026: 300000,
    households202425: 260000,
    qualifyingBenefits: [
      "universal-credit",
      "pension-credit",
      "income-support",
      "income-based-jsa",
      "income-related-esa",
      "housing-benefit",
      "child-tax-credit",
      "working-tax-credit"
    ],
    ccwNamedBenefits: ["universal-credit", "housing-benefit", "pension-credit"],
    listedConditions: [
      "desquamation",
      "weeping-skin",
      "incontinence",
      "abdominal-stoma",
      "crohns",
      "ulcerative-colitis",
      "dialysis"
    ],
    notYetQualifying: ["disability-only"]
  };

  var DATA_MATCH = "On 27 November 2026 the government said water companies will use Department for Work and Pensions data to identify and contact households in England and Wales who may already qualify. That includes families with three or more children under 19, and people with a medical condition who need to use more water. If you are already on the scheme and nothing has changed, the written statement says you will be re-enrolled rather than having to reapply. This does not change the tests above, and it is not a new fixed payment.";

  var WALES_POINT = "Ofwat says the WaterSure regulations do not apply to companies whose areas are wholly or mainly in Wales (Dŵr Cymru and Hafren Dyfrdwy). Those companies offer WaterSure voluntarily. CCW says the two Welsh companies offer similar support through their own equivalent schemes. In Wales the regulations also say an application goes to the sewerage company where the water company's area is wholly or mainly in Wales.";

  var CAP_POINT = "The regulations cap the charges at the company's average household charges for water or sewerage for the period you are on the scheme. If the metered bill would have been lower, you pay that lower amount. You do not pay the average if your own bill would have been less.";

  var FIGURE_POINT = "GOV.UK said on 27 November 2026 that households could get £428 a year off their water bills. That page does not call £428 an average, and it is not a fixed payment I can work out for you. Ofwat says the average saving in 2025-26 was around £413. GOV.UK said on 6 March 2026 that the average reduction in 2024/25 was £325. Your saving is the gap between your metered bill and your company's average household bill.";

  var APPLY_POINT = "Apply to your water company. CCW says the same: if you qualify, contact your water company. The regulations say you have to apply and show your entitlement. In England that application goes to the water company. CCW's contact lines are 0300 034 2222 in England and 0300 034 3333 in Wales.";

  var RENEW_POINT = "The regulations say the help starts when you apply and ends 12 months later, or at the end of the billing period if the 12 months finish part way through one. The company has to remind you to renew. GOV.UK says applications should be made annually.";

  var HOME_POINT = "I have not asked whether this is your only or main home. The regulations require that, and they say another use of the premises must not be the main use. If that is not true, the company can refuse.";

  var MEDICAL_EVIDENCE_POINT = "For a condition on the list, the regulations say the company may refuse the application if you do not give information on the condition and on how it increases water use. GOV.UK's current eligibility says medical evidence must be provided. GOV.UK also said on 6 March 2026 that companies have agreed voluntarily that people will no longer need to pay for a doctor's note. That agreement is not the same as the early 2027 law, and I cannot see whether your company still asks for a note.";

  function inList(list, value) {
    return list.indexOf(value) !== -1;
  }

  function fail(error) {
    return { ok: false, error: error };
  }

  function pack(status, code, title, message, points) {
    return {
      ok: true,
      status: status,
      code: code,
      title: title,
      message: message,
      points: points,
      checked: RULES.checked
    };
  }

  function childrenState(input) {
    if (input.reason !== "children" && input.reason !== "both") return "na";
    if (input.childBenefit === "yes") return "pass";
    if (input.childBenefit === "no") return "fail";
    return "unknown";
  }

  function medicalState(input) {
    if (input.reason !== "medical" && input.reason !== "both") return "na";
    if (input.extraWater === "no") return "fail";
    if (input.medicalKind === "listed" && input.condition === "dialysis" && input.dialysisContribution === "yes") return "fail";
    if (input.extraWater !== "yes") return "unknown";
    if (input.medicalKind === "listed" && input.condition === "dialysis" && input.dialysisContribution !== "no") return "unknown";
    if (input.medicalKind === "listed") return "pass";
    return "unknown";
  }

function routeCode(input, childState, medState) {
  var childTried = childState !== "na";
  var medTried = medState !== "na";
  if (childTried && medTried) return "no-high-use";
  if (childState === "fail") return "no-child-benefit";
  if (medState === "fail" && input.extraWater === "no") return "no-extra-water";
  if (medState === "fail" && input.condition === "dialysis") return "dialysis-contribution";
  return "no-high-use";
}

  function notEligible(code, points) {
    var copy = {
      "no-meter": {
        title: "Not eligible on these answers",
        message: "GOV.UK's current eligibility says you need a water meter, to be waiting for one, or an assessed charge because a meter cannot be fitted. Ofwat says a meter, or waiting for one to be installed. The answer you gave is none of those."
      },
      "no-benefit": {
        title: "Not eligible on these answers",
        message: "Someone who lives in the home has to be entitled to a qualifying benefit or tax credit. The answer you gave is none of them."
      },
      "disability-not-in-force": {
        title: "Not eligible under the rules in force today",
        message: "Personal Independence Payment, Disability Living Allowance and Attendance Allowance are not in the list in the current regulations. GOV.UK said on 6 March 2026 that those benefits would be added, with a household income below £25,745, and that the person must still be a high water user for a medical reason. The same page says those reforms are set to come into force in early 2027. They are not in force on the date I checked, so I do not treat them as a pass."
      },
      "ctc-no-individual": {
        title: "Not eligible on these answers",
        message: "The regulations count Child Tax Credit only if it includes an amount for the individual element. A Child Tax Credit that does not include that element does not qualify. GOV.UK's shorter news list says Child Tax Credit and does not repeat this line. I follow the regulations."
      },
      "blocked-use": {
        title: "Not eligible on these answers",
        message: "The regulations say the water supplied to the home must not be used to water a garden, other than by hand, with any apparatus, or to automatically refill a pond or a swimming pool with a capacity greater than 10,000 litres. CCW says you cannot apply if the high use is from garden sprinklers or swimming pools."
      },
      "no-high-use": {
        title: "Not eligible on these answers",
        message: "WaterSure needs high essential use. That is either Child Benefit for three or more children under 19 who live in the home, or a medical condition that means someone who lives there has to use a significant extra amount of water. The answers you gave do not meet either test."
      },
      "no-child-benefit": {
        title: "Not eligible on these answers",
        message: "The regulations and CCW say the children route is Child Benefit for three or more children under 19 who live in the home. The person entitled to that Child Benefit has to be the person entitled to the qualifying benefit or tax credit. A no to that test does not pass. GOV.UK's 6 March 2026 summary only says three or more children under 19 living at home, and Ofwat's 2025-26 report says three or more children under 19 living at home in full-time education. I follow the regulations and CCW, so I do not call this a pass."
      },
      "no-extra-water": {
        title: "Not eligible on these answers",
        message: "A medical condition counts only if, because of that condition, someone who lives in the home has to use a significant extra amount of water. The answer you gave is no."
      },
      "dialysis-contribution": {
        title: "Not eligible on these answers",
        message: "Renal failure that needs dialysis at home does not count where a health authority contributes to the cost of the water used for dialysis in the billing period. CCW says the same where the local health authority contributes to the cost of the water used."
      }
    };
    var row = copy[code] || copy["no-high-use"];
    return pack("not-eligible", code, row.title, row.message, points);
  }

  function contextPoints(input, extra) {
    var points = extra.slice();
    if (input.nation === "england" || input.nation === "wales") points.push(DATA_MATCH);
    if (input.nation === "wales") points.push(WALES_POINT);
    return points;
  }

  function likelyPoints(input, childState, medState) {
    var points = [CAP_POINT, FIGURE_POINT, APPLY_POINT, RENEW_POINT, HOME_POINT];
    if (childState === "pass") {
      points.unshift("You said the person who gets the qualifying benefit or tax credit is also entitled to Child Benefit for three or more children under 19 who live in the home. That is the children test in the regulations. A child who is already 19 does not count. I do not add a separate full-time education test. Ofwat's 2025-26 report uses those words. The regulations do not.");
    }
    if (medState === "pass") {
      points.unshift("You said a listed condition means someone in the home has to use a significant extra amount of water. The listed conditions are desquamation, weeping skin disease, incontinence, an abdominal stoma, Crohn's disease, ulcerative colitis, and renal failure needing dialysis at home.");
      points.splice(1, 0, MEDICAL_EVIDENCE_POINT);
    }
    if (input.meter === "waiting") {
      points.push("You said the home is waiting for a meter. GOV.UK and Ofwat both include a household that is waiting for a meter. The regulations describe charges fixed by the volume of water. Ask the company to confirm that a meter which is not fitted yet still counts.");
    }
    if (input.benefit === "child-tax-credit") {
      points.push("You said the Child Tax Credit includes the individual element. That is the line in the regulations. The company can ask for the notice of entitlement, and for a tax credit that notice has to be dated no more than 6 months before the application.");
    }
    return points;
  }

  function openPoints(input, open) {
    var points = [];
    if (inList(open, "assessed")) {
      points.push("You said a meter cannot be fitted and the home pays an assessed charge. GOV.UK's current eligibility includes that. Ofwat's summary I checked does not. The regulations require charges fixed by volume, or charges that would be fixed by volume if you were not already getting this help. Ask the company whether your assessed charge counts.");
    }
    if (inList(open, "meter")) {
      points.push("I need a yes or no on the meter, the wait for a meter, or an assessed charge. Without that I cannot call the supply test met.");
    }
    if (inList(open, "benefit")) {
      points.push("I need to know which benefit or tax credit someone in the home gets. The qualifying list is Universal Credit, Pension Credit, Income Support, income-based Jobseeker's Allowance, income-related Employment and Support Allowance, Housing Benefit, Child Tax Credit if it includes the individual element, and Working Tax Credit.");
    }
    if (inList(open, "ctc")) {
      points.push("Child Tax Credit qualifies only when it includes the individual element. If you are not sure, the award notice is the document the company can ask for.");
    }
    if (inList(open, "blocked")) {
      points.push("The regulations block the scheme if the water is used to water a garden, other than by hand, with any apparatus, or to automatically refill a pond or a swimming pool bigger than 10,000 litres. If you are not sure, ask the company before you rely on a yes from me.");
    }
    if (inList(open, "children")) {
      points.push("The children route needs Child Benefit for three or more children under 19 who live in the home, paid to the same person who gets the qualifying benefit or tax credit. CCW says the same. If you are not sure about Child Benefit, I cannot call that route met.");
    }
    if (inList(open, "medical")) {
      points.push("A condition that is not on the list can still qualify if a doctor confirms it makes someone use a significant extra amount of water. The regulations let the company refuse that sort of application without a signed certificate from a registered medical practitioner. GOV.UK says companies have agreed voluntarily not to make you pay for a doctor's note. Ask your company what they still need. I cannot call this a pass from here.");
      points.push(MEDICAL_EVIDENCE_POINT);
    }
    return points;
  }

  function decide(input) {
    if (input.nation === "scotland" || input.nation === "northern-ireland") {
      return pack(
        "check",
        "outside",
        "This checker covers England and Wales",
        "The WaterSure regulations are marked as England and Wales. Ofwat regulates water companies in England and Wales, and CCW's WaterSure page is for customers in England and Wales. I have not used a page from Scottish Water or from a water company in Northern Ireland, so I cannot say what help is available in Scotland or Northern Ireland. This is not a finding that you get no help.",
        ["Use your own water company's affordability pages, or a benefits adviser, for Scotland or Northern Ireland. I do not describe a scheme I have not read."]
      );
    }

    var base = [];
    if (input.meter === "none") return notEligible("no-meter", contextPoints(input, base));
    if (input.benefit === "none") return notEligible("no-benefit", contextPoints(input, base));
    if (input.benefit === "disability-only") return notEligible("disability-not-in-force", contextPoints(input, base));
    if (input.benefit === "child-tax-credit" && input.ctcIndividual === "no") return notEligible("ctc-no-individual", contextPoints(input, base));
    if (input.blockedUse === "yes") return notEligible("blocked-use", contextPoints(input, base));

    var childState = "na";
    var medState = "na";
    if (input.reason === "unsure") {
      childState = "unknown";
      medState = "unknown";
    } else if (input.reason === "neither") {
      childState = "fail";
      medState = "fail";
    } else {
      childState = childrenState(input);
      medState = medicalState(input);
    }

    var passed = childState === "pass" || medState === "pass";
    var open = [];
    if (input.meter === "unsure") open.push("meter");
    if (input.meter === "assessed") open.push("assessed");
    if (input.benefit === "unsure") open.push("benefit");
    if (input.benefit === "child-tax-credit" && input.ctcIndividual === "unsure") open.push("ctc");
    if (input.blockedUse === "unsure") open.push("blocked");
    if (!passed && childState === "unknown") open.push("children");
    if (!passed && medState === "unknown") open.push("medical");

    if (!passed && open.length === 0) {
      return notEligible(routeCode(input, childState, medState), contextPoints(input, base));
    }

    if (passed && open.length === 0) {
      var likelyExtras = likelyPoints(input, childState, medState);
      if (input.nation === "wales") {
        return pack(
          "check",
          "wales-voluntary",
          "Check with your company in Wales",
          "These answers match the tests used in England. In Wales, Ofwat says the WaterSure regulations do not apply to Dŵr Cymru and Hafren Dyfrdwy, and those companies offer WaterSure voluntarily. CCW tells you to contact your company about WaterSure or the equivalent scheme. I cannot call a voluntary scheme a pass.",
          contextPoints(input, likelyExtras)
        );
      }
      return pack(
        "likely",
        "likely",
        "Likely to qualify",
        "On these answers the current England tests are met. Your water company still has to confirm them. WaterSure caps the bill at the company's average household bill. It is not a fixed payment.",
        contextPoints(input, likelyExtras)
      );
    }

    var code = open.length === 1 ? open[0] : "confirm";
    if (code === "medical") code = "medical-check";
    if (code === "children") code = "child-benefit-unsure";
    if (code === "blocked") code = "blocked-unsure";
    if (code === "meter") code = "meter-unsure";
    if (code === "benefit") code = "benefit-unsure";
    if (code === "ctc") code = "ctc-unsure";
    if (code === "assessed") code = "assessed-charge";

    var message = passed
      ? "Part of this matches the current tests, and part of it still needs the company. I am not calling it a pass while that is open."
      : "I cannot tell from these answers whether the current tests are met. The open points are below. Your water company decides the application.";
    if (input.nation === "wales") {
      message += " In Wales the scheme is voluntary for Dŵr Cymru and Hafren Dyfrdwy, so the company decides in any case.";
    }
    return pack("check", code, "You need to check", message, contextPoints(input, openPoints(input, open)));
  }

  function check(input) {
    input = input || {};
    var nations = ["england", "wales", "scotland", "northern-ireland"];
    var meters = ["meter", "waiting", "assessed", "none", "unsure"];
    var benefits = RULES.qualifyingBenefits.concat(["disability-only", "none", "unsure"]);
    var reasons = ["children", "medical", "both", "neither", "unsure"];
    var yesNo = ["yes", "no", "unsure"];
    var kinds = ["listed", "other", "unsure"];

    if (!inList(nations, input.nation)) return fail("Choose where the home is.");
    if (!inList(meters, input.meter)) return fail("Choose whether the home has a water meter.");
    if (!inList(benefits, input.benefit)) return fail("Choose the benefit or tax credit.");
    if (input.benefit === "child-tax-credit" && !inList(yesNo, input.ctcIndividual)) {
      return fail("Say whether the Child Tax Credit includes the individual element.");
    }
    if (!inList(reasons, input.reason)) {
      return fail("Choose children, a medical condition, both, or neither.");
    }
    var needsChildren = input.reason === "children" || input.reason === "both";
    var needsMedical = input.reason === "medical" || input.reason === "both";
    if (needsChildren && !inList(yesNo, input.childBenefit)) {
      return fail("Say whether that person is entitled to Child Benefit for three or more children under 19 who live in the home.");
    }
    if (needsMedical && !inList(kinds, input.medicalKind)) return fail("Choose the medical condition.");
    if (needsMedical && input.medicalKind === "listed" && !inList(RULES.listedConditions, input.condition)) {
      return fail("Choose the condition from the list in the regulations.");
    }
    if (needsMedical && input.medicalKind === "listed" && input.condition === "dialysis" && !inList(yesNo, input.dialysisContribution)) {
      return fail("Say whether a health authority pays towards the water used for home dialysis.");
    }
    if (needsMedical && !inList(yesNo, input.extraWater)) {
      return fail("Say whether the condition means someone has to use a significant extra amount of water.");
    }
    if (!inList(yesNo, input.blockedUse)) {
      return fail("Say whether the water is used for a garden sprinkler or to refill a pond or pool.");
    }
    return decide(input);
  }

  var api = {
    RULES: RULES,
    DATA_MATCH: DATA_MATCH,
    check: check
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.WaterSure = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
