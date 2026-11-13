"""Dependency-free checks for every generated HTML page and its local assets."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re
root=Path(__file__).resolve().parent.parent
from seo_public import public_paths
pages=public_paths()
errors=[];titles=[];descriptions=[];canonicals=[];links=0
class Inspect(HTMLParser):
 def __init__(self):super().__init__();self.h1=0;self.title='';self.intitle=False;self.meta={};self.refs=[];self.ids=[];self.images=0;self.json=False;self.jsontext='';self.schemas=[];self.canonical=''
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='h1':self.h1+=1
  if t=='title':self.intitle=True
  if t=='meta':self.meta[d.get('name',d.get('property'))]=d.get('content')
  if t=='link' and d.get('rel')=='canonical':self.canonical=d.get('href','')
  if 'id' in d:self.ids.append(d['id'])
  if t in ['img','script','link','a']:
   for k in ['src','href']:
    if d.get(k):self.refs.append(d[k])
  if t=='img':
   self.images+=1
   if 'alt' not in d:errors.append('Missing image alt')
   for x in d.get('srcset','').split(','):
    if x.strip():self.refs.append(x.strip().split(' ')[0])
  if t=='script' and d.get('type')=='application/ld+json':self.json=True;self.jsontext=''
 def handle_endtag(self,t):
  if t=='title':self.intitle=False
  if t=='script' and self.json:
   self.schemas.append(json.loads(self.jsontext));self.json=False
 def handle_data(self,d):
  if self.intitle:self.title+=d
  if self.json:self.jsontext+=d
for p in pages:
 html=p.read_text()
 x=Inspect();x.feed(html);titles.append(x.title);descriptions.append(x.meta.get('description'));canonicals.append(x.canonical)
 if re.search(r'\{(?:acard|eyebrow|link)\(',html):errors.append(f'{p}: unrendered template text')
 if x.h1!=1:errors.append(f'{p}: {x.h1} H1s')
 if len(set(x.ids))!=len(x.ids):errors.append(f'{p}: duplicate IDs')
 if not x.meta.get('description') or not x.schemas:errors.append(f'{p}: missing SEO')
 for ref in x.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  path=(root/unquote(u.path).lstrip('/') if u.path.startswith('/') else p.parent/unquote(u.path)) if u.path else p
  if not u.path.endswith('/') and not path.suffix and path.with_suffix('.html').exists():path=path.with_suffix('.html')
  elif path.is_dir():path=path/'index.html'
  elif not path.exists() and not path.suffix:path=path.with_suffix('.html')
  links+=1
  if not path.exists():errors.append(f'{p.relative_to(root)} -> missing {ref}')
  if u.fragment and path==p and u.fragment not in x.ids:errors.append(f'{p}: missing #{u.fragment}')
for label,values in [('title',titles),('description',descriptions)]:
 if len(set(values))!=len(values):errors.append('Duplicate '+label)
if len(set(canonicals))!=len(canonicals):errors.append('Duplicate canonical URL')
for css in (root/'css').glob('*.css'):
 for ref in re.findall(r'url\([\'"]?([^\)\'\"]+)',css.read_text()):
  if not (css.parent/ref).exists():errors.append('Missing CSS asset '+ref)
print(json.dumps({'publicPages':len(pages),'localReferencesChecked':links,'uniqueTitles':len(set(titles)),'uniqueDescriptions':len(set(descriptions)),'uniqueCanonicals':len(set(canonicals)),'errors':errors},indent=2))
raise SystemExit(bool(errors))
