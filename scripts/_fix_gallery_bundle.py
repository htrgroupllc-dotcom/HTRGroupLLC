from pathlib import Path
B = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
j = B.read_text(encoding="utf-8")
# Gallery book now label
j = j.replace(
    'style: { backgroundColor: K$2.dark }, children: T.bookNow })',
    'style: { backgroundColor: K$2.dark }, children: T2.bookNow })',
    1,
)
# Gallery header bar inside Gallery function only
gi = j.find("function Gallery()")
sub = j[gi:gi+8000]
old = 'className: "container mx-auto px-4 h-14 flex items-center justify-between gap-3"'
new = 'className: "container mx-auto px-4 htr-site-header-bar htr-blog-header-bar flex flex-wrap items-center justify-between gap-x-3 gap-y-2"'
if old in sub:
    j = j[:gi] + sub.replace(old, new, 1) + j[gi+8000:]
    print("gallery header bar")
else:
    print("gallery bar skip")
B.write_text(j, encoding="utf-8")
