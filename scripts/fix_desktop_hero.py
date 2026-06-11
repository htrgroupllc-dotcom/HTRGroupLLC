from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx")
h = p.read_text(encoding="utf-8")
old = '''                  <a href={PHONE_HREF} className="inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm mb-4" style={{ backgroundColor: K.accent }}>
                    <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
                  </a>'''
new = '''                  <div className="mb-4"><PhonePair compact /></div>'''
if old in h:
    h = h.replace(old, new, 1)
    p.write_text(h, encoding="utf-8")
    print("fixed desktop hero")
else:
    print("desktop hero not found")
