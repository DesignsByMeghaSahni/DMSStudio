# Current verification — 15 October 2026

## Static site and content

- `python3 scripts/build.py` generated 35 intended public HTML pages.
- `python3 scripts/check-site.py` passed: 2,367 local references checked, 35 unique titles, meta descriptions and canonical URLs, zero errors.
- All public pages have one H1, JSON-LD, descriptive image alternatives and `index, follow`; no public page is marked `noindex`.
- The sitemap contains 35 public routes. The checker and sitemap exclude the staged share copy under `sites/`, and `robots.txt` disallows that folder.
- The structured FAQ data parses; answer summaries and FAQs are visible in the page markup.
- A content scan found no repeated substantive paragraphs among the intended public pages.
- Social/business-profile links are present site-wide and mirrored in the LocalBusiness entity data.

## Not verified until publication

The redesigned site remains local, while `www.dmsstudio.in` currently serves the older Wix version. No production URL inspection, Google Search Console or Bing Webmaster Tools coverage, Rich Results Test, Lighthouse score or field Core Web Vitals are claimed. Those checks need the redesigned pages on a public HTTPS host. The precise floor for the listed studio address also needs confirmation before launch; the site omits it until the public listings are reconciled.

## Historical browser checks

Earlier responsive and interaction checks are retained in `research/responsive-audit.json`, `research/refresh-responsive-audit.json` and `research/screenshots/`. They cover earlier versions of the site; repeat visual and device checks against the final pre-launch build before publishing.

## Dedicated FAQ page — 15 October 2026

Build and full static checker passed: 36 public pages, 2,512 local references, unique titles/descriptions/canonicals and no errors. Confirmed all 50 unique questions and answers match their FAQPage schema, all question IDs exist, seven budget answers link to consultation, and faq.html is in the sitemap with index/follow. JavaScript syntax checked. Browser file preview was blocked by the browser URL policy; no desktop/mobile visual verification is claimed for this addition. Google Trends returned 429 in the browser; no volume figures were obtained.
