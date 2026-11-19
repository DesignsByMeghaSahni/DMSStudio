"""Public route inventory and Cloudflare-compatible SEO output (no dependency scan)."""
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from urllib.parse import urljoin, urlsplit, urlunsplit
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://www.dmsstudio.in'
MAIN = ['index.html', 'about.html', 'services.html', 'projects.html', 'blog.html',
        'contact.html', 'faq.html', 'credits.html']

def public_paths():
    paths = [ROOT / name for name in MAIN]
    for folder in ['projects', 'services', 'blog', 'areas-we-serve']:
        paths.extend((ROOT / folder).glob('*/index.html') if folder != 'areas-we-serve'
                     else [ROOT / folder / 'index.html'])
    paths.extend(ROOT.glob('interior-designer-in-*/index.html'))
    return sorted({p for p in paths if p.is_file()})

def route(path):
    path = str(path)
    if path == 'index.html': return '/'
    if path.endswith('/index.html'): return '/' + path[:-10]
    if path.endswith('.html'): return '/' + path[:-5]
    return '/' + path.lstrip('/')

def clean_html(html, path):
    """Align links, canonical and JSON-LD IDs with Pages' existing clean redirects."""
    # Keep measurement on every generated public page, including scheduled articles.
    if 'id="dms-tag-manager"' not in html:
        html = html.replace('</head>', '<script id="dms-tag-manager" src="/js/analytics.js?v=20261119" defer></script></head>')
    metadata_file = ROOT / 'content/metadata-overrides.json'
    metadata = json.loads(metadata_file.read_text()).get(str(path), {}) if metadata_file.exists() else {}
    if metadata:
        if metadata.get('title'):
            html = re.sub(r'<title>.*?</title>', lambda _: '<title>' + escape(metadata['title']) + '</title>', html, count=1, flags=re.S)
        def meta(match):
            tag = match.group(0)
            key = re.search(r'(?:name|property)="([^"]+)"', tag)
            field = 'title' if key and key[1] in ('og:title', 'twitter:title') else 'description' if key and key[1] in ('description', 'og:description', 'twitter:description') else None
            if field and metadata.get(field):
                return re.sub(r'content="[^"]*"', lambda _: 'content="' + escape(metadata[field], quote=True) + '"', tag)
            return tag
        html = re.sub(r'<meta\b[^>]*>', meta, html)
        def schema(match):
            data = json.loads(match[1])
            for item in data.get('@graph', []):
                if item.get('@type') == 'WebPage':
                    if metadata.get('title'): item['name'] = metadata['title']
                    if metadata.get('description'): item['description'] = metadata['description']
            return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False).replace('</', '< /') + '</script>'
        html = re.sub(r'<script type="application/ld\+json">(.*?)</script>', schema, html, flags=re.S)
    mapping = {p.relative_to(ROOT).as_posix(): route(p.relative_to(ROOT)) for p in public_paths()}
    mapping.setdefault(str(path), route(path))
    # JSON-LD, canonical, Open Graph and same-domain absolute links.
    for old, new in sorted(mapping.items(), key=lambda item: -len(item[0])):
        html = html.replace(BASE + '/' + old, BASE + new)
    def href(match):
        value = match.group(1)
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc or value.startswith('#'): return match.group(0)
        resolved = urlsplit(urljoin(BASE + '/' + str(path), value))
        key = resolved.path.lstrip('/')
        if key not in mapping: return match.group(0)
        return 'href="' + urlunsplit(('', '', mapping[key], parsed.query, parsed.fragment)) + '"'
    return re.sub(r'href="([^"]+)"', href, html)

def write_sitemap():
    now = datetime.now(ZoneInfo('Asia/Kolkata'))
    schedule = {a['slug']: a['publishDate'] for a in json.loads((ROOT/'content/scheduled-articles.json').read_text())}
    urls = []
    for p in public_paths():
        rel = p.relative_to(ROOT).as_posix()
        day = schedule.get(p.parent.name) if rel.startswith('blog/') else None
        if day and (now.strftime('%Y-%m-%d') < day or
                    (now.strftime('%Y-%m-%d') == day and now.hour < 9)): continue
        urls.append(f'  <url><loc>{BASE}{escape(route(rel))}</loc></url>')
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(urls) + '\n</urlset>\n')
    return len(urls)

if __name__ == '__main__':
    for p in public_paths():
        p.write_text(clean_html(p.read_text(), p.relative_to(ROOT).as_posix()))
    print(f'Normalized {len(public_paths())} public pages; sitemap has {write_sitemap()} published URLs.')
