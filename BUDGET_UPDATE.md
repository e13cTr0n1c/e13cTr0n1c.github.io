# Budget day update: tools/budget-2026-pay-calculator/

Everything for the "After the Budget" column lives in one object, `BUDGET_2026`, in
`tools/budget-2026-pay-calculator/budget.js`. Do not touch `pay.js`: its `CONFIGS[0]` is the
confirmed 2026/27 rules and is the left hand column.

## On 28 October 2026 (about 10 minutes)

1. Open the Budget documents on GOV.UK (the "Budget 2026" collection, the Overview of Tax
   Legislation and Rates, and any HMRC policy papers on Income Tax and National Insurance).
2. In `budget.js`, edit `BUDGET_2026`:
   | Field | What to put |
   |---|---|
   | `announced` | `true` (hides the yellow banner, switches the wording under the difference) |
   | `effectiveFrom` | Start date, for example `"6 April 2027"` |
   | `period` | Tax year, for example `"6 April 2027 to 5 April 2028"` |
   | `checked` | Today, `"2026-10-28"` |
   | `summary` | One sentence, UK English, no dashes, for example `"The Budget freezes the tax thresholds and cuts employee National Insurance to 7%."` |
   | `sources.budget` | GOV.UK URL(s) you took the numbers from |
   | `personalAllowance` | New Personal Allowance in £ (now 12570) |
   | `taperStart` | Income where the allowance starts to taper (now 100000) |
   | `incomeTax.ruk[].to` | Top of each band as **taxable income above the allowance** (basic now 37700, higher now 125140). |
   | `incomeTax.ruk[].rate` | Decimal, 20% = `0.20` |
   | `incomeTax.scotland` | Usually set by the Scottish Budget later, so leave unless the UK Budget changes the Personal Allowance. Bands are taxable income above the allowance (GOV.UK income band minus 12,570). |
   | `ni.primaryThreshold`, `ni.upperEarningsLimit` | Yearly £ (now 12570 and 50270) |
   | `ni.mainRate`, `ni.upperRate` | Employee Class 1 rates as decimals (now 0.08 and 0.02) |
   | `studentLoan.planX.threshold` | Yearly £ if announced |
   | `reliefAtSourceRate` | Only if basic rate changes |
3. If a change starts part way through a tax year (for example NI from 6 January), the calculator
   applies it to the whole year. Say so in `summary` and set `effectiveFrom` to that date.
4. If the Budget changes a different year from 2026/27, also rename the first header in
   `index.html` table (`2026/27`) only if needed; the left column always stays the current rules.
5. Update the "Checked on" date in the footer and the disclaimer in `index.html`, and the
   `lastmod` for the page in `sitemap.xml`.
6. Run the tests: `node /workspace/ukbt/qa/new-tools/engine-budget.test.js` and
   `node /workspace/ukbt/qa/new-tools/browser-budget.test.js`. The engine test asserting a £0
   difference is guarded by `announced`, so it skips itself once you set `announced: true`;
   add one assertion with a hand worked figure for a £35,000 salary.
7. Scan the diff (no dashes in copy, no phone numbers), commit, push.
