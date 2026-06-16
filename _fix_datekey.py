from pathlib import Path

OLD = '    const key = day.toISOString().slice(0, 10);'
NEW = '    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;'

for p in [
    Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx"),
    Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js"),
]:
    t = p.read_text(encoding="utf-8")
    if OLD not in t:
        raise SystemExit(f"missing in {p}")
    p.write_text(t.replace(OLD, NEW), encoding="utf-8")
print("date key fixed")
