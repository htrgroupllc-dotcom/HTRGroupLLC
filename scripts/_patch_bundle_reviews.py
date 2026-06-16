from pathlib import Path
p = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
t = p.read_text(encoding="utf-8")
repls = [
    ('className: "h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"',
     'className: "h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"'),
    ("line-clamp-4", "line-clamp-3"),
    ('className: "bg-white rounded-lg p-2.5 md:p-3 shadow-sm border border-stone-100 flex flex-col h-full min-h-0"',
     'className: "bg-white rounded-lg p-2 md:p-2.5 shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card"'),
]
for a,b in repls:
    if a not in t:
        print("missing:", a[:60])
    t = t.replace(a,b)
p.write_text(t, encoding="utf-8")
print("ok")
