from pathlib import Path
import urllib.request,re,html,json,concurrent.futures,subprocess
assets=[('home-editorial','BOYGjCdPx9o','Clay Banks'),('service-residential','6japTIjUQoI','Francesca Tosolini'),('service-turnkey','7pvC_d2iXSE','Clay Banks'),('service-commercial','lDlU1zbjGQA','Christian Mackie'),('blog-personal-home','L7EwHkq1B2s','Kara Eads'),('blog-layered-light','OTbXPnR-eb8','Angelo Pantazis'),('blog-design-brief','5H2ketFL1LE','artist credit on source page'),('service-kitchen','f888opoBHUo','Im3rd Media')]
def fetch(item):
 name,id,author=item;slugs={'BOYGjCdPx9o':'modern-living-room-with-large-windows-overlooking-garden-','6japTIjUQoI':'living-room-interior-','7pvC_d2iXSE':'a-living-room-filled-with-furniture-and-large-windows-','lDlU1zbjGQA':'table-lamp-on-desk-inside-room-','L7EwHkq1B2s':'living-room-','OTbXPnR-eb8':'table-lamp-turned-on-beside-unlit-candle-','5H2ketFL1LE':'white-table-lamp-on-white-table-','f888opoBHUo':'living-room-photograph-'};url='https://unsplash.com/photos/'+slugs[id]+id
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
 source=subprocess.check_output(['curl','-L','--fail','-s',url]).decode()
 Path('research/unsplash-'+id+'.html').write_text(source)
 match=re.search(r'<meta[^>]*property="og:image"[^>]*content="([^"]+)"',source)
 if not match: raise Exception(name+' no image')
 image=html.unescape(match.group(1)).split('?')[0]+'?auto=format&fit=max&w=2400&q=90'
 subprocess.run(['curl','-L','--fail','-s',image,'-o','assets/originals/'+name+'.jpg'],check=True)
 return dict(name=name,author=author,page=url,image=image,license='https://unsplash.com/license',usage='Editorial inspiration; not a DMS project')
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 out=list(pool.map(fetch,assets))
Path('assets/editorial-sources.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
