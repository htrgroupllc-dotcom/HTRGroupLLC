from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
t = p.read_text(encoding="utf-8")
# desktop hero might still be single link - count mb-4 phone links
print("hero blocks", t.count("inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm mb-4"))
# patch gallery header if not done
gal_header = 'href: PHONE_HREF$2, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm"'
print("gal header count", t.count(gal_header))
