"""Create restrained, non-destructive photographic finishes for Essentia Salon."""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PHOTOS = ROOT / 'projects/essentia-salon/photos'
ORIGINALS = PHOTOS / 'originals'
EDITED = PHOTOS / 'edited'
EDITED.mkdir(parents=True, exist_ok=True)

# Individual exposure lifts retain the salon's warm practical lighting while
# balancing phone-camera shadows across the set.
EXPOSURE = {
    'essentia-01': 1.055,
    'essentia-03': 1.075,
    'essentia-04': 1.085,
    'essentia-05': 1.08,
    'essentia-06': 1.105,
    'essentia-07': 1.075,
    'essentia-outdoor': 1.035,
}


def finish(image, exposure):
    image = ImageOps.exif_transpose(image).convert('RGB')
    # A light gamma lift opens shadow detail without washing out highlights.
    lift = [min(255, round(255 * (value / 255) ** .975)) for value in range(256)]
    image = image.point(lift * 3)
    image = ImageEnhance.Brightness(image).enhance(exposure)
    image = ImageEnhance.Contrast(image).enhance(1.055)
    image = ImageEnhance.Color(image).enhance(1.045)
    # Neutralise a little of the indoor amber cast while keeping the lamps warm.
    red, green, blue = image.split()
    image = Image.merge('RGB', (
        red.point(lambda value: min(255, round(value * .992))),
        green,
        blue.point(lambda value: min(255, round(value * 1.012))),
    ))
    return image.filter(ImageFilter.UnsharpMask(radius=1.0, percent=48, threshold=4))


for stem, exposure in EXPOSURE.items():
    source = next((ORIGINALS / f'{stem}{suffix}' for suffix in ('.webp', '.jpg', '.jpeg', '.png')
                   if (ORIGINALS / f'{stem}{suffix}').exists()), None)
    if source is None:
        raise FileNotFoundError(f'Missing original photo: {stem}')
    image = finish(Image.open(source), exposure)
    image.save(EDITED / f'{stem}.webp', 'WEBP', quality=91, method=6)

# The cover gets its own careful wide crop, retaining the complete salon sign
# and entrance. The uncropped outdoor photo remains available in the gallery.
outdoor = finish(Image.open(ORIGINALS / 'essentia-outdoor.webp'), 1.035)
width, height = outdoor.size
crop_height = round(width / 2)
banner = outdoor.crop((0, 0, width, crop_height)).resize((1920, 960), Image.Resampling.LANCZOS)
banner = ImageEnhance.Sharpness(banner).enhance(1.08)
banner.save(EDITED / 'essentia-outdoor-banner.webp', 'WEBP', quality=92, method=6)

print(f'Created {len(EXPOSURE) + 1} edited Essentia photographs and a wide cover crop; originals preserved.')
