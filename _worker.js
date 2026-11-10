// Advanced-mode Cloudflare Pages worker: IST-gated articles and date-aware listings.
const SCHEDULED = [{"slug":"small-home-mandir-design-mohali","publishDate":"2026-11-02"},{"slug":"warm-winter-home-interiors-mohali","publishDate":"2026-11-09"},{"slug":"guest-bedroom-design-indian-homes","publishDate":"2026-11-16"},{"slug":"modular-kitchen-planning-mohali-checklist","publishDate":"2026-11-23"},{"slug":"christmas-decor-small-indian-living-room","publishDate":"2026-11-30"},{"slug":"office-interior-planning-mohali-2027","publishDate":"2026-12-07"},{"slug":"ai-interior-design-vs-real-home-planning","publishDate":"2026-12-14"},{"slug":"3bhk-interior-quotation-checklist-mohali","publishDate":"2026-12-21"},{"slug":"plan-home-interiors-2027-renovation-timeline","publishDate":"2026-12-28"}];
const IST = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

function istParts(now = new Date()) {
  return Object.fromEntries(IST.formatToParts(now).filter(p => p.type !== "literal").map(p => [p.type, p.value]));
}
function visible(day, now = new Date()) {
  const p = istParts(now), today = `${p.year}-${p.month}-${p.day}`;
  return today > day || (today === day && (Number(p.hour) > 9 || (Number(p.hour) === 9 && Number(p.minute) >= 0)));
}
function articleForPath(path) {
  const normalized = path.replace(/\/+$/, "").replace(/\/index\.html$/, "");
  const match = normalized.match(/^\/blog\/([^/]+)$/);
  return match ? SCHEDULED.find(a => a.slug === match[1]) : undefined;
}
function updateListings(html, path, now) {
  const match = html.match(/<div class="journal-grid">([\s\S]*?)<\/div>/);
  if (!match) return html;
  const cards = [...match[1].matchAll(/<article\b[^>]*data-blog-date="(\d{4}-\d{2}-\d{2})"[^>]*>[\s\S]*?<\/article>/g)]
    .filter(m => visible(m[1], now)).sort((a,b) => b[1].localeCompare(a[1]));
  const isBlogArchive = path === "/blog.html" || path === "/blog" || path === "/blog/";
  const listing = isBlogArchive ? cards.map(m => m[0]) : cards.slice(0,3).map(m => m[0]);
  return html.replace(match[0], `<div class="journal-grid">${listing.join("")}</div>`);
}
function updateSitemap(xml, now) {
  const existing = new Set([...xml.matchAll(/<loc>https:\/\/www\.dmsstudio\.in\/blog\/([^/<]+)\/index\.html<\/loc>/g)].map(m => m[1]));
  const entries = SCHEDULED.filter(a => visible(a.publishDate, now) && !existing.has(a.slug))
    .map(a => `  <url><loc>https://www.dmsstudio.in/blog/${a.slug}/index.html</loc><lastmod>${a.publishDate}</lastmod></url>`).join("\n");
  return entries ? xml.replace("</urlset>", `${entries}\n</urlset>`) : xml;
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
    const isListing = url.pathname === "/" || url.pathname === "/index.html" ||
      url.pathname === "/blog.html" || url.pathname === "/blog" || url.pathname === "/blog/";
    if (!isSitemap && !isListing) return response;
    const body = await response.text();
    const output = isSitemap ? updateSitemap(body, now) : updateListings(body, url.pathname, now);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
    return new Response(output, { status: response.status, statusText: response.statusText, headers });
  }
};
