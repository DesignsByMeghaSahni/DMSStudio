"""One-time download of owner-authorised DMS imagery. No competitor assets."""
from html.parser import HTMLParser
from pathlib import Path
import json,subprocess,concurrent.futures
class Images(HTMLParser):
 def __init__(self):super().__init__();self.urls=[]
 def handle_starttag(self,t,a):
  d=dict(a);s=d.get('src','').split('/v1/')[0]
  if t=='img' and 'b48564' in s and not s.endswith('.png') and s not in self.urls:self.urls.append(s)
items=[]
for project in ['babbar','essentia','opera']:
 p=Images();p.feed(Path('research/'+project+'.html').read_text())
 for i,u in enumerate(p.urls[:7]):items.append({'name':f'{project}-{i+1:02d}','url':u,'source':'https://www.dmsstudio.in/projects/'+{'babbar':'babbar-residency','essentia':'essentia-salon','opera':'operahousemohali'}[project]})
items.append({'name':'megha-sahni','url':'https://static.wixstatic.com/media/b48564_a9dcc907e6714fcd90510ddbd4bbe371~mv2.jpg','source':'https://www.dmsstudio.in/about-us'})
Path('assets/originals').mkdir(exist_ok=True)
def get(x):
 path='assets/originals/'+x['name']+Path(x['url']).suffix
 subprocess.run(['curl','-L','--fail','--silent','--max-time','40',x['url'],'-o',path],check=True)
 return path
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for p in pool.map(get,items): print(p)
Path('assets/sources.json').write_text(json.dumps(items,indent=2))
