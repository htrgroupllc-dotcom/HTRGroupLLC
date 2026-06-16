from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
j = p.read_text(encoding="utf-8")
old = "grid lg:grid-cols-[2fr_3fr] gap-8 items-center"
new = "grid lg:grid-cols-[2fr_3fr] gap-8 items-start htr-home-split-grid"
for sec in ["htr-home-why-section", "htr-home-our-work-section"]:
    key = f'className: "py-10 bg-white {sec}"'
    i = j.find(key)
    if i < 0:
        raise SystemExit("missing " + sec)
    chunk = j[i : i + 1200]
    if old not in chunk:
        raise SystemExit("no grid in " + sec)
    chunk2 = chunk.replace(old, new, 1)
    j = j[:i] + chunk2 + j[i + 1200 :]
j = j.replace(
    'className: "block rounded-xl overflow-hidden shadow-lg group htr-home-split-photo__frame"',
    'className: "block rounded-xl overflow-visible shadow-lg group htr-home-split-photo__frame"',
)
p.write_text(j, encoding="utf-8")
print("ok")
