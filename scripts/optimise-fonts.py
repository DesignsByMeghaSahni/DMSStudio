"""Optional maintainer utility: pip install fonttools brotli in a temporary venv."""
from pathlib import Path
from fontTools import subset
css=Path('css/fonts.css').read_text()
for path in Path('assets/fonts').glob('*.ttf'):
 options=subset.Options();options.flavor='woff2'
 font=subset.load_font(str(path),options)
 sub=subset.Subsetter(options=options)
 sub.populate(unicodes=list(range(0x20,0x100))+list(range(0x2000,0x2070))+[0x2191,0x2192,0x2193,0x2197,0x20b9])
 sub.subset(font);subset.save_font(font,str(path.with_suffix('.woff2')),options)
 css=css.replace(path.name,path.with_suffix('.woff2').name).replace("format('truetype')","format('woff2')")
Path('css/fonts.css').write_text(css)
print('TTF bytes:',sum(p.stat().st_size for p in Path('assets/fonts').glob('*.ttf')))
print('WOFF2 bytes:',sum(p.stat().st_size for p in Path('assets/fonts').glob('*.woff2')))
