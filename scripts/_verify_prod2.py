import re
from pathlib import Path
b = Path(r"C:/Projects/HTRGroupLLC/scripts/_prod_bundle_dl.js").read_text(encoding="utf-8", errors="replace")
zs = re.findall(r'\{ z: "(\d{5})"', b)
print("polygons", len(zs))
for z in ("77511","77578","77479","77581","77565","77546"):
    print(z, z in zs)
