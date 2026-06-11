import re
from pathlib import Path

def try_fix(s: str) -> str:
    if re.search(r"[\u0400-\u04ff]", s):
        return s
    # whole-string double-encoding fix
    try:
        fixed = s.encode("latin-1").decode("utf-8")
        if fixed != s and re.search(r"[\u0400-\u04ff\u2600-\u27bf\U0001f300-\U0001faff]", fixed):
            return fixed
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    # segmented for mixed strings
    if not re.search(r"[\u0080-\u00ff]", s):
        return s
    out, i, changed = [], 0, False
    while i < len(s):
        start = i
        while i < len(s):
            try:
                s[i].encode("latin-1")
                i += 1
            except UnicodeEncodeError:
                break
        if i > start:
            seg = s[start:i]
            try:
                dec = seg.encode("latin-1").decode("utf-8")
                out.append(dec)
                if dec != seg:
                    changed = True
            except (UnicodeEncodeError, UnicodeDecodeError):
                out.append(seg)
        if i < len(s):
            out.append(s[i])
            i += 1
    result = "".join(out)
    return result if changed and re.search(r"[\u0400-\u04ff]", result) else s

def fix_line(line):
    global fixes
    str_re = re.compile(r'"((?:[^"\\]|\\.)*)"')
    def sub(m):
        global fixes
        body = m.group(1)
        fixed = try_fix(body)
        if fixed != body:
            fixes += 1
            return '"' + fixed.replace("\\", "\\\\").replace('"', '\\"') + '"'
        return m.group(0)
    line = str_re.sub(sub, line)
    str_re2 = re.compile(r'"([^"]*)"')
    def sub2(m):
        global fixes
        body = m.group(1)
        if len(body) > 8000 or "\\u" in body:
            return m.group(0)
        fixed = try_fix(body)
        if fixed != body:
            fixes += 1
            return '"' + fixed + '"'
        return m.group(0)
    line = str_re2.sub(sub2, line)
    return line

fixes = 0
src = Path(r"C:\Projects\HTRGroupLLC\assets\index-Wa5559554342-v2.js").read_text("utf-8")
new = "\n".join(fix_line(l) for l in src.splitlines())
Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").write_text(new, encoding="utf-8", newline="\n")
b = new.encode("utf-8")
pod = "Подтверждён".encode()
moji = pod.decode("latin-1").encode()
stats = f"fixes={fixes}\npod_utf8={pod in b}\npod_moji={moji in b}\nmoji_any={b.count(moji)}"
Path(r"C:\Projects\HTRGroupLLC\scripts\fixfinal.txt").write_text(stats, encoding="utf-8")
