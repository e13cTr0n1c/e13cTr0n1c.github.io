// The allotment planner listing URL. While this is empty the call to action stays hidden.
// The full https:// listing URL goes between the quotes; ?ref=ps-uk-allotment-planner is added for you.
const ALLOTMENT_PLANNER_URL = 'https://arthurverse67.gumroad.com/l/allotmentplanner';
const ALLOTMENT_PLANNER_REF = 'ps-uk-allotment-planner';

(function () {
  "use strict";
  var A = window.Allot, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Math.abs(Number(n)).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  var COST_IDS = A.COSTS.concat(["moneyIn", "hours"]);

  var href = A.ctaHref(ALLOTMENT_PLANNER_URL, ALLOTMENT_PLANNER_REF);
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    if (!href) { el.hidden = true; return; }
    el.querySelectorAll("[data-cta-link]").forEach(function (a) { a.setAttribute("href", href); });
    el.hidden = false;
  });

  // crop select options, grouped
  var groups = [], opts = '<option value="">Pick a crop</option>';
  A.CROPS.forEach(function (c) { if (groups.indexOf(c.group) < 0) groups.push(c.group); });
  groups.forEach(function (g) {
    opts += '<optgroup label="' + g + '">';
    A.CROPS.filter(function (c) { return c.group === g; }).forEach(function (c) { opts += '<option>' + c.name + '</option>'; });
    opts += '</optgroup>';
  });
  opts += '<option value="__other">Other (type a name)</option>';

  var box = $("hrows"), count = 0;
  function addRow() {
    if (box.children.length >= A.MAX_ROWS) return;
    var i = count++, d = document.createElement("div");
    d.className = "hrow unused"; d.dataset.row = i;
    d.innerHTML =
      '<div class="full"><label for="crop' + i + '">Crop</label><select id="crop' + i + '" class="crop">' + opts + '</select></div>' +
      '<div class="other-wrap" hidden><label for="oname' + i + '">Crop name</label><input type="text" id="oname' + i + '" class="oname" maxlength="40" autocomplete="off"></div>' +
      '<div><label for="qty' + i + '"><span class="ulabel">Amount (kg)</span></label><input type="number" id="qty' + i + '" class="qty" inputmode="decimal" min="0" max="10000" step="0.1">' +
      '<select class="unit-sel" aria-label="Priced by" hidden><option value="kg">per kg</option><option value="each">each</option></select></div>' +
      '<div><label for="price' + i + '"><span class="plabel">Price</span></label><div class="input-wrap"><span class="prefix" aria-hidden="true">£</span><input type="number" id="price' + i + '" class="price" inputmode="decimal" min="0" max="1000" step="0.01"></div>' +
      '<span class="hint ex"></span></div>' +
      '<span class="err" role="alert"></span>';
    box.appendChild(d);
    $("add-row").disabled = box.children.length >= A.MAX_ROWS;
  }
  function unitOf(d) {
    var v = d.querySelector(".crop").value;
    if (v === "__other") return d.querySelector(".unit-sel").value;
    var c = A.crop(v); return c ? c.unit : "kg";
  }
  function labels(d) {
    var u = unitOf(d), ex = d.dataset.example === "1";
    d.querySelector(".ulabel").textContent = u === "each" ? "How many" : "Amount (kg)";
    d.querySelector(".plabel").textContent = (ex ? "Example price " : "Your price ") + (u === "each" ? "each" : "per kg");
    d.querySelector(".ex").textContent = ex ? "Example price, change it to what you pay" : "";
  }
  box.addEventListener("change", function (e) {
    var d = e.target.closest(".hrow"); if (!d) return;
    if (e.target.classList.contains("crop")) {
      var v = e.target.value, c = A.crop(v), price = d.querySelector(".price");
      d.querySelector(".other-wrap").hidden = v !== "__other";
      d.querySelector(".unit-sel").hidden = v !== "__other";
      if (c) { price.value = c.price.toFixed(2); d.dataset.example = "1"; }
      else { price.value = ""; d.dataset.example = "0"; }
    }
    labels(d); run();
  });
  box.addEventListener("input", function (e) {
    var d = e.target.closest(".hrow"); if (!d) return;
    if (e.target.classList.contains("price")) { d.dataset.example = "0"; labels(d); }
    run();
  });
  for (var k = 0; k < 5; k++) addRow();
  $("add-row").addEventListener("click", function () { addRow(); var rows = box.querySelectorAll(".hrow"); rows[rows.length - 1].querySelector(".crop").focus(); });

  function rowsData() {
    return Array.prototype.map.call(box.querySelectorAll(".hrow"), function (d) {
      var v = d.querySelector(".crop").value;
      var name = v === "__other" ? (d.querySelector(".oname").value.trim() || "Other") : v;
      return { crop: name, qty: d.querySelector(".qty").value, price: d.querySelector(".price").value, unit: unitOf(d) };
    });
  }
  function run() {
    var costs = {}; A.COSTS.forEach(function (k) { costs[k] = $(k).value; });
    var rows = rowsData();
    var r = A.calculate({ costs: costs, moneyIn: $("moneyIn").value, rows: rows, hours: $("hours").value });
    COST_IDS.forEach(function (id) {
      var m = r.error && r.errors[id] ? r.errors[id] : ""; set(id + "-err", m);
      if (m) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid");
    });
    var rowErr = r.error && r.errors.rows ? r.errors.rows : {};
    var used = r.error ? [] : r.usedRows;
    Array.prototype.forEach.call(box.querySelectorAll(".hrow"), function (d, i) {
      d.querySelector(".err").textContent = rowErr[i] || "";
      var q = parseFloat(rows[i].qty), p = parseFloat(rows[i].price);
      d.classList.toggle("unused", !(q > 0 && p > 0));
    });
    var msg = $("out-msg"), hl = $("headline");
    var show = function (on) { ["out-rows", "top-wrap"].forEach(function (id) { $(id).hidden = !on; }); };
    if (r.error) {
      show(false); msg.hidden = false; msg.textContent = "Check the boxes marked above to see your answer.";
      set("out-verdict", ""); set("out-perpound", ""); set("out-perhour", ""); set("out-summary", ""); hl.className = "headline none"; return;
    }
    msg.hidden = true;
    if (r.empty) {
      show(false); hl.className = "headline none";
      set("out-verdict", "Add a harvest and your costs to see the answer");
      set("out-perpound", ""); set("out-perhour", ""); set("out-summary", ""); return;
    }
    show(true);
    hl.className = "headline " + (r.paid ? "refund" : "owed");
    set("out-verdict", r.paid ? "Yes, the plot paid its way by " + gbp(r.net) : "Not this season: short by " + gbp(r.short));
    set("out-value", gbp(r.value)); set("out-spent", gbp(r.spent)); set("out-in", gbp(r.moneyIn));
    set("out-perpound", r.perPound !== null ? "Every £1 spent brought back " + gbp(r.perPound) + " of food." : "");
    set("out-perhour", r.perHour === null ? "" : r.perHour >= 0 ? "That works out at " + gbp(r.perHour) + " for each hour on the plot." : "That works out at a cost of " + gbp(r.perHour) + " for each hour on the plot.");
    var ol = $("out-top"); ol.innerHTML = "";
    r.top.forEach(function (t) { var li = document.createElement("li"); li.textContent = t.crop + " " + gbp(t.value) + " (" + t.sharePct + "%)"; ol.appendChild(li); });
    $("top-wrap").hidden = !r.top.length;
    var s = "At your prices, the plot grew " + gbp(r.value) + " of food for " + gbp(r.spent) + " of costs" + (r.moneyIn > 0 ? ", plus " + gbp(r.moneyIn) + " from sales" : "") + ". ";
    s += r.paid ? "It paid its way by " + gbp(r.net) + "." : "It was short by " + gbp(r.short) + ".";
    set("out-summary", s);
  }
  var form = $("al-form");
  form.addEventListener("input", run); form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  run();
})();
