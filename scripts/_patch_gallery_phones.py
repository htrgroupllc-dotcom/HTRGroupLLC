from pathlib import Path
p = Path(r"C:/Projects/HTRGroupLLC/src/pages/gallery.tsx")
t = p.read_text(encoding="utf-8")
repls = [
    ('header-phone-pair htr-phone-pair flex flex-col gap-1 items-end',
     'header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end'),
    ('header-phone-pair htr-phone-pair flex flex-col gap-1.5 mt-1 items-start',
     'header-phone-pair flex flex-row flex-wrap gap-2 mt-1 items-start justify-start'),
]
for a,b in repls:
    if a not in t:
        raise SystemExit('missing: ' + a)
    t = t.replace(a, b)
p.write_text(t, encoding="utf-8")
print('gallery ok')
