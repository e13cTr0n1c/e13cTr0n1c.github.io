// I show my dated deadline banner until the end of its date in UK time, then hide it.
// Preview another day with ?date=YYYY-MM-DD.
(function () {
  var el = document.getElementById('q2-banner');
  if (!el) return;
  function ukToday() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  var m = /[?&]date=(\d{4}-\d{2}-\d{2})(?:&|$)/.exec(location.search);
  var today = m ? m[1] : ukToday();
  el.hidden = today > el.getAttribute('data-hide-after');
})();
