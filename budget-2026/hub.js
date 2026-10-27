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
    lastUpdated: "27 October 2026",
    checked: "2026-10-27",
    status: "awaiting", // change to "announced" once Budget documents are published
    title: "UK Budget 2026 hub",
    lede: "Plain Sums tools that help you make sense of the 28 October 2026 Budget. Every figure is an estimate, not tax, legal or financial advice.",
    sources: [
      { label: "GOV.UK Budget collection (awaiting 2026 documents)", href: "https://www.gov.uk/government/topical-events" },
      { label: "ONS consumer price inflation, September 2026", href: "https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/september2026" },
      { label: "ONS average weekly earnings, September 2026", href: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/averageweeklyearningsingreatbritain/september2026" },
      { label: "GOV.UK new State Pension", href: "https://www.gov.uk/new-state-pension/what-youll-get" }
    ],
    announcedSoFar: [
      {
        id: "state-pension",
        title: "Full new State Pension from April 2027",
        body: "Expected to rise by 3.9% under the triple lock to about £13,036 a year (£250.70 a week as commonly quoted). Built from ONS earnings growth of 3.9% (May to July 2026) and CPI of 3.5% (September 2026). Not yet listed on GOV.UK as a 2027/28 rate, and awaiting the DWP benefit and pension rates publication.",
        status: "expected",
        placeholder: false
      },
      {
        id: "cpi",
        title: "September 2026 CPI",
        body: "CPI was 3.5% in the 12 months to September 2026 (ONS). That figure feeds many Budget linked upratings.",
        status: "published",
        placeholder: false
      },
      {
        id: "earnings",
        title: "Average earnings growth",
        body: "Total pay growth for May to July 2026 was 3.9% (ONS). That is the expected triple lock driver for the State Pension.",
        status: "published",
        placeholder: false
      },
      {
        id: "tax-ni",
        title: "Income Tax and National Insurance changes",
        body: "Awaiting Budget documents. No change is assumed in the Budget pay calculator until the Overview of Tax Legislation and Rates is published.",
        status: "awaiting",
        placeholder: true
      },
      {
        id: "uc",
        title: "Universal Credit standard allowance",
        body: "Awaiting Budget documents. The April 2027 figure is set at the Budget, not by CPI alone.",
        status: "awaiting",
        placeholder: true
      },
      {
        id: "other",
        title: "Other Budget measures",
        body: "Awaiting Budget documents. Fuel duty, EV pay per mile timing, thresholds and any other announced measures will be listed here once published.",
        status: "awaiting",
        placeholder: true
      }
    ],
    tools: [
      {
        id: "budget-pay",
        name: "Budget 2026 pay calculator",
        href: "../tools/budget-2026-pay-calculator/",
        blurb: "See your 2026/27 take home pay now and after the Budget, with the difference a year and a month.",
        live: true
      },
      {
        id: "state-pension",
        name: "April 2027 State Pension and benefits checker",
        href: "../tools/state-pension-benefits-increase-april-2027/",
        blurb: "Estimate how much your State Pension, PIP, DLA, Attendance Allowance or Carer's Allowance goes up from April 2027.",
        live: true
      },
      {
        id: "ev",
        name: "EV pay per mile calculator",
        href: "../tools/ev-pay-per-mile-calculator/",
        blurb: "Estimate the proposed 3p and 1.5p a mile charge from April 2028 and compare it with petrol Fuel Duty.",
        live: true
      },
      {
        id: "min-wage",
        name: "Minimum wage rise calculator",
        href: "../tools/minimum-wage-rise-calculator/",
        blurb: "See what the April 2027 National Living Wage and National Minimum Wage rises are worth before and after tax.",
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
        href: "https://raw.githack.com/e13cTr0n1c/e13cTr0n1c.github.io/80db376d5f22cfef30c9c6d6f4e7be2cdfbfa644/tools/mileage-allowance-tax-relief-calculator/",
        blurb: "Work out HMRC AMAP rates, taxable excess and Mileage Allowance Relief for employees, plus self employed simplified expenses. Preview until it is live on the site.",
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
      var tag = item.placeholder ? "Awaiting Budget documents" : (item.status === "expected" ? "Expected, not yet on GOV.UK as a 2027/28 rate" : "Published");
      art.appendChild(el("p", { className: "hub-tag", text: tag }));
      art.appendChild(el("p", { text: item.body }));
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
        ? "Budget figures are in. Tools below use the announced numbers where we have updated them."
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
