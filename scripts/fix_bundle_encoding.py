import re
from pathlib import Path

SRC = Path(r"C:\Projects\HTRGroupLLC\assets\index-Wa5559554342-v2.js")
DST = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js")

text = SRC.read_text(encoding="utf-8")

def try_fix(s: str) -> str:
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

str_re = re.compile(r'"((?:[^"\\]|\\.)*)"')
fixes = 0

def sub(m):
    global fixes
    body = m.group(1)
    fixed = try_fix(body)
    if fixed != body:
        fixes += 1
        esc = fixed.replace("\\", "\\\\").replace('"', '\\"')
        return '"' + esc + '"'
    return m.group(0)

new_text = str_re.sub(sub, text)
str_re2 = re.compile(r"'((?:[^'\\]|\\.)*)'")

def sub2(m):
    global fixes
    body = m.group(1)
    fixed = try_fix(body)
    if fixed != body:
        fixes += 1
        esc = fixed.replace("\\", "\\\\").replace("'", "\\'")
        return "'" + esc + "'"
    return m.group(0)

new_text = str_re2.sub(sub2, new_text)
DST.write_text(new_text, encoding="utf-8", newline="\n")
data = DST.read_bytes()
samples = ["Неверный", "Пароль", "Войти", "Управление расписанием"]
for s in samples:
    print(s, s.encode("utf-8") in data)
print("fixes", fixes, "size", len(data))
