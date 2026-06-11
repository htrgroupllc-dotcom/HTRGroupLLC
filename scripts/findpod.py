from pathlib import Path
b=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_bytes()
s="Подтверждён"
m=s.encode("utf-8").decode("latin-1").encode("utf-8")
print("moji count", b.count(m))
idx=b.find(m)
print("idx", idx)
if idx>=0:
    print(b[idx-40:idx+len(m)+40])
# backtick strings with cyrillic moji
text=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_text("utf-8")
import re
for m in re.finditer(r"`([^`]*)`", text):
    body=m.group(1)
    if "\u00d0" in body and len(body)<200:
        try:
            f=body.encode("latin-1").decode("utf-8")
            if re.search(r"[\u0400-\u04ff]", f):
                Path(r"C:\Projects\HTRGroupLLC\scripts\backtick.txt").write_text(repr(body[:80])+" -> "+repr(f[:80]), encoding="utf-8")
                break
        except: pass
else:
    Path(r"C:\Projects\HTRGroupLLC\scripts\backtick.txt").write_text("none short", encoding="utf-8")
