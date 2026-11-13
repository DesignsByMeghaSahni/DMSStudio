"""Create a clean Cloudflare Pages Advanced Mode upload folder."""
from pathlib import Path
from shutil import copy2, copytree, rmtree
import argparse
import json
from seo_public import public_paths

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument(
    "--functions",
    action="store_true",
    help="Prepare a Pages Functions package that routes only dynamic publishing URLs.",
)
args = parser.parse_args()
DEST = ROOT / ("cloudflare-functions-deploy" if args.functions else "cloudflare-deploy")

if DEST.exists():
    rmtree(DEST)
DEST.mkdir()


def copy_file(path):
    target = DEST / path
    target.parent.mkdir(parents=True, exist_ok=True)
    copy2(ROOT / path, target)


for path in public_paths():
    copy_file(path.relative_to(ROOT))
for path in [ROOT / "404.html", *ROOT.glob("google*.html")]:
    if path.is_file(): copy_file(path.relative_to(ROOT))
copy_file(Path("_redirects"))
for name in (("robots.txt", "sitemap.xml") if args.functions else ("_worker.js", "robots.txt", "sitemap.xml")):
    copy_file(Path(name))

if args.functions:
    # Only invoke middleware for pages whose output is actually time-sensitive.
    # Published blog articles are ordinary static pages and should not consume
    # a Functions request when crawlers visit them.
    scheduled = json.loads((ROOT / "content/scheduled-articles.json").read_text())
    include = ["/", "/index.html", "/blog", "/blog/", "/blog.html", "/sitemap.xml"]
    for article in scheduled:
        article_path = f"/blog/{article['slug']}"
        include.extend((article_path, f"{article_path}/*"))
    # Pages Functions are deployed by Wrangler from the project root's
    # /functions directory; this manifest keeps all unrelated static URLs out.
    (DEST / "_routes.json").write_text(json.dumps({
        "version": 1,
        "include": include,
        "exclude": [],
    }, indent=2) + "\n")

public_pages = (
    "areas-we-serve", "interior-designer-in-chandigarh", "interior-designer-in-kharar",
    "interior-designer-in-mohali", "interior-designer-in-new-chandigarh",
    "interior-designer-in-panchkula", "interior-designer-in-zirakpur", "services", "blog",
)
for folder in public_pages:
    for path in (ROOT / folder).rglob("*.html"):
        copy_file(path.relative_to(ROOT))

for folder in ("css", "js", "images"):
    copytree(ROOT / folder, DEST / folder,
             ignore=lambda _directory, names: [name for name in names if name == ".DS_Store"])

runtime_assets = (
    "assets/favicon.svg", "assets/favicon-32.png", "assets/favicon-64.png", "assets/favicon.ico",
    "assets/apple-touch-icon.png", "assets/brand/dms-megha-sahni-approved.png",
    "assets/brand/dms-megha-sahni-white-header.png",
)
for path in runtime_assets:
    copy_file(Path(path))
copytree(ROOT / "assets/fonts", DEST / "assets/fonts",
         ignore=lambda _directory, names: [name for name in names
                                           if name.endswith(".ttf") or name == ".DS_Store"])

# Keep the web-optimized project media only; source originals remain in the working copy.
for project in (ROOT / "projects").iterdir():
    if not project.is_dir():
        continue
    target = DEST / "projects" / project.name
    target.mkdir(parents=True, exist_ok=True)
    page = project / "index.html"
    if page.exists():
        copy2(page, target / "index.html")
    for folder in ("photos/optimized", "videos/optimized", "videos/posters", "visualizations"):
        source = project / folder
        if source.exists():
            copytree(source, target / folder, dirs_exist_ok=True,
                     ignore=lambda _directory, names: [name for name in names if name == ".DS_Store"])

files = [path for path in DEST.rglob("*") if path.is_file()]
total = sum(path.stat().st_size for path in files)
print(f"Prepared {len(files)} site files ({total:,} bytes) at {DEST}")
