"""Make natural, full-resolution web editorial grades for the Falcon 66 project."""
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import json

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'projects/falcon-66/photos/originals'
OUTPUT = ROOT / 'projects/falcon-66/photos/edited'
OUTPUT.mkdir(parents=True, exist_ok=True)

# Descriptive asset keys; source files remain untouched and separately archived.
ASSETS = {
    'IMG_3525.JPG': 'falcon-66-puja-vanity',
    'IMG_3527.JPG': 'falcon-66-puja-room-01',
    'IMG_3528.JPG': 'falcon-66-puja-room-02',
    'IMG_3531.JPG': 'falcon-66-puja-room-03',
    'IMG_3532.JPG': 'falcon-66-puja-room-04',
    'IMG_3533.JPG': 'falcon-66-display-shelf-01',
    'IMG_3534.JPG': 'falcon-66-display-shelf-02',
    'IMG_3535.JPG': 'falcon-66-display-shelf-03',
    'PHOTO-2024-12-02-18-46-52.jpg': 'falcon-66-living-room-01',
    'PHOTO-2024-12-02-18-46-52 2.jpg': 'falcon-66-living-room-02',
    'PHOTO-2024-12-02-18-46-52 3.jpg': 'falcon-66-bedroom-01',
    'PHOTO-2024-12-02-18-46-52 4.jpg': 'falcon-66-dining-room',
    'PHOTO-2024-12-02-18-46-52 5.jpg': 'falcon-66-living-room-03',
    'PHOTO-2024-12-02-18-46-52 6.jpg': 'falcon-66-living-room-wide',
    'PHOTO-2024-12-02-18-46-52 7.jpg': 'falcon-66-bedroom-02',
    'PHOTO-2024-12-03-17-00-32.jpg': 'falcon-66-bedroom-headboard',
    'PHOTO-2024-12-03-17-00-42.jpg': 'falcon-66-bedroom-wardrobe',
}

for filename, key in ASSETS.items():
    im = ImageOps.exif_transpose(Image.open(SOURCE / filename)).convert('RGB')
    # Lift dim interiors more than already bright frames while protecting highlights.
    luminance = ImageOps.grayscale(im).resize((1, 1)).getpixel((0, 0))
    lift = 1.12 if luminance < 90 else 1.085 if luminance < 115 else 1.055 if luminance < 145 else 1.025
    im = ImageEnhance.Brightness(im).enhance(lift)
    im = ImageEnhance.Contrast(im).enhance(1.055)
    im = ImageEnhance.Color(im).enhance(1.045)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=62, threshold=3))
    dest = OUTPUT / f'{key}.jpg'
    im.save(dest, 'JPEG', quality=96, subsampling=0, optimize=True, progressive=True)
    print(f'{dest.relative_to(ROOT)} {im.width}x{im.height}')

# Refresh only these project keys in the responsive image dimension registry.
metadata_path = ROOT / 'assets/image-dimensions.json'
metadata = json.loads(metadata_path.read_text())
for path in sorted(OUTPUT.glob('*.jpg')):
    im = Image.open(path)
    variants = {}
    for requested in (640, 1280, 1920):
        out = im.copy()
        out.thumbnail((requested, 10000))
        target = ROOT / 'projects/falcon-66/photos/optimized' / f'{path.stem}-{requested}.webp'
        target.parent.mkdir(parents=True, exist_ok=True)
        out.save(target, 'WEBP', quality=84 if requested == 1920 else 81, method=5)
        variants[str(requested)] = {'width': out.width, 'height': out.height}
    metadata[path.stem] = variants
metadata_path.write_text(json.dumps(metadata, indent=2) + '\n')
print('Created 17 edited photos and responsive display variants.')
