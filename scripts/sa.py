from pathlib import Path
import re
data = Path(r"C:\Projects\HTRGroupLLC\assets\index-Wa5559554342-v2.js").read_bytes()
i = data.find(b'statusApproved: "')
chunk = data[i:i+120]
# extract quoted string bytes
q1 = chunk.index(b'"')+1
q2 = chunk.index(b'"', q1)
body_bytes = chunk[q1:q2]
body = body_bytes.decode("utf-8")
try:
    fixed = body.encode("latin-1").decode("utf-8")
    ok = True
except Exception as e:
    fixed = str(e)
    ok = False
Path(r"C:\Projects\HTRGroupLLC\scripts\sa.txt").write_text(
    f"ok={ok}\nbody_hex={body_bytes.hex()}\nfixed_hex={fixed.encode('utf-8').hex() if ok else ''}\n",
    encoding="ascii")
