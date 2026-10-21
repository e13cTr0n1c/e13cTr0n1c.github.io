(function () {
  "use strict";
  var H = window.Handover, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { maximumFractionDigits: 0 }); }
  function run() {
    var r = H.calculate($("value").value), msg = $("out-msg");
    var m = r.error && $("value").value !== "" ? r.errors.value : ""; $("value-err").textContent = m;
    if (m) $("value").setAttribute("aria-invalid", "true"); else $("value").removeAttribute("aria-invalid");
    if (r.error) { $("out-rows").hidden = true; msg.hidden = false; msg.textContent = m ? "Check the box marked above to see your answer." : "Type in a value to compare the two rates."; $("out-diff").textContent = ""; $("out-summary").textContent = ""; return; }
    msg.hidden = true; $("out-rows").hidden = false;
    $("out-cgt").textContent = gbp(r.cgt); $("out-it").textContent = gbp(r.incomeTax); $("out-diff").textContent = gbp(r.difference);
    $("out-summary").textContent = "On " + gbp(r.value) + ", 24% is " + gbp(r.cgt) + " and 45% is " + gbp(r.incomeTax) + ". That is " + gbp(r.difference) + " more, if the reported proposal became law in this form.";
  }
  $("ho-form").addEventListener("input", run);
  run();
})();
