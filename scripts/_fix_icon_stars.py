from pathlib import Path
p = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
c = p.read_text(encoding="utf-8")
old = 'className: "h-3 w-3 htr-google-star", style: { color: "#FBBC04", fill: "#FBBC04" }'
new = 'className: "h-3 w-3"'
icons = ["ChevronRight", "ExternalLink", "Calendar", "Clock", "ChevronLeft", "MapPin", "Phone", "Mail", "ArrowRight", "Check", "Star"]
for icon in icons:
    if icon == "Star":
        continue
    needle = f"jsx({icon}, {{ {old} }})"
    repl = f"jsx({icon}, {{ {new} }})"
    c = c.replace(needle, repl)
    needle2 = f"jsxRuntimeExports.jsx({icon}, {{ {old} }})"
    repl2 = f"jsxRuntimeExports.jsx({icon}, {{ {new} }})"
    c = c.replace(needle2, repl2)
p.write_text(c, encoding="utf-8")
print("done")
