import re
from pathlib import Path

def try_fix(s):
    if re.search(r"[\u0400-\u04ff]", s): return s
    if not re.search(r"[\u0080-\u024f]", s): return s
    # fix only latin-1 encodable runs: split and fix segments?
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

def fix_text(text):
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
    text = str_re.sub(sub, text)
    # strings with embedded newlines (no escaped quotes inside)
    str_re2 = re.compile(r'"([^"]*)"', re.DOTALL)
    def sub2(m):
        global fixes
        body = m.group(1)
        if "\\" in body or len(body) > 5000:
            return m.group(0)
        fixed = try_fix(body)
        if fixed != body:
            fixes += 1
            return '"' + fixed + '"'
        return m.group(0)
    text = str_re2.sub(sub2, text)
    # template literals (short)
    str_re3 = re.compile(r"`([^`]{0,500})`")
    def sub3(m):
        global fixes
        body = m.group(1)
        if "${" in body:
            return m.group(0)
        fixed = try_fix(body)
        if fixed != body:
            fixes += 1
            return "`" + fixed + "`"
        return m.group(0)
    return str_re3.sub(sub3, text)

fixes = 0
text = Path(r"C:\Projects\HTRGroupLLC\assets\index-Wa5559554342-v2.js").read_text("utf-8")
lines = text.splitlines()
new_lines = [fix_text(l) for l in lines]
new_text = "\n".join(new_lines)
Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").write_text(new_text, encoding="utf-8", newline="\n")
b = new_text.encode("utf-8")
s = "Подтверждён"
stats = f"fixes={fixes}\npod_utf8={s.encode() in b}\npod_moji={s.encode().decode('latin-1').encode() in b}"
Path(r"C:\Projects\HTRGroupLLC\scripts\fixstats3.txt").write_text(stats, encoding="utf-8")
