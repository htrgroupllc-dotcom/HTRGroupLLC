import re
from pathlib import Path
line = Path(r"C:\Projects\HTRGroupLLC\assets\index-Wa5559554342-v2.js").read_text("utf-8").splitlines()[35901]
body = re.search(r'"([^"]*)"', line).group(1)

def try_fix(s):
    if re.search(r"[\u0400-\u04ff]", s): return s
    parts, i, changed = [], 0, False
    while i < len(s):
        chunk = []
        while i < len(s):
            try:
                s[i].encode("latin-1")
                chunk.append(s[i]); i += 1
            except UnicodeEncodeError:
                break
        if chunk:
            seg = "".join(chunk)
            try:
                fixed = seg.encode("latin-1").decode("utf-8")
                if re.search(r"[\u0400-\u04ff]", fixed) or fixed != seg:
                    parts.append(fixed); changed = True
                else:
                    parts.append(seg)
            except:
                parts.append(seg)
        if i < len(s):
            parts.append(s[i]); i += 1
    return "".join(parts) if changed else s

fixed = try_fix(body)
out = Path(r"C:\Projects\HTRGroupLLC\scripts\fixed_bytes.txt")
out.write_text(f"orig_hex={body.encode('utf-8').hex()}\nfixed_hex={fixed.encode('utf-8').hex()}\nhas_check={fixed.startswith(chr(0x2705))}\n", encoding="ascii")
