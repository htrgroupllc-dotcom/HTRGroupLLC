import re
from pathlib import Path

def try_fix(s):
    if re.search(r"[\u0400-\u04ff]", s): return s
    if not re.search(r"[\u0080-\u024f]", s): return s
    try:
        fixed = s.encode("latin-1").decode("utf-8")
    except: return s
    return fixed if re.search(r"[\u0400-\u04ff]", fixed) else s

str_re = re.compile(r'"((?:[^"\\]|\\.)*)"')
fixes=0
def sub(m):
    global fixes
    body=m.group(1)
    fixed=try_fix(body)
    if fixed!=body:
        fixes+=1
        return '"'+fixed.replace("\\","\\\\").replace('"','\\"')+'"'
    return m.group(0)

text=Path(r"C:\Projects\HTRGroupLLC\assets\index-Wa5559554342-v2.js").read_text("utf-8")
lines=text.splitlines()
new_lines=[str_re.sub(sub,l) for l in lines]
new_text="\n".join(new_lines)
moji="Неверный".encode("utf-8").decode("latin-1").encode("utf-8")
stats=f"fixes={fixes}\nmoji={new_text.encode('utf-8').count(moji)}\nutf8={new_text.encode('utf-8').count('Неверный'.encode('utf-8'))}\nlines={len(lines)}"
Path(r"C:\Projects\HTRGroupLLC\scripts\fixstats2.txt").write_text(stats, encoding="utf-8")
Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").write_text(new_text, encoding="utf-8", newline="\n")
