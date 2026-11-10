"""Build approved static articles and Cloudflare Pages date-gated publishing."""
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://www.dmsstudio.in/"
articles = json.loads((ROOT / "content/scheduled-articles.json").read_text())
published_articles = json.loads((ROOT / "content/articles.json").read_text())
dimensions = json.loads((ROOT / "assets/image-dimensions.json").read_text())

PROJECT_PREFIXES = {
    "opera-": "opera-home", "tdi-wellington-": "tdi-wellington-3bhk",
    "falcon-66-": "falcon-66", "ruchit-phase1-": "ruchit-phase-1",
}


def asset_path(name, size):
    for prefix, project in PROJECT_PREFIXES.items():
        if name.startswith(prefix):
            return f"projects/{project}/photos/optimized/{name}-{size}.webp"
    return f"images/{name}-{size}.webp"


def image(name, alt, root="", eager=False):
    variants = dimensions[name]
    srcset = ", ".join(
        f"{root}{asset_path(name, size)} {variants[size]['width']}w"
        for size in ("640", "1280", "1920")
    )
    width, height = variants["1280"]["width"], variants["1280"]["height"]
    loading = "eager" if eager else "lazy"
    priority = ' fetchpriority="high"' if eager else ""
    return (f'<img src="{root}{asset_path(name, "1280")}" srcset="{srcset}" '
            f'sizes="90vw" width="{width}" height="{height}" alt="{escape(alt, quote=True)}" '
            f'loading="{loading}" decoding="async"{priority}>')


def card(article, root=""):
    return (f'<article class="journal-card reveal" data-blog-date="{article["publishDate"]}">'
            f'<a href="{root}blog/{article["slug"]}/index.html">'
            f'{image(article["image"], article["alt"], root)}'
            f'<p class="eyebrow">{escape(article["category"])} <span aria-hidden="true">↗</span></p>'
            f'<h3>{escape(article["cardTitle"])}</h3></a>'
            f'<p class="small">DMS Studio journal · '
            f'<time datetime="{article["publishDate"]}">{article["publishDate"]}</time></p></article>')


def page_html(article, shell_header, shell_footer, shell_dialog, business_schema):
    slug, title, day = article["slug"], article["title"], article["publishDate"]
    canonical = f"{BASE}blog/{slug}/index.html"
    desc = article["excerpt"]
    image_url = f'{BASE}{asset_path(article["image"], "1280")}'
    graph = [business_schema,
             {"@type": "WebPage", "@id": canonical, "url": canonical,
              "name": title, "description": desc,
              "isPartOf": {"@id": f"{BASE}#website"}},
             {"@type": "BlogPosting", "@id": f"{canonical}#article",
              "headline": title, "description": desc, "image": image_url,
              "datePublished": day, "dateModified": day, "inLanguage": "en-IN",
              "mainEntityOfPage": {"@id": canonical},
              "author": {"@type": "Organization", "@id": f"{BASE}#studio", "name": "DMS Studio"},
              "publisher": {"@id": f"{BASE}#studio"}},
             {"@type": "BreadcrumbList", "itemListElement": [
                 {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
                 {"@type": "ListItem", "position": 2, "name": "Journal", "item": f"{BASE}blog.html"},
                 {"@type": "ListItem", "position": 3, "name": title, "item": canonical}]}]
    if article.get("faqs"):
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in article["faqs"]]})
    schema = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)
    head = f'''<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)} | DMS Studio</title><meta name="description" content="{escape(desc, quote=True)}">
<meta name="robots" content="index, follow, max-image-preview:large"><meta name="theme-color" content="#302b25">
<link rel="canonical" href="{canonical}"><meta property="og:type" content="article"><meta property="og:site_name" content="DMS Studio">
<meta property="og:title" content="{escape(title, quote=True)} | DMS Studio"><meta property="og:description" content="{escape(desc, quote=True)}">
<meta property="og:url" content="{canonical}"><meta property="og:image" content="{image_url}"><meta property="og:image:alt" content="{escape(article['alt'], quote=True)}">
<meta property="og:locale" content="en_IN"><meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(title, quote=True)} | DMS Studio"><meta name="twitter:description" content="{escape(desc, quote=True)}"><meta name="twitter:image" content="{image_url}">
<link rel="icon" type="image/svg+xml" href="../../assets/favicon.svg?v=monogram-3"><link rel="icon" type="image/png" sizes="32x32" href="../../assets/favicon-32.png?v=monogram-3"><link rel="shortcut icon" href="../../assets/favicon.ico?v=monogram-3"><link rel="apple-touch-icon" href="../../assets/apple-touch-icon.png?v=monogram-3">
<link rel="stylesheet" href="../../css/fonts.css"><link rel="stylesheet" href="../../css/style.css?v=project-media-folders-1"><link rel="stylesheet" href="../../css/brand.css?v=responsive-20261023">
<script type="application/ld+json">{schema}</script><script src="../../js/main.js?v=responsive-20261023" defer></script><script src="../../js/animations.js" defer></script></head>
<body class="interior-page"><a class="skip-link" href="#main">Skip to content</a>{shell_header}
<main id="main"><div class="wrap breadcrumb"><a href="../../blog.html">Journal</a><span>/</span>{escape(article['category'])}</div>
<section class="page-intro wrap"><p class="eyebrow">{escape(article['category'])} · Mohali &amp; Tricity</p><h1>{escape(title)}</h1><p class="lead">{escape(article['excerpt'])}</p></section>
<div class="wrap article-meta"><span>By DMS Studio</span><time datetime="{day}">Published {day}</time><span>Practical design guidance</span></div>
<div class="wrap article-hero">{image(article['image'], article['alt'], '../../', True)}</div>
<div class="wrap article-quick-answer"><span>Quick answer</span><p>{article['quickAnswer']}</p></div>
<article class="article-body">{''.join(f'<section><h2>{escape(h)}</h2><p>{escape(p)}</p>{inline_links(article, i)}</section>' for i, (h, p) in enumerate(article['sections']))}
<aside class="article-aside"><h2>Explore the studio’s work and services.</h2>{''.join(f'<a class="text-link" href="{link}">{label}<span aria-hidden="true">↗</span></a>' for link, label in zip(article['links'], ['Explore a related project', 'Explore interior design services', 'Continue the conversation']))}</aside></article>
<section class="wrap section faq"><div><p class="eyebrow">Useful answers</p><h2>Common questions</h2></div><div>{''.join(f'<details><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>' for q, a in article['faqs'])}</div></section>
<section class="wrap section related-article"><p class="eyebrow">Follow the studio</p><h2>More ideas for <em>your home.</em></h2><p>See project details and design updates from DMS Studio.</p><div class="social-links"><a href="https://www.instagram.com/dms__studio" target="_blank" rel="noopener noreferrer">Instagram<span aria-hidden="true"> ↗</span></a><a href="https://www.facebook.com/profile.php?id=100083342347221" target="_blank" rel="noopener noreferrer">Facebook<span aria-hidden="true"> ↗</span></a><a href="https://share.google/L5Y3g26Lgr34GhKNI" target="_blank" rel="noopener noreferrer">Google Business Profile<span aria-hidden="true"> ↗</span></a></div></section></main>
{shell_footer}{shell_dialog}</body></html>'''
    return head


