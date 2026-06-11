import re
from pathlib import Path
t=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_text("utf-8")
for line in t.splitlines():
    if "setError" in line and "\u00d0" in line:
        print("LINE", line[:100])
        m=re.search(r'"([^"]*)"', line)
        if m:
            body=m.group(1)
            print("body", body[:30])
            f=body.encode("latin-1").decode("utf-8")
            print("fixed", f[:30])
