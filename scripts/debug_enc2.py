import re
from pathlib import Path

def try_fix(s):
    if re.search(r"[\u0400-\u04ff]", s):
        return s
    if not re.search(r"[\u0080-\u024f]", s):
        return s
    try:
        fixed = s.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s
    if re.search(r"[\u0400-\u04ff]", fixed):
        return fixed
    return s

t = Path(r"C:\Projects\HTRGroupLLC\assets\index-Wa5559554342-v2.js").read_text("utf-8")
str_re = re.compile(r'"((?:[^"\\]|\\.)*)"')
total_moji = 0
unfixed = []
for m in str_re.finditer(t):
    body = m.group(1)
    if "\u00d0" in body or "\u00d1" in body:
        total_moji += 1
        if try_fix(body) == body:
            unfixed.append(body[:60])

out = Path(r"C:\Projects\HTRGroupLLC\scripts\debug_out.txt")
out.write_text(f"total_moji={total_moji}\nunfixed={len(unfixed)}\n" + "\n---\n".join(unfixed[:20]), encoding="utf-8")
