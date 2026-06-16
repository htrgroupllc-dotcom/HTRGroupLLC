import re
from pathlib import Path
t=Path(r"C:\Projects\HTRGroupLLC\src\lib\serviceAreaGeo.ts").read_text(encoding="utf-8")
for line in t.splitlines():
    if 'zip:' not in line: continue
    m=re.search(r'zip: "(\d+)", ring: \[(.+)\]', line)
    if not m: continue
    z=m.group(1)
    coords=re.findall(r'\[(-?\d+\.\d+),(-?\d+\.\d+)\]', m.group(2))
    lats=[float(c[1]) for c in coords]
    clat=sum(lats)/len(lats)
    if clat < 29.78:
        print(z, round(clat,3), round(min(lats),3))
