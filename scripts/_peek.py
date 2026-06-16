from pathlib import Path
t = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx").read_text(encoding="utf-8")
j = t.find('id="about"')
print(repr(t[j-300:j+100]))
