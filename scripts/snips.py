from pathlib import Path
data=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_bytes()
for needle in [b"setAdminError(", b"setError("]:
    idx=0
    n=0
    while n<5:
        i=data.find(needle, idx)
        if i<0: break
        snippet=data[i:i+120]
        Path(r"C:\Projects\HTRGroupLLC\scripts\snip_%d.bin" % n).write_bytes(snippet)
        n+=1
        idx=i+1
Path("C:/Projects/HTRGroupLLC/scripts/done.txt").write_text("ok")
