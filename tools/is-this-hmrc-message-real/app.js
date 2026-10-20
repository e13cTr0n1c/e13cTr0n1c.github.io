(function () {
  "use strict";
  var H = window.HMRCCheck, form = document.getElementById("hmrc-form");
  var LABEL = { red: "Red: likely a scam", amber: "Amber: be careful", green: "Green: matches genuine HMRC contact" };
  var NAMES = { IDENTIFY: "Identify tax scams", REPORT: "Report HMRC phishing", EXAMPLES: "HMRC phishing examples", LIST: "Genuine HMRC contacts", MULTI: "Contact using more than one method", TEXTS: "Genuine HMRC texts", EMAILS: "Genuine HMRC emails", CALLS: "Genuine HMRC calls", LETTERS: "Genuine HMRC letters", QR: "Genuine HMRC QR codes", CONTACT: "Contact HMRC", SIGNIN: "HMRC online account" };
  function srcName(url) { for (var k in H.SRC) if (H.SRC[k] === url) return NAMES[k]; return "GOV.UK"; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function render() {
    var c = form.querySelector('input[name="channel"]:checked'), flags = {};
    H.FLAGS.forEach(function (k) { flags[k] = document.getElementById("f-" + k).checked; });
    var msg = document.getElementById("out-msg"), wrap = document.getElementById("out-wrap");
    if (!c) { msg.hidden = false; wrap.hidden = true; return; }
    var r = H.check({ channel: c.value, flags: flags, date: today() });
    msg.hidden = true; wrap.hidden = false;
    document.getElementById("rag").className = "rag " + r.level;
    document.getElementById("out-level").textContent = LABEL[r.level];
    document.getElementById("out-verdict").textContent = r.verdict;
    var ul = document.getElementById("out-reasons"); ul.textContent = "";
    r.reasons.forEach(function (x) {
      var li = el("li"); li.appendChild(el("span", "tag " + x.level, x.level)); li.appendChild(document.createTextNode(x.text + " "));
      var a = el("a", "", "Source: " + srcName(x.src) + " (GOV.UK)"); a.href = x.src; a.rel = "noopener"; li.appendChild(a); ul.appendChild(li);
    });
    var rep = document.getElementById("out-report"); rep.textContent = "If you think it is a scam: " + r.report + " ";
    var ra = el("a", "", "How to report it on GOV.UK"); ra.href = H.SRC.REPORT; ra.rel = "noopener"; rep.appendChild(ra);
  }
  form.addEventListener("change", render);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  render();
})();
