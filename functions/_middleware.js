// Keep scheduled publishing logic limited to the routes configured in
// cloudflare-deploy/_routes.json. Static assets bypass this middleware.
const SCHEDULED = [
  { slug: "small-home-mandir-design-mohali", publishDate: "2026-11-02" },
  { slug: "warm-winter-home-interiors-mohali", publishDate: "2026-11-09" },
  { slug: "guest-bedroom-design-indian-homes", publishDate: "2026-11-16" },
  { slug: "modular-kitchen-planning-mohali-checklist", publishDate: "2026-11-23" },
  { slug: "christmas-decor-small-indian-living-room", publishDate: "2026-11-30" },
  { slug: "office-interior-planning-mohali-2027", publishDate: "2026-12-07" },
  { slug: "ai-interior-design-vs-real-home-planning", publishDate: "2026-12-14" },
  { slug: "3bhk-interior-quotation-checklist-mohali", publishDate: "2026-12-21" },
  { slug: "plan-home-interiors-2027-renovation-timeline", publishDate: "2026-12-28" },
];

const IST = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

function isPublished(day, now = new Date()) {
  const parts = Object.fromEntries(
    IST.formatToParts(now).filter((part) => part.type !== "literal")
      .map(({ type, value }) => [type, value]),
  );
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  return today > day || (today === day && Number(parts.hour) >= 9);
}

function articleForPath(path) {
  const normalized = path.replace(/\/+$/, "").replace(/\/index\.html$/, "");
  const match = normalized.match(/^\/blog\/([^/]+)$/);
  return match ? SCHEDULED.find((article) => article.slug === match[1]) : undefined;
}

function updateListings(html, path, now) {
  const match = html.match(/<div class="journal-grid">([\s\S]*?)<\/div>/);
  if (!match) return html;
  const cards = [...match[1].matchAll(/<article\b[^>]*data-blog-date="(\d{4}-\d{2}-\d{2})"[^>]*>[\s\S]*?<\/article>/g)]
    .filter((card) => isPublished(card[1], now))
    .sort((a, b) => b[1].localeCompare(a[1]));
  const isArchive = ["/blog.html", "/blog", "/blog/"].includes(path);
  const visible = isArchive ? cards : cards.slice(0, 3);
  return html.replace(match[0], `<div class="journal-grid">${visible.map((card) => card[0]).join("")}</div>`);
}

function updateSitemap(xml, now) {
  const existing = new Set(
    [...xml.matchAll(/<loc>https:\/\/www\.dmsstudio\.in\/blog\/([^/<]+)\/index\.html<\/loc>/g)]
      .map((match) => match[1]),
  );
  const entries = SCHEDULED.filter((article) => isPublished(article.publishDate, now) && !existing.has(article.slug))
    .map((article) => `  <url><loc>https://www.dmsstudio.in/blog/${article.slug}/index.html</loc><lastmod>${article.publishDate}</lastmod></url>`)
    .join("\n");
  return entries ? xml.replace("</urlset>", `${entries}\n</urlset>`) : xml;
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const now = new Date();
  const article = articleForPath(url.pathname);
  if (article && !isPublished(article.publishDate, now)) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store",
      },
    });
  }

  const response = await next();
  if (!response.ok) return response;
  const isSitemap = url.pathname === "/sitemap.xml";
  const isListing = ["/", "/index.html", "/blog.html", "/blog", "/blog/"].includes(url.pathname);
  if (!isSitemap && !isListing) return response;

  const body = await response.text();
  const output = isSitemap ? updateSitemap(body, now) : updateListings(body, url.pathname, now);
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
  return new Response(output, { status: response.status, statusText: response.statusText, headers });
}
