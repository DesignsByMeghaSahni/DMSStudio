"""Create browser and home-screen icons from the approved DMS monogram."""
from pathlib import Path
import xml.etree.ElementTree as ET
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
PACKAGE=ROOT/'assets/brand/dms-professional-package'
SVG_SRC=PACKAGE/'SVG/dms-monogram-black.svg'
PNG_SRC=PACKAGE/'PNG/dms-monogram-black-8x.png'
ASSETS=ROOT/'assets'
root=ET.parse(SVG_SRC).getroot()
w,h=map(float,root.attrib['viewBox'].split()[2:])
scale=56/h
x=(64-w*scale)/2;y=(64-h*scale)/2
paths=''.join(ET.tostring(child,encoding='unicode') for child in list(root) if child.tag.endswith('path'))
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>DMS Studio</title><g transform="translate({x:.4f} {y:.4f}) scale({scale:.6f})">{paths}</g></svg>\n'''
(ASSETS/'favicon.svg').write_text(svg,encoding='utf-8')
source=Image.open(PNG_SRC).convert('RGBA')
def icon(size):
    height=round(size*.875);width=round(source.width*height/source.height)
    mark=source.resize((width,height),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(size,size),(0,0,0,0));canvas.alpha_composite(mark,((size-width)//2,(size-height)//2))
    return canvas
for name,size in [('favicon-32.png',32),('favicon-64.png',64),('apple-touch-icon.png',180)]:
    icon(size).save(ASSETS/name,optimize=True)
icon(64).save(ASSETS/'favicon.ico',format='ICO',sizes=[(16,16),(32,32),(48,48)])
print('Updated SVG, PNG, ICO, and Apple touch favicon assets from the approved monogram.')