def inline_links(article, section_index):
    links = article.get("inlineLinks")
    if not links or links.get("section") != section_index:
        return ""
    first = f'<a href="{escape(links["internalHref"], quote=True)}">{escape(links["internalText"])}</a>'
    second = f'<a href="{escape(links["externalHref"], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(links["externalText"])}</a>'
    return (f'<p class="article-inline-links">{escape(links["internalLead"])}{first}. '
            f'{escape(links["externalLead"])}{second}.</p>')


def add_dates_to_existing_cards(html, known_articles):
    dates = {a["slug"]: a["date"] for a in known_articles}
    pattern = re.compile(r'<article class="journal-card[^>]*>.*?</article>', re.S)
    def mark(match):
        block = match.group(0)
        link = re.search(r'href="(?:\.\./)*blog/([^/]+)/index\.html"', block)
        if not link:
            return block
        day = dates.get(link.group(1))
        if not day:
            return block
        block = re.sub(r'\sdata-blog-date="[^"]*"', '', block)
        return re.sub(r'<article class="journal-card([^\"]*)"',
                      f'<article class="journal-card\\1" data-blog-date="{day}"', block, count=1)
    return pattern.sub(mark, html)


source = (ROOT / "blog/diwali-home-makeover-ideas-2026-mohali-tricity/index.html").read_text()
header = source.split('<body class="interior-page">', 1)[1].split('<main id="main">', 1)[0]
header = '<body class="interior-page">' + header
tail = source.split("</main>", 1)[1]
footer = tail.split('<dialog class="lightbox"', 1)[0]
dialog = '<dialog class="lightbox"' + tail.split('<dialog class="lightbox"', 1)[1].split("</dialog>", 1)[0] + "</dialog>"
existing_ld = re.search(r'<script type="application/ld\+json">(.*?)</script>', source, re.S)
business = json.loads(existing_ld.group(1))["@graph"][0]

for article in articles:
    for link in article["links"]:
        target = (ROOT / "blog" / article["slug"] / link.replace("../../", "")).resolve()
        # Links may point to projects/services as well as blog pages; resolve from site root.
        site_target = (ROOT / link.replace("../../", "")).resolve()
        if not site_target.exists():
            raise FileNotFoundError(f"Missing related page for {article['slug']}: {link}")
    for size in ("640", "1280", "1920"):
        target = ROOT / asset_path(article["image"], size)
        if not target.exists():
            raise FileNotFoundError(f"Missing article image: {target}")
    path = ROOT / "blog" / article["slug"] / "index.html"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(page_html(article, header, footer, dialog, business))

