# Plain Sums

Free UK tax and money calculators and paid spreadsheet templates. Served by GitHub Pages at https://e13ctr0n1c.github.io/ (user site repo).

Generated. Do not edit the HTML here by hand: the generator lives on the build box at `/workspace/ukbt/build/gen.py`
(sources: `/workspace/web-apps/<tool>/` for the three original calculators, `build/new_tools.py` and `build/new-tools/`
for the other three, `build/templates_pages.py` for the templates).
The four newest calculators (`window-cleaning-price-rise-calculator`, `stretched-funded-hours-calculator`, `allotment-pay-its-way-calculator`, `christmas-collection-slot-planner`) are hand edited HTML, not generated.
Their paid product links are set by one constant at the top of each tool's `app.js` (`ROUND_BOOK_URL`, `CHILDMINDER_WORKBOOK_URL`, `ALLOTMENT_PLANNER_URL`, `CHRISTMAS_ORDER_BOOK_URL`); an empty value hides the button.

| Path | What |
|---|---|
| `/` | Home, CIS calculators first |
| `/tools/<slug>/` | Ten calculators |
| `/templates/<slug>/` | Eight Gumroad templates |
| `/about/`, `/privacy/`, `/cookies/`, `/terms/`, `/disclaimer/` | Site pages |
| `/cis-deduction-calculator/`, `/cis-refund-estimator/`, `/probate-iht-calculator/` | Redirects from the old project paths to `/tools/<slug>/` |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `6e1dfc4c5a8c996a88b5ff5c507b4bc9.txt` | Crawlers and IndexNow |

No cookies, no browser storage. Cookieless Cloudflare Web Analytics, one beacon per page; set `BEACON_TOKEN = None` in the generator to switch it off.
Old project repos (`cis-deduction-calculator`, `cis-refund-estimator`, `probate-iht-calculator`) are private with Pages off,
so their old URLs are served from the redirect folders here. If Pages is ever turned on for one of them, that repo wins.
