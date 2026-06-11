from pathlib import Path
t=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8")
key="const PHONE_HREF$2"
print(t[t.find(key)-80:t.find(key)+200])
