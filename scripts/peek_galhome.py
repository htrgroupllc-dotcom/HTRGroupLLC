from pathlib import Path
t=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8")
i=t.find("T2.galleryH2")
print(t[i-400:i+500])
