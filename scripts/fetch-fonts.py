import re,subprocess
from pathlib import Path
s=Path('assets/fonts.css').read_text();Path('assets/fonts').mkdir(exist_ok=True)
for i,u in enumerate(re.findall(r'url\((.*?)\)',s)):
 p=f'assets/fonts/font-{i}.ttf';subprocess.run(['curl','-L','--fail','--silent',u,'-o',p],check=True);s=s.replace(u,'../'+p)
Path('css/fonts.css').write_text(s)
