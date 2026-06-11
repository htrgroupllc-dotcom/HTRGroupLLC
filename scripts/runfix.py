import re
from pathlib import Path
SRC = Path(r"C:\Projects\HTRGroupLLC\assets\index-Wa5559554342-v2.js")
text = SRC.read_text("utf-8")

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

new=str_re.sub(sub,text)
# check mojibake bytes left
moji="Неверный".encode("utf-8").decode("latin-1").encode("utf-8")
Path(r"C:\Projects\HTRGroupLLC\scripts\fixstats.txt").write_text(f"fixes={fixes}\nmoji_left={new.encode('utf-8').count(moji)}\nutf8_ok={new.encode('utf-8').count('Неверный'.encode('utf-8'))}", encoding="utf-8")
Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").write_text(new, encoding="utf-8", newline="\n")
