from pathlib import Path
lines=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_text("utf-8").splitlines()
for i,l in enumerate(lines,1):
    if "setAdminError" in l and "401" in lines[i-2] if i>2 else False:
        pass
    if i in (33962,33969,22514,22521):
        b=l.encode("utf-8")
        Path(r"C:\Projects\HTRGroupLLC\scripts\line.txt").write_text(f"{i}: {l}\nbytes_has_utf8={'Неверный'.encode() in b}\nbytes_has_moji={'Неверный'.encode().decode('latin-1').encode() in b}", encoding="utf-8")
