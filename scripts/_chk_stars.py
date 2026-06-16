from pathlib import Path
c = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js").read_text(encoding="utf-8")
for icon in ["ChevronRight", "ExternalLink", "Calendar", "Clock"]:
    bad = f'{icon}, {{ className: "h-3 w-3 htr-google-star"'
    if bad in c:
        print("BAD", icon)
    else:
        print("OK", icon)
print("Star htr-google-star", c.count("Star, { key") )
print("htr-google-star total", c.count("htr-google-star"))
