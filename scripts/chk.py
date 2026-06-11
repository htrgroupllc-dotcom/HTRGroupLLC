from pathlib import Path
b=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_bytes()
for label, s in [
    ("pod", "Подтверждён"),
    ("pod2", "Подтвержден"),
    ("approved", "✅ Подтверждён"),
]:
    u=s.encode("utf-8")
    print(label, u in b, b.count(u))
# find statusApproved after fix
i=b.find(b"statusApproved:")
print("snippet", b[i:i+90])
