"""Create natural, full-resolution editorial grades and responsive WebP files."""
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import json

ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'projects/sachdeva-125/photos/originals'
EDITED=ROOT/'projects/sachdeva-125/photos/edited'
OPT=ROOT/'projects/sachdeva-125/photos/optimized'
EDITED.mkdir(parents=True,exist_ok=True); OPT.mkdir(parents=True,exist_ok=True)
ASSETS={
 '23b53809-d38c-4d1d-98d8-524dfe65789e.JPG':'sachdeva-125-living-room-wide',
 'IMG_0985.JPG':'sachdeva-125-tv-wall-install-01',
 'IMG_0986.JPG':'sachdeva-125-tv-wall-install-02',
 'IMG_0988.JPG':'sachdeva-125-mandir-01',
 'IMG_1465.JPG':'sachdeva-125-living-divider',
 'IMG_1466.JPG':'sachdeva-125-tv-wall-01',
 'IMG_1467.JPG':'sachdeva-125-tv-wall-02',
 'IMG_1468.JPG':'sachdeva-125-tv-wall-03',
 'IMG_1469.JPG':'sachdeva-125-wardrobe-install',
 'IMG_1471.JPG':'sachdeva-125-kitchen-install-01',
 'IMG_1472.JPG':'sachdeva-125-kitchen-install-02',
 'IMG_2692.JPG':'sachdeva-125-blue-bedroom-01',
 'IMG_2693.JPG':'sachdeva-125-blue-bedroom-02',
 'IMG_2694.JPG':'sachdeva-125-blue-bedroom-03',
 'IMG_2695.JPG':'sachdeva-125-blue-bedroom-wide-01',
 'IMG_2696.JPG':'sachdeva-125-blue-bedroom-wide-02',
 'IMG_2700.JPG':'sachdeva-125-rose-bedroom-detail',
 'IMG_2701.JPG':'sachdeva-125-rose-bedroom-01',
 'IMG_2702.JPG':'sachdeva-125-rose-bedroom-02',
 'IMG_2703.jpg':'sachdeva-125-rose-bedroom-03',
 'IMG_2704.JPG':'sachdeva-125-rose-bedroom-04',
 'IMG_2707.JPG':'sachdeva-125-living-room-final-01',
 'IMG_2708.JPG':'sachdeva-125-living-room-final-02',
 'c819a1ea-4b8b-4c99-90c6-5d23aba1b4c9.JPG':'sachdeva-125-living-dining-wide-01',
 'cb2d7f74-4451-4cbe-b11e-deac814f0bfc.JPG':'sachdeva-125-living-dining-wide-02',
 'feb76419-0ccb-4c91-bfa3-8096a9c1e735.JPG':'sachdeva-125-formal-living-wide',
}
metadata=json.loads((ROOT/'assets/image-dimensions.json').read_text())
for file,key in ASSETS.items():
 im=ImageOps.exif_transpose(Image.open(SOURCE/file)).convert('RGB')
 lum=ImageOps.grayscale(im).resize((1,1)).getpixel((0,0))
 exposure=1.09 if lum<85 else 1.055 if lum<120 else 1.025 if lum<155 else 1.0
 im=ImageEnhance.Brightness(im).enhance(exposure)
 im=ImageEnhance.Contrast(im).enhance(1.065)
 im=ImageEnhance.Color(im).enhance(1.055)
 # A restrained warm-neutral balance suited to interior photography and renders.
 r,g,b=im.split(); im=Image.merge('RGB',(r.point(lambda p:min(255,round(p*1.012))),g,b.point(lambda p:min(255,round(p*.989)))) )
 im=im.filter(ImageFilter.UnsharpMask(radius=1.15,percent=58,threshold=3))
 out=EDITED/f'{key}.jpg'; im.save(out,'JPEG',quality=96,subsampling=0,optimize=True,progressive=True)
 variants={}
 for requested in (640,1280,1920):
  web=im.copy();web.thumbnail((requested,10000))
  web.save(OPT/f'{key}-{requested}.webp','WEBP',quality=86 if requested==1920 else 83,method=5)
  variants[str(requested)]={'width':web.width,'height':web.height}
 metadata[key]=variants
 print(key, im.width,im.height)
(ROOT/'assets/image-dimensions.json').write_text(json.dumps(metadata,indent=2)+'\n')
print('Completed',len(ASSETS),'enhanced images and responsive variants')
