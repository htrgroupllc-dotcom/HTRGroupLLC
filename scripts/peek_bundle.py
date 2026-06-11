from pathlib import Path
t = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8")
key = "const PHONE_HREF$3"
i = t.find(key)
print("idx", i)
print(t[i:i+500])
