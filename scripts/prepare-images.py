from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
sheet=Image.new('RGB',(1000,((len(list(Path('assets/originals').glob('*')))+3)//4)*220),'#f3f0e9')
draw=ImageDraw.Draw(sheet)
for i,p in enumerate(sorted(Path('assets/originals').glob('*'))):
 im=ImageOps.exif_transpose(Image.open(p)).convert('RGB')
 for width in [640,1280,1920]:
  out=im.copy();out.thumbnail((width,width));out.save(f'images/{p.stem}-{width}.webp','WEBP',quality=83 if width==1920 else 79,method=6)
 preview=ImageOps.contain(im,(240,185));x=(i%4)*250;y=(i//4)*220
 sheet.paste(preview,(x,y));draw.text((x+5,y+189),p.stem,fill='#302b25')
sheet.save('research/contact-sheet.jpg')
