from pathlib import Path
t=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8")
import re
for m in re.finditer(r'inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm mb-4', t):
    print("---")
    print(t[m.start()-100:m.start()+350])
