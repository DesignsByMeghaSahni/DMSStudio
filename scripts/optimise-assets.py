from pathlib import Path
from PIL import Image,ImageOps
import json,re
metadata={}
sources=list(Path('assets/originals').glob('*'))
for project_photos in Path('projects').glob('*/photos'):
 sources.extend((project_photos/'originals').glob('*'))
 sources.extend((project_photos/'edited').glob('*'))
for path in sources:
 if not path.is_file() or path.suffix.lower() not in {'.jpg','.jpeg','.png','.webp','.tif','.tiff'}: continue
 project_slug=None
 if 'projects' in path.parts:
  project_slug=path.parts[path.parts.index('projects')+1]
 out_dir=Path('projects')/project_slug/'photos'/'optimized' if project_slug else Path('images')
 out_dir.mkdir(parents=True,exist_ok=True)
 im=ImageOps.exif_transpose(Image.open(path)).convert('RGB');variants={}
 for requested in [640,1280,1920]:
  out=im.copy();out.thumbnail((requested,10000));name=out_dir/f'{path.stem}-{requested}.webp'
  out.save(name,'WEBP',quality=82 if requested==1920 else 79,method=6)
  variants[str(requested)]={'width':out.width,'height':out.height}
 metadata[path.stem]=variants
Path('assets/image-dimensions.json').write_text(json.dumps(metadata,indent=2))
print('Optimised responsive images')
