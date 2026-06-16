from pathlib import Path

home = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx")
text = home.read_text(encoding="utf-8")
import_line = 'import ourWorkSectionImg from "@assets/our-work-section-65084024.png";\n'
if "our-work-section-65084024" not in text:
    marker = 'import g62  from "@assets/photo_62_2026-04-02_02-47-29_1775273301589.jpg";\n'
    if marker not in text:
        raise SystemExit("g62 import marker not found")
    text = text.replace(marker, marker + import_line)
old = "  { src: g62,  captionEn:"
new = "  { src: ourWorkSectionImg,  captionEn:"
if old not in text:
    raise SystemExit("GALLERY_PHOTOS[0] g62 entry not found")
text = text.replace(old, new, 1)
home.write_text(text, encoding="utf-8", newline="\n")
print("home.tsx OK")

bundle = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
b = bundle.read_text(encoding="utf-8")
our_const = 'const ourWorkSectionImg = "/assets/our-work-section-65084024.png";\n'
if "ourWorkSectionImg" not in b:
    g62_line = 'const g62 = "/assets/photo_62_2026-04-02_02-47-29_1775273301589-Ds2r63q0.jpg";\n'
    if g62_line not in b:
        raise SystemExit("g62 const not found in bundle")
    b = b.replace(g62_line, g62_line + our_const)
old1 = "const GALLERY_PHOTOS$1 = [\n  { src: g62, captionEn:"
new1 = "const GALLERY_PHOTOS$1 = [\n  { src: ourWorkSectionImg, captionEn:"
if old1 not in b:
    raise SystemExit("GALLERY_PHOTOS$1 first entry not found")
b = b.replace(old1, new1, 1)
bundle.write_text(b, encoding="utf-8", newline="\n")
print("bundle OK")
