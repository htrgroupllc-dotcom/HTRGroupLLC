from pathlib import Path

root = Path(r"C:\Projects\HTRGroupLLC")

hp = root / "src/pages/home.tsx"
t = hp.read_text(encoding="utf-8")
t = t.replace(
    '<div className="grid lg:grid-cols-[2fr_3fr] gap-8 items-center">',
    '<div className="grid lg:grid-cols-[2fr_3fr] gap-8 items-start htr-home-split-grid">',
)
t = t.replace(
    'className="block rounded-xl overflow-hidden shadow-lg group htr-home-split-photo__frame"',
    'className="block rounded-xl overflow-visible shadow-lg group htr-home-split-photo__frame"',
)
hp.write_text(t, encoding="utf-8")
print("home.tsx ok")

addon = """
.htr-home-why-section .htr-home-split-grid,
.htr-home-our-work-section .htr-home-split-grid {
  align-items: start;
}
.htr-home-why-section .htr-home-split-photo,
.htr-home-our-work-section .htr-home-split-photo,
.htr-home-split-photo__frame {
  overflow: visible;
}
"""
marker = "  object-fit: contain;\n}"
for rel in ["src/index.css", "assets/index-_bdQPowM.css"]:
    p = root / rel
    cs = p.read_text(encoding="utf-8-sig" if "src/" in rel else "utf-8")
    if "htr-home-split-grid" not in cs and marker in cs:
        cs = cs.replace(marker, "  object-fit: contain;\n}" + addon)
        p.write_text(cs, encoding="utf-8")
        print(rel, "ok")

js = root / "assets/index-utf8-v4.js"
j = js.read_text(encoding="utf-8")
for sec in ["htr-home-why-section", "htr-home-our-work-section"]:
    needle = f'className: "py-10 bg-white {sec}"'
    idx = j.find(needle)
    if idx < 0:
        raise SystemExit(f"missing {sec}")
    sub = j[idx : idx + 900]
    sub2 = sub.replace(
        "grid lg:grid-cols-[2fr_3fr] gap-8 items-center",
        "grid lg:grid-cols-[2fr_3fr] gap-8 items-start htr-home-split-grid",
        1,
    )
    j = j[:idx] + sub2 + j[idx + 900 :]
j = j.replace(
    'className: "block rounded-xl overflow-hidden shadow-lg group htr-home-split-photo__frame"',
    'className: "block rounded-xl overflow-visible shadow-lg group htr-home-split-photo__frame"',
)
js.write_text(j, encoding="utf-8")
print("bundle ok")