all_known = published_articles + [{"slug": a["slug"], "date": a["publishDate"]} for a in articles]
for name in ("index.html", "blog.html"):
    path = ROOT / name
    html = add_dates_to_existing_cards(path.read_text(), all_known)
    additions = "".join(card(a, "" if name == "blog.html" else "") for a in articles)
    if name == "index.html":
        start = html.index('<div class="journal-grid">', html.index('<section class="journal-section'))
        end = html.index("</div></div></section>", start)
        old = html[start + len('<div class="journal-grid">'):end]
        # Add the scheduled cards to the static grid; the edge worker chooses the live three.
        for article in articles:
            old = re.sub(r'<article\b[^>]*>\s*<a href="blog/' + re.escape(article["slug"]) + r'/index\.html">[\s\S]*?</article>', '', old)
        html = html[:start] + '<div class="journal-grid">' + old + additions + html[end:]
    else:
        start = html.index('<div class="journal-grid">', html.index('<section class="wrap section blog-index'))
        end = html.index("</div></section>", start)
        old = html[start + len('<div class="journal-grid">'):end]
        for article in articles:
            old = re.sub(r'<article\b[^>]*>\s*<a href="blog/' + re.escape(article["slug"]) + r'/index\.html">[\s\S]*?</article>', '', old)
        html = html[:start] + '<div class="journal-grid">' + old + additions + html[end:]
    path.write_text(html)

schedule = [{"slug": a["slug"], "publishDate": a["publishDate"]} for a in articles]
worker = '''// Advanced-mode Cloudflare Pages worker: IST-gated articles and date-aware listings.
const SCHEDULED = ''' + json.dumps(schedule, separators=(",", ":")) + ''';
const IST = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

function istParts(now = new Date()) {
  return Object.fromEntries(IST.formatToParts(now).filter(p => p.type !== "literal").map(p => [p.type, p.value]));
}
function visible(day, now = new Date()) {
  const p = istParts(now), today = `${p.year}-${p.month}-${p.day}`;
  return today > day || (today === day && (Number(p.hour) > 9 || (Number(p.hour) === 9 && Number(p.minute) >= 0)));
}
function articleForPath(path) {
  const normalized = path.replace(/\\/+$/, "").replace(/\\/index\\.html$/, "");
  const match = normalized.match(/^\\/blog\\/([^/]+)$/);
  return match ? SCHEDULED.find(a => a.slug === match[1]) : undefined;
}
function updateListings(html, path, now) {
  const match = html.match(/<div class="journal-grid">([\\s\\S]*?)<\\/div>/);
  if (!match) return html;
  const cards = [...match[1].matchAll(/<article\\b[^>]*data-blog-date="(\\d{4}-\\d{2}-\\d{2})"[^>]*>[\\s\\S]*?<\\/article>/g)]
    .filter(m => visible(m[1], now)).sort((a,b) => b[1].localeCompare(a[1]));
  const listing = path === "/blog.html" ? cards.map(m => m[0]) : cards.slice(0,3).map(m => m[0]);
  return html.replace(match[0], `<div class="journal-grid">${listing.join("")}</div>`);
}
function updateSitemap(xml, now) {
  const existing = new Set([...xml.matchAll(/<loc>https:\\/\\/www\\.dmsstudio\\.in\\/blog\\/([^/<]+)\\/index\\.html<\\/loc>/g)].map(m => m[1]));
  const entries = SCHEDULED.filter(a => visible(a.publishDate, now) && !existing.has(a.slug))
    .map(a => `  <url><loc>https://www.dmsstudio.in/blog/${a.slug}/index.html</loc><lastmod>${a.publishDate}</lastmod></url>`).join("\\n");
  return entries ? xml.replace("</urlset>", `${entries}\\n</urlset>`) : xml;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url), now = new Date();
    const article = articleForPath(url.pathname);
    if (article && !visible(article.publishDate, now)) {
      return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } });
    }
    const response = await env.ASSETS.fetch(request);
    if (!response.ok) return response;
    const isSitemap = url.pathname === "/sitemap.xml";
    const isListing = url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/blog.html";
    if (!isSitemap && !isListing) return response;
    const body = await response.text();
    const output = isSitemap ? updateSitemap(body, now) : updateListings(body, url.pathname, now);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
    return new Response(output, { status: response.status, statusText: response.statusText, headers });
  }
};
'''
(ROOT / "_worker.js").write_text(worker)
middleware_path = ROOT / "functions/_middleware.js"
if middleware_path.exists():
    middleware = middleware_path.read_text()
    replacement = "const SCHEDULED = " + json.dumps(schedule, separators=(",", ":")) + ";"
    middleware, replacements = re.subn(
        r"const SCHEDULED = \[[\s\S]*?\];",
        replacement,
        middleware,
        count=1,
    )
    if replacements != 1:
        raise RuntimeError("Could not update scheduled dates in Pages Functions middleware")
    middleware_path.write_text(middleware)
print(f"Prepared {len(articles)} date-gated articles and synchronized publishing schedules")
