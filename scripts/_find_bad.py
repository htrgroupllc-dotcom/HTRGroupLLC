import re
from pathlib import Path
s=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8")
for m in re.finditer(r"href: PHONE_HREF(\$2|\$3)", s):
    pos=m.start()
    sub=s[pos:pos+1000]
    if "COMPANY_PHONE_HREF" in sub:
        cpos=sub.find("COMPANY_PHONE_HREF")
        if 0 < cpos < 800:
            print("PHONE before COMPANY at", pos)
            print(sub[: min(cpos+150, 450)])
            print("---")
