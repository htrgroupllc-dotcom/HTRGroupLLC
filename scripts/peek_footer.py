from pathlib import Path
t = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8")
i = t.find("flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm")
print(t[i-200:i+600])
