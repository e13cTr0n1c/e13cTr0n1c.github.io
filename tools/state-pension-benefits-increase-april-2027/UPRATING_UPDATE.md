# Updating the April 2027 uprating tool after the Budget

All figures live in the `UPRATING_2027` object at the top of `uprating.js`. The page text reads the
percentages from it, except the worked examples in the FAQ and the disclaimer, which are plain HTML.

After the Budget on 28 October 2026 (and the DWP benefit and pension rates 2027 to 2028 publication):

1. In `uprating.js`, check `cpi` (3.5), `earningsTotal` (3.9) and `tripleLockFloor` (2.5) against the
   uprating statement. If the government sets the State Pension rise differently, set `earningsTotal`
   (or add an override) so `tripleLock()` returns the announced figure.
2. Change `status` from `"expected"` to `"confirmed"`. The "expected until confirmed" tags switch to
   "Confirmed rates" automatically.
3. Optionally add the published 2027/28 weekly rates and compare them with `uprate()` output. The
   government rounds some rates, so the official figure can differ by a few pence.
4. Add the Universal Credit standard allowance for 2027/28 to the "What about Universal Credit?"
   section in `index.html` (it is set at the Budget, not by CPI).
5. Update the FAQ answers and FAQPage JSON-LD in `index.html` (worked examples: £250.71, £192.11,
   £118.61, £82.80, £79.38, £31.36), the disclaimer, `dateModified`, the "Checked on" dates and the
   sitemap `lastmod`. The generator for the page is `/workspace/ukbt/qa/new-tools/make_uprating.py`.
6. Run `node /workspace/ukbt/qa/new-tools/engine-uprating.test.js` and the browser test
   `browser-uprating.test.js`, and fix any expected values that changed.

Sources:
- CPI: https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/september2026
- Earnings: https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/averageweeklyearningsingreatbritain/september2026
- Rates: https://www.gov.uk/government/publications/benefit-and-pension-rates-2026-to-2027
