(function () {
  "use strict";
  var S = window.Selling;
  var $ = function (id) { return document.getElementById(id); };

  function pick(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function show(el, on) { if (el) el.hidden = !on; }

  function syncChrome() {
    var asset = pick("asset");
    show($("business-block"), asset === "car" || asset === "wasting");
  }

  function fillList(id, items) {
    var list = $(id);
    list.textContent = "";
    items.forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });
  }

  function run() {
    syncChrome();
    var r = S.check({
      activity: pick("activity"),
      sale: $("sale").value,
      soldForLess: pick("sold"),
      asset: pick("asset"),
      businessUse: pick("business")
    });

    var headline = $("headline");
    var msg = $("out-msg");
    var body = $("out-body");

    if (!r.ok) {
      headline.className = "headline";
      $("h-label").textContent = "Your estimate";
      $("out-title").textContent = "Answer the questions";
      $("out-sub").textContent = "";
      msg.hidden = false;
      msg.textContent = r.error;
      show(body, false);
      return;
    }

    msg.hidden = true;
    headline.className = "headline " + (r.tone === "clear" ? "clear" : "attention");
    $("h-label").textContent = "Your estimate";
    $("out-title").textContent = r.headline;
    $("out-sub").textContent = "Checked on " + S.RULES.checkedLabel + ". General guidance, not tax advice.";
    fillList("out-points", r.paragraphs);
    show($("side-links"), !!r.showSideHustleLinks);
    var cap = $("out-cap");
    if (r.outcome === "over-limit" && r.marginalRelief && r.maxChargeableGainPence !== null) {
      cap.hidden = false;
      cap.textContent = "Maximum chargeable gain on this sale: " + S.formatPounds(r.maxChargeableGainPence) + ". Annual exempt amount for " + S.RULES.annualExemptYear + ": " + S.formatPounds(r.annualExemptPence) + ".";
    } else {
      cap.hidden = true;
      cap.textContent = "";
    }
    show(body, true);
  }

  var form = $("sale-form");
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
