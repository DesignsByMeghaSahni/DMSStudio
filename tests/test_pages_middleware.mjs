import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../functions/_middleware.js", import.meta.url), "utf8");
const middleware = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

const futurePath = "/blog/small-home-mandir-design-mohali/index.html";

const hidden = await middleware.onRequest({
  request: new Request(`https://www.dmsstudio.in${futurePath}`),
  next: async () => { throw new Error("Unpublished article should not reach static assets"); },
});
assert.equal(hidden.status, 404);
assert.equal(hidden.headers.get("X-Robots-Tag"), "noindex, nofollow");
assert.equal(hidden.headers.get("Cache-Control"), "no-store");

let nextCalls = 0;
const staticPassThrough = await middleware.onRequest({
  request: new Request("https://www.dmsstudio.in/projects/", { method: "GET" }),
  next: async () => {
    nextCalls += 1;
    return new Response("static page", { status: 200 });
  },
});
assert.equal(staticPassThrough.status, 200);
assert.equal(await staticPassThrough.text(), "static page");
assert.equal(nextCalls, 1);

const listing = '<div class="journal-grid"><article data-blog-date="2026-01-01">live</article><article data-blog-date="2026-11-02">future</article></div>';
const homepage = await middleware.onRequest({
  request: new Request("https://www.dmsstudio.in/"),
  next: async () => new Response(listing, { headers: { "Content-Type": "text/html" } }),
});
const html = await homepage.text();
assert.match(html, /2026-01-01/);
assert.doesNotMatch(html, /2026-11-02/);
assert.equal(homepage.headers.get("Cache-Control"), "public, max-age=60, s-maxage=60");

console.log("Pages middleware checks passed: scheduled article gate, pass-through, and future listing filter.");
