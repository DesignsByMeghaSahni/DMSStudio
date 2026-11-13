# DMS Studio — multi-page website prototype

Open **index.html** in a current browser. The website uses relative paths, local images/fonts and classic scripts. No install, package manager, build system or internet connection is needed to explore the pages. The 3D house needs WebGL2; a readable floor plan remains if it is unavailable.

For a local HTTP preview, run this in the existing project folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765 . The browser-testing tool allowed HTTP testing but blocked direct `file://` navigation, so direct-file execution was not browser-verified in this session. The implementation deliberately avoids modules, fetches, remote assets and model/texture loaders, the common file-origin restrictions.

## Included
- Six main pages: Home, About, Services, Projects, Blog, Contact.
- Eleven DMS project case studies with galleries, and original walkthroughs where supplied.
- Four individual service pages.
- Three original journal articles with visible source credits and contextual links to related projects and services.
- Credits/privacy/prototype notes page.
- Actual DMS project imagery and founder portrait; original typographic identity treatment.
- Real procedural Three.js house: plan → perspective → entrance → living → dining. Native scroll controls the camera; chapter buttons jump to rooms. “Explore 360°” enables mouse/touch orbit, with accessible rotate/reset buttons. Reduced-motion uses manual room selection and no long pinned scroll. Static floor-plan fallback on WebGL failure. The house is an **illustrative concept**, not a completed DMS project.
- Separate lightweight material palette study.
- Email enquiry draft builder. It does **not** send or store submissions. The user reviews the draft and sends through their email app.

## Editing
The shipped HTML can be edited directly. For consistent site-wide changes, the optional dependency-free authoring script is easier:

```sh
python3 scripts/build.py
python3 scripts/prepare_scheduled_blogs.py
python3 scripts/check-site.py
```

This is an optional maintenance helper, not a prerequisite for opening the website. It overwrites generated HTML. Do not mix direct page edits with regeneration unless the same changes are made in the template.
Run `prepare_scheduled_blogs.py` after `build.py` so the date-gated article cards remain in the homepage and blog listing.

- Shared navigation/footer, page layouts, business facts, service content: `scripts/build.py`.
- Project content: `content/projects.json`.
- Article content: `content/articles.json`.
- Walkthrough HTML: `content/walkthrough.fragment`.
- Colours/layout/type: `css/style.css`; local font declarations: `css/fonts.css`.
- Navigation, filter, gallery, enquiry: `js/main.js`.
- Material study/reveals: `js/animations.js`.
- House geometry, furniture, light and camera keyframes: `js/walkthrough.js`.
- Asset sources, replacement instructions and licences: `ASSETS.md`.

### Add a project
1. Duplicate a record in `content/projects.json`; give it a unique slug.
2. Set title, location, category (Residential/Commercial), year, short/full description, concept, scope, materials, gallery, source and SEO description. Never invent unspecified measurements, costs or product specifications.
3. Add image variants to `images/` and their actual dimensions to `assets/image-dimensions.json` (or use the optional Pillow image helper).
4. Run the build and link check. A complete `projects/<slug>/index.html` is generated and added to the portfolio/next-project sequence/sitemap.
5. Update the portfolio filter counts in the template when the total changes. Home currently features the first two records plus Essentia explicitly; curate it deliberately.

### Add an article
Duplicate a record in `content/articles.json`, update its slug, metadata, image, sections and related links, then regenerate. Articles are drafted for review. On publication, update author/date/status in the template and metadata; do not imply approval before review.

## Before public launch
This is a local website prototype, not a deployment. All 36 public pages, including the credits page, are generated as `index, follow` and listed in the sitemap. Local files cannot appear in search until the site is hosted on its canonical HTTPS domain. Do not upload the complete workspace: publish only intended public HTML pages, `projects/`, `services/`, `blog/`, `css/`, the runtime assets used by those pages, the favicon, fonts and their licences. Exclude `sites/`, backups, research, scripts, unused originals and internal content files.

1. Approve journal copy, wordmark, imagery and service wording; confirm the address floor (published sources conflict). The prototype omits the floor.
2. Confirm current phone, email and project permissions. Replace optional prototype imagery if desired.
3. Configure a real form backend only if you want submissions without an email app, and then update the privacy wording and add spam protection.
4. Set the production canonical base if the domain changes. Confirm the live server does not add a conflicting `X-Robots-Tag` or block public pages in `robots.txt`.
5. Apply redirects for legacy routes; see `research/REDIRECTS.md`. Do not erase existing SEO entry points.
6. Enable gzip/Brotli, long caching for versioned assets, HTTPS and suitable security headers on the chosen host. The 3D engine is loaded only on the homepage near its experience section; project videos use `preload="none"`.
7. Verify structured data with Google's tools, Search Console indexing, sitemap, Google Business Profile address and actual production Core Web Vitals. Submit the sitemap after deployment. No ranking or AI-citation outcome is guaranteed.

## Research and checks
- `research/RESEARCH-AND-STRATEGY.md`: ten competitor analyses, business evidence, design/SEO strategy and 3D-reference follow-up.
- `TESTING.md`: executed tests, refinements and explicit limitations.
- `research/screenshots/`: visual verification.
- `backups/index.original.html`: preserved original unrelated website, unchanged.

## 9 October 2026 refresh

35 public HTML pages now include eleven project case studies, four service pages, six city pages, a location hub, six original journal guides and the credits page. Each page has distinct title, description and canonical content. Verified social and business-profile links are maintained in `content/social-links.json`. Edit `content/locations.json` for unique city content and `content/service-details.json` for service scope, project evidence and FAQs. Run `python3 scripts/build.py` after content edits. `assets/editorial-sources.json` records the distinct homepage/service/blog photos. The new circle-free wordmarks preserve the central artwork from the supplied PNGs in SVG viewports; originals are in `assets/brand/`.

The active experience uses `js/photographic-tour.js` and a local embedded panoramic image in `js/house-panorama.js`. It is a photoreal AI-furnished 360° room, not a volumetric model or captured DMS property. A richer PBR geometry experiment is retained in the backup alongside the original stylised model. The active panorama needs no remote runtime request. Previous stylised code and the complete previous site are preserved in `backups/2026-10-09-before-refresh/`.

Read `research/SEO-AEO-GEO-AUDIT.md` before launch. Its 92/100 score is a pre-launch content and crawl-readiness estimate, not a ranking guarantee; live URL inspection and field performance still require deployment. The site remains a local prototype pending deployment and final factual/rights checks. The updated founder portrait is an AI-assisted edit, with the original preserved; exact facial pixel identity cannot be guaranteed by generative editing.

## 15 October 2026 FAQ library

`faq.html` contains 50 original questions in eight categories. Edit `content/faqs.json` and regenerate. Optional search and shareable question links use `js/faq.js`; answers remain present without JavaScript. Linked from the homepage, services page and every footer. Research, sources, Google Trends access limitations and a question-intent CSV are in `research/faq/`. The site now has 36 public pages.
