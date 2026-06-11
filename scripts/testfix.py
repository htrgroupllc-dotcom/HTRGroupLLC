import re
from pathlib import Path
line = Path(r"C:\Projects\HTRGroupLLC\assets\index-Wa5559554342-v2.js").read_text("utf-8").splitlines()[35901]
m=re.search(r'"([^"]*)"', line)
body=m.group(1)
Path(r"C:\Projects\HTRGroupLLC\scripts\body_repr.txt").write_text(repr(body), encoding="utf-8")

def try_fix(s):
    if re.search(r"[\u0400-\u04ff]", s): return s
    if not re.search(r"[\u0080-\u024f]", s): return s
    parts = []
    i = 0
    changed = False
    while i < len(s):
        chunk = []
        while i < len(s):
            c = s[i]
            try:
                c.encode("latin-1")
                chunk.append(c)
                i += 1
            except UnicodeEncodeError:
                break
        if chunk:
            seg = "".join(chunk)
            try:
                fixed = seg.encode("latin-1").decode("utf-8")
                if re.search(r"[\u0400-\u04ff]", fixed):
                    parts.append(fixed)
                    changed = True
                else:
                    parts.append(seg)
            except:
                parts.append(seg)
        if i < len(s):
            parts.append(s[i])
            i += 1
    return "".join(parts) if changed else s

fixed=try_fix(body)
Path(r"C:\Projects\HTRGroupLLC\scripts\body_fixed.txt").write_text(repr(fixed), encoding="utf-8")
