(function () {
  "use strict";
  var S = window.Rhl, $ = function (id) { return document.getElementById(id); };
  function set(id, t) { $(id).textContent = t; }
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB"); }
  function pc(n) { return (Math.round(n * 10) / 10).toLocaleString("en-GB") + "%"; }
  var form = $("rhl-form");
  function pick(name, d) { var c = document.querySelector('input[name="' + name + '"]:checked'); return c ? c.value : d; }
  function run() {
    var r = $("rv").value === "" ? { error: "Enter your rateable value to see your relief." } : S.calculate({ year: pick("year", "2027"), rv: $("rv").value, kind: pick("kind", "rhl"), onlyProperty: $("only").checked });
    var out = $("out-rows"), msg = $("out-msg");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "0%"); set("out-headline-sub", ""); return; }
    out.hidden = false; msg.hidden = true;
    set("out-band", "100% up to " + gbp(r.full) + ", tapering to 0% at " + gbp(r.taperEnd));
    set("out-sbrr", r.sbrr === null ? "Ask your council" : pc(r.sbrr));
    set("out-pub", r.kind !== "pub" ? "Not applicable" : (r.pubTbc ? "To be confirmed" : pc(r.pubRelief)));
    set("out-cap", r.cpiCap ? "Yes, bill rises capped at CPI" : "No");
    set("out-headline", r.sbrr === null ? "Ask your council" : pc(r.sbrr));
    set("out-headline-sub", r.sbrr === null ? "With more than one property your council decides." : (r.sbrr === 100 ? "No business rates to pay in " + r.label + " if this is your only property." : (r.sbrr > 0 ? "Small business rate relief off your bill in " + r.label + "." : "No small business rate relief at this rateable value in " + r.label + ".")));
  }
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
