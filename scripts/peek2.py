from pathlib import Path
t = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8")
print(t[t.find("const PHONE_DISPLAY$3"):t.find("const PHONE_HREF$3")+80])
