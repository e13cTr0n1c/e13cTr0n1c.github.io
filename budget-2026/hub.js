/* Budget day 2026 hub config for Plain Sums.
 *
 * Edit BUDGET_DAY_2026 below on Budget day. The page reads tools, announced items
 * and the last updated line from this one object.
 *
 * Budget date: 28 October 2026. Estimates, not advice.
 */
(function (root) {
  "use strict";

  var BUDGET_DAY_2026 = {
    budgetDate: "28 October 2026",
    lastUpdated: "28 October 2026",
    checked: "2026-10-28",
    status: "announced", // Budget documents published on GOV.UK on 28 October 2026
    title: "UK Budget 2026 hub",
    lede: "Plain Sums tools that help you make sense of the 28 October 2026 Budget. Every figure is an estimate, not tax, legal or financial advice.",
    sources: [
      {
        "label": "Budget 2026 (HTML), HM Treasury, GOV.UK",
        "href": "https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html"
      },
      {
        "label": "Budget 2026: Overview of tax legislation and rates (OOTLAR), GOV.UK",
        "href": "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar"
      },
      {
        "label": "Budget 2026 OOTLAR, Annex A: rates and allowances, GOV.UK",
        "href": "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances"
      },
      {
        "label": "HM Treasury: Pension Tax Allowance explainer, GOV.UK",
        "href": "https://www.gov.uk/government/publications/pension-tax-allowance-explainer/pension-tax-allowance-explainer"
      },
      {
        "label": "ONS consumer price inflation, September 2026",
        "href": "https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/september2026"
      },
      {
        "label": "ONS average weekly earnings, September 2026",
        "href": "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/averageweeklyearningsingreatbritain/september2026"
      }
    ],
    announcedSoFar: [
      {
        "id": "tax-ni",
        "title": "Income Tax and National Insurance on pay",
        "status": "confirmed",
        "placeholder": false,
        "body": "No change to the headline rates of Income Tax, National Insurance or VAT. For 2027/28 the Personal Allowance stays at £12,570, the basic rate band at £37,700 and the higher rate threshold at £50,270, and employee National Insurance stays at 8% and 2%. So take home pay from a job does not change because of the Budget.",
        "source": {
          "label": "Budget 2026 OOTLAR, Annex A: rates and allowances, GOV.UK",
          "href": "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances"
        }
      },
      {
        "id": "savings-property",
        "title": "Tax on savings and property income",
        "status": "confirmed",
        "placeholder": false,
        "body": "From 6 April 2027 savings income is taxed at 24%, 44% and 49% instead of 20%, 40% and 45%. Property income gets its own rates at the same 24%, 44% and 49%. Dividend rates stay at 10.75%, 35.75% and 39.35%.",
        "source": {
          "label": "Budget 2026 OOTLAR, Annex A: rates and allowances, GOV.UK",
          "href": "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances"
        }
      },
      {
        "id": "state-pension",
        "title": "Full new State Pension from April 2027",
        "status": "confirmed",
        "placeholder": false,
        "body": "The full new State Pension goes up 3.9% under the triple lock to £250.70 a week, £13,036.40 a year, from 6 April 2027. The Budget keeps the triple lock through to April 2029.",
        "source": {
          "label": "HM Treasury: Pension Tax Allowance explainer, GOV.UK",
          "href": "https://www.gov.uk/government/publications/pension-tax-allowance-explainer/pension-tax-allowance-explainer"
        }
      },
      {
        "id": "min-wage",
        "title": "National Living Wage and minimum wage from 1 April 2027",
        "status": "confirmed",
        "placeholder": false,
        "body": "National Living Wage (21 and over) £13.21 an hour, up 3.9%. 18 to 20 rate £11.27. 16 and 17 year olds and apprentices £8.31. Accommodation offset £11.53 a day.",
        "source": {
          "label": "Budget 2026 (HTML), GOV.UK",
          "href": "https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html"
        }
      },
      {
        "id": "mileage",
        "title": "Mileage rates",
        "status": "confirmed",
        "placeholder": false,
        "body": "The 55p a mile rate for the first 10,000 business miles is made permanent, and the rate above 10,000 miles goes up from 25p to 35p from 6 April 2027.",
        "source": {
          "label": "Budget 2026: Overview of tax legislation and rates (OOTLAR), GOV.UK",
          "href": "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar"
        }
      },
      {
        "id": "eved",
        "title": "Electric Vehicle Excise Duty (pay per mile)",
        "status": "confirmed",
        "placeholder": false,
        "body": "From 1 April 2028, 3p a mile for fully electric and hydrogen cars and 1.5p a mile for plug in hybrids, going up with CPI from 2029/30. It still needs Finance Bill 2026 to 27 to pass.",
        "source": {
          "label": "Budget 2026: Overview of tax legislation and rates (OOTLAR), GOV.UK",
          "href": "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/budget-2026-overview-of-tax-legislation-and-rates-ootlar"
        }
      },
      {
        "id": "fuel-duty",
        "title": "Fuel Duty",
        "status": "confirmed",
        "placeholder": false,
        "body": "The 5p a litre cut is extended to 30 June 2027, so petrol and diesel stay at 52.95p a litre until then. From 1 July 2027 the rate goes to 60.59p a litre.",
        "source": {
          "label": "Budget 2026 OOTLAR, Annex A: rates and allowances, GOV.UK",
          "href": "https://www.gov.uk/government/publications/budget-2026-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances"
        }
      },
      {
        "id": "student-loans",
        "title": "Student loan interest",
        "status": "confirmed",
        "placeholder": false,
        "body": "Interest on Plan 2 and Plan 3 student loans is capped at 6% from 1 September 2026 to 31 August 2027.",
        "source": {
          "label": "Budget 2026 (HTML), GOV.UK",
          "href": "https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html"
        }
      },
      {
        "id": "cpi",
        "title": "September 2026 CPI",
        "status": "published",
        "placeholder": false,
        "body": "CPI was 3.5% in the 12 months to September 2026 (ONS). That figure is the usual basis for uprating most benefits in April 2027."
      },
      {
        "id": "benefits",
        "title": "Other benefits from April 2027 (PIP, DLA, Attendance Allowance, Carer's Allowance, basic State Pension)",
        "status": "awaiting",
        "placeholder": true,
        "body": "Awaiting the DWP benefit and pension rates 2027 to 2028, which were not on GOV.UK when I checked. The checker shows these as expected figures based on 3.5% CPI, not confirmed."
      },
      {
        "id": "uc",
        "title": "Universal Credit standard allowance",
        "status": "awaiting",
        "placeholder": true,
        "body": "I could not find the 2027/28 standard allowance in the Budget documents. It stays as a placeholder until DWP publishes the 2027 to 2028 rates."
      },
      {
        "id": "scotland",
        "title": "Scottish Income Tax",
        "status": "awaiting",
        "placeholder": true,
        "body": "Scottish rates and bands are set by the Scottish Government in the Scottish Budget, not by this Budget. The tools keep the 2026/27 Scottish bands until then."
      }
    ],
    tools: [
      {
        id: "budget-pay",
        name: "Budget 2026 pay calculator",
        href: "../tools/budget-2026-pay-calculator/",
        blurb: "Check your take home pay before and after the Budget. For pay from a job the Budget makes no change in 2027/28.",
        live: true
      },
      {
        id: "state-pension",
        name: "April 2027 State Pension and benefits checker",
        href: "../tools/state-pension-benefits-increase-april-2027/",
        blurb: "See the confirmed full new State Pension from April 2027 and estimate how much PIP, DLA, Attendance Allowance or Carer's Allowance goes up.",
        live: true
      },
      {
        id: "ev",
        name: "EV pay per mile calculator",
        href: "../tools/ev-pay-per-mile-calculator/",
        blurb: "Estimate the 3p and 1.5p a mile charge from April 2028, confirmed at Budget 2026, and compare it with petrol Fuel Duty.",
        live: true
      },
      {
        id: "min-wage",
        name: "Minimum wage rise calculator",
        href: "../tools/minimum-wage-rise-calculator/",
        blurb: "See what the confirmed April 2027 rises to £13.21 and £11.27 an hour are worth before and after tax.",
        live: true
      },
      {
        id: "live-on-wage",
        name: "Can I live on this wage?",
        href: "../tools/can-i-live-on-this-wage/",
        blurb: "Turn an hourly rate into take home pay, then check it against rent, bills and food for a monthly surplus or shortfall.",
        live: true
      },
      {
        id: "pay-cpi",
        name: "Pay rise vs inflation",
        href: "../tools/pay-rise-vs-inflation-calculator/",
        blurb: "Compare old and new pay with 3.5% CPI to see if the rise beats inflation in real terms.",
        live: true
      },
      {
        id: "hmrc",
        name: "HMRC scam checker",
        href: "../tools/is-this-hmrc-message-real/",
        blurb: "Tick what a text, email, call or letter asks for and get a red, amber or green check from GOV.UK rules.",
        live: true
      },
      {
        id: "mileage",
        name: "Mileage allowance calculator",
        href: "https://raw.githack.com/e13cTr0n1c/e13cTr0n1c.github.io/377a363857c315e847c24c0e152e5f9ebbfe0b9a/tools/mileage-allowance-tax-relief-calculator/",
        blurb: "Work out HMRC mileage rates, including the 35p rate above 10,000 miles from April 2027, taxable excess and Mileage Allowance Relief. Preview until it is live on the site.",
        live: false,
        preview: true
      }
    ]
  };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "className") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function renderTools(target) {
    if (!target) return;
    target.textContent = "";
    var list = el("ul", { className: "hub-tools" });
    BUDGET_DAY_2026.tools.forEach(function (t) {
      var li = el("li", { className: t.preview ? "hub-tool preview" : "hub-tool" });
      var aAttrs = { href: t.href };
      if (t.preview) { aAttrs.rel = "noopener"; }
      var a = el("a", aAttrs);
      if (t.preview) a.setAttribute("target", "_blank");
      a.appendChild(el("strong", { text: t.name }));
      a.appendChild(el("span", { text: t.blurb }));
      if (t.preview) a.appendChild(el("em", { className: "preview-tag", text: "Preview link (not live yet)" }));
      li.appendChild(a);
      list.appendChild(li);
    });
    target.appendChild(list);
  }

  function renderAnnounced(target) {
    if (!target) return;
    target.textContent = "";
    BUDGET_DAY_2026.announcedSoFar.forEach(function (item) {
      var art = el("article", { className: item.placeholder ? "hub-item placeholder" : "hub-item", id: "announced-" + item.id });
      art.appendChild(el("h3", { text: item.title }));
      var tag = item.placeholder ? "Not confirmed yet" : (item.status === "confirmed" ? "Confirmed in the Budget documents" : (item.status === "expected" ? "Expected, not yet on GOV.UK as a 2027/28 rate" : "Published"));
      art.appendChild(el("p", { className: "hub-tag", text: tag }));
      art.appendChild(el("p", { text: item.body }));
      if (item.source) {
        var sp = el("p", { className: "hub-src", text: "Source: " });
        sp.appendChild(el("a", { href: item.source.href, rel: "noopener", text: item.source.label }));
        art.appendChild(sp);
      }
      target.appendChild(art);
    });
  }

  function renderMeta() {
    var lu = document.getElementById("hub-last-updated");
    if (lu) {
      lu.textContent = "Last updated: " + BUDGET_DAY_2026.lastUpdated;
      var time = lu.querySelector("time") || document.createElement("time");
      // keep a simple text line; date also on the time element if present elsewhere
    }
    var st = document.getElementById("hub-status");
    if (st) {
      st.textContent = BUDGET_DAY_2026.status === "announced"
        ? "The Budget documents are on GOV.UK. The items below are taken from them, and anything not confirmed yet is marked."
        : "Budget day is " + BUDGET_DAY_2026.budgetDate + ". Figures below are estimates from published ONS data or marked as awaiting Budget documents.";
    }
    var src = document.getElementById("hub-sources");
    if (src) {
      src.textContent = "";
      var ul = el("ul", { className: "sources" });
      BUDGET_DAY_2026.sources.forEach(function (s) {
        var li = el("li");
        li.appendChild(el("a", { href: s.href, rel: "noopener", text: s.label }));
        ul.appendChild(li);
      });
      src.appendChild(ul);
    }
  }

  function init() {
    renderTools(document.getElementById("hub-tools"));
    renderAnnounced(document.getElementById("hub-announced"));
    renderMeta();
  }

  var api = { BUDGET_DAY_2026: BUDGET_DAY_2026, init: init, renderTools: renderTools, renderAnnounced: renderAnnounced };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.BUDGET_HUB = api;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(this);
