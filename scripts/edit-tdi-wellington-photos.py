"""Create restrained, geometry-preserving edits and responsive WebP assets for TDI Wellington."""
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance, ImageFilter, ImageDraw
import json, re

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / 'projects' / 'tdi-wellington-3bhk'
ORIGINALS = PROJECT / 'photos' / 'originals'
EDITED = PROJECT / 'photos' / 'edited'
OPTIMIZED = PROJECT / 'photos' / 'optimized'
EDITED.mkdir(parents=True, exist_ok=True)
OPTIMIZED.mkdir(parents=True, exist_ok=True)

def key_for(path):
    slug = re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', path.stem.lower())).strip('-')
    return 'tdi-wellington-' + slug

def enhance(source):
    im = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    # Gentle, natural interior-photo treatment: retain true finishes and the full camera frame.
    im = ImageEnhance.Brightness(im).enhance(1.035)
    im = ImageEnhance.Contrast(im).enhance(1.045)
    im = ImageEnhance.Color(im).enhance(1.035)
    im = ImageEnhance.Sharpness(im).enhance(1.12)
    return im

records=[]
for source in sorted(ORIGINALS.iterdir()):
    if source.suffix.lower() not in {'.jpg','.jpeg'}:
        continue
    key=key_for(source)
    im=enhance(source)
    edited=EDITED / f'{key}.jpg'
    im.save(edited, 'JPEG', quality=96, subsampling=0, optimize=True, progressive=True)
    variants={}
    for width in (640,1280,1920):
        scale=min(1.0, width/im.width)
        out=im if scale==1.0 else im.resize((width,round(im.height*scale)),Image.Resampling.LANCZOS)
        target=OPTIMIZED / f'{key}-{width}.webp'
        out.save(target,'WEBP',quality=87,method=6)
        variants[str(width)]={'width':out.width,'height':out.height}
    records.append({'key':key,'source':source.name,'edited':str(edited.relative_to(ROOT)),'variants':variants})

# Internal visual check sheet, outside the website.
thumb_w,thumb_h=360,260
cols=4; rows=(len(records)+cols-1)//cols
sheet=Image.new('RGB',(cols*thumb_w,rows*(thumb_h+34)),(245,242,236))
draw=ImageDraw.Draw(sheet)
for i,item in enumerate(records):
    im=Image.open(ROOT/item['edited'])
    im.thumbnail((thumb_w-12,thumb_h-12),Image.Resampling.LANCZOS)
    x=(i%cols)*thumb_w+(thumb_w-im.width)//2
    y=(i//cols)*(thumb_h+34)+(thumb_h-im.height)//2
    sheet.paste(im,(x,y))
    draw.text(((i%cols)*thumb_w+8,(i//cols)*(thumb_h+34)+thumb_h+2),item['source'][:48],fill=(35,32,28))
sheet.save('/private/tmp/tdi-wellington-contact.jpg',quality=88)
(ROOT/'assets'/'tdi-wellington-photo-map.json').write_text(json.dumps(records,indent=2)+'\n')
print(f'Edited {len(records)} photographs; responsive variants created; contact sheet: /private/tmp/tdi-wellington-contact.jpg')
