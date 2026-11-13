# DMS Studio: SEO changes and deployment plan (13 Nov 2026)

This plan separates code prepared in this repository from results that require deployment and fresh Google data. It does not promise rankings or enquiries.

## Verified baseline

- Google Search Console, last 3 months versus previous 3 months: 100 vs 89 web clicks; 9.18k vs 7.82k impressions; CTR 1.1% in both periods; average web position 8.7 vs 8.3.
- The homepage received 88 of 100 recent web clicks. `interior designer mohali`: 12 clicks, 383 impressions, average web position 2.8. `interior designer chandigarh`: 0 clicks, 24 impressions, average web position 12.7. These are not Google Maps positions.
- The sitemap was read successfully and had 39 discovered pages. GSC showed 84 indexed URLs and 48 crawled but unindexed URLs. The latter are mostly older Wix `/post/` URLs, so the count is not 48 broken current pages.
- Three 404 examples: `/interior-design-tips`, `/logo`, and `/post/innovative-interior-design-ideas-for-every-space-with-dms-studio-1`.
- GSC's Google Search generative AI report showed 166 impressions, up from 98, including 110 for the homepage, 20 for the Diwali guide and 15 for Essentia Salon. This report does not provide AI clicks, leads or an AI rank.
- The owner reported zero genuine Google enquiries. GA4's DmsStudio property showed “No data received yet” when checked. Do not claim that analytics is collecting leads until a tag and test event are verified.

## Prepared in this branch

1. **Enquiry path:** homepage hero retains the single “Explore our work” action. Location page enquiry links prefill the city on the contact form. Contact actions remain available in the site navigation and page content.
2. **Measurement hooks:** `js/main.js` emits `contact_click` for phone, email and WhatsApp links, and `generate_lead` only after the form provider accepts a submission. The events include no form values or personal contact details. They use an existing `gtag` or `dataLayer`; no Google tag is currently installed in this repository.
3. **Truthful location proof:** Mohali and Chandigarh pages now show additional documented projects. Chandigarh examples are explicitly labelled as Mohali projects; no project location was rewritten. Project pages link to their actual location service page.
4. **Search snippets:** Mohali and Chandigarh page titles and descriptions are more specific to their content and search intent.
5. **Migration redirects:** `/interior-design-tips` goes to `/blog`; `/logo` goes to the actual brand image. The old “innovative ideas” post now goes to a new room-by-room guide with original DMS project references. Cloudflare Pages must publish `_redirects` for these rules to work.
6. **AI visibility foundations:** original project images, location facts, service details, and existing structured data remain accessible. The new internal project links and concise location context help people and crawlers find relevant evidence; no AI-specific ranking trick was added.
7. **Answer-first FAQ:** all 50 FAQ questions now have semantic question headings; 11 answers were tightened to address the question immediately, and 14 answers have relevant project, service or location links. Unverified fixed budget ranges were removed.

## Before deployment

- Review the copy and project selection on `/interior-designer-in-mohali/` and `/interior-designer-in-chandigarh/`. Confirm that the listed services and location facts are accurate. Do not label a Mohali project as a Chandigarh project.
- Check that Cloudflare Pages publishes `_redirects`, `sitemap.xml`, all generated HTML and the current `js/main.js`.
- If GA4 tracking is wanted, obtain the DmsStudio web stream's **Measurement ID** from GA4 Admin > Data streams, install its Google tag (or GTM) with the site's privacy/consent choice, then verify `contact_click` and `generate_lead` in GA4 DebugView or Realtime. The existing code only prepares the events; it does not collect data on its own.
- Test the live contact form with one real test enquiry. Confirm delivery in the studio inbox and the on-page success message before treating it as a conversion. Do not send a real client enquiry for testing.

## After deployment

1. Check live status, canonical and content for the two city pages, related project pages, `/contact`, and the two redirects. Submit the current sitemap in GSC if needed.
2. Use GSC URL Inspection on priority new pages and request indexing where necessary. Do not request indexing for legacy URLs that intentionally redirect or remain 404.
3. Review GSC weekly for 4 to 8 weeks: the two exact commercial queries above, clicks to the city pages, and the Google AI impressions report. Results fluctuate by location and query; use GSC trends rather than a single manual search.
4. Once GA4 is collecting, compare organic sessions with confirmed form leads and contact clicks. Separate calls or WhatsApp clicks from completed projects; a click alone is not a qualified lead.

## Verification performed locally

- `python3 scripts/build.py` followed by `python3 scripts/prepare_scheduled_blogs.py` so date-gated articles remain in the homepage and blog listing
- `python3 scripts/check-site.py` (46 generated pages, 3,053 local references, no missing links, unique titles/descriptions/canonicals)
- `node --check js/main.js` and `python3 -m py_compile scripts/build.py`
- Browser preview checked for homepage and Chandigarh page. No live website or GSC settings were changed by these code edits.
