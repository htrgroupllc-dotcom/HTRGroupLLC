import re, subprocess
from pathlib import Path
ROOT = Path(r"C:/Projects/HTRGroupLLC")
# get removed from git diff
r = subprocess.run(["git","show","HEAD:src/lib/serviceAreaGeo.ts"], cwd=ROOT, capture_output=True, text=True)
old = set(re.findall(r'zip: "(\d{5})"', r.stdout)) if r.returncode==0 else set()
new = set(re.findall(r'zip: "(\d{5})"', (ROOT/"src/lib/serviceAreaGeo.ts").read_text()))
removed = sorted(old - new)
added = sorted(new - old)
print("removed", len(removed))
print(",".join(removed))
print("added", added)
