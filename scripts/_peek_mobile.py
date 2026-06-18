from pathlib import Path
t = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js").read_text(encoding="utf-8")
needle = 'resolveBookingBiz(b.business_type) === "dental" ? t.bizDental : t.bizAppliance'
out = []
idx = 0
n = 0
while True:
    idx = t.find(needle, idx)
    if idx < 0:
        break
    n += 1
    out.append(f"--- at {idx} occurrence {n}\n")
    out.append(repr(t[idx - 250 : idx + 700]))
    out.append("\n\n")
    idx += 1
    if n >= 4:
        break
Path(r"C:/Projects/HTRGroupLLC/scripts/_peek_out.txt").write_text("".join(out), encoding="utf-8")
print("wrote", n, "occurrences")
