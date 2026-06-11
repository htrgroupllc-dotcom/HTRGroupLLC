import re
from pathlib import Path
line = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_text("utf-8").splitlines()[33961]

def try_fix(s):
    if re.search(r"[\u0400-\u04ff]", s): return s
    if not re.search(r"[\u0080-\u024f]", s): return s
    try:
        fixed = s.encode("latin-1").decode("utf-8")
    except: return s
    return fixed if re.search(r"[\u0400-\u04ff]", fixed) else s

str_re = re.compile(r'"((?:[^"\\]|\\.)*)"')
out = []
for m in str_re.finditer(line):
    body=m.group(1)
    fixed=try_fix(body)
    out.append(f"changed={fixed!=body}")
Path(r"C:\Projects\HTRGroupLLC\scripts\testline2.txt").write_text("\n".join(out), encoding="utf-8")
