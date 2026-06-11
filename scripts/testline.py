import re
from pathlib import Path
line = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_text("utf-8").splitlines()[33961]
str_re = re.compile(r'"((?:[^"\\]|\\.)*)"')
print("line len", len(line))
for m in str_re.finditer(line):
    b=m.group(1)
    print("match len", len(b), "d0", "\u00d0" in b, "cyr", bool(re.search(r"[\u0400-\u04ff]", b)))
