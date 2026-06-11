import re
from pathlib import Path
for name in ["index-Wa5559554342-v2.js", "index-utf8-v3.js"]:
    t=Path(r"C:\Projects\HTRGroupLLC\assets")/name
    text=t.read_text("utf-8")
    d0=len(re.findall(r"\u00d0[\u0080-\u00bf]", text))
    cyr=len(re.findall(r"[\u0400-\u04ff]", text))
    print(name, "d0", d0, "cyr", cyr)
