import re, pathlib, shutil
js = pathlib.Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8", errors="replace")
needed = sorted(set(re.findall(r'"/assets/(photo_[^"]+\.jpg)"', js)))
needed_names = [p.split("/")[-1] for p in needed]
dest = pathlib.Path(r"C:\Projects\HTRGroupLLC\assets")
backup = pathlib.Path(r"C:\Projects\htrgr\REPLIT-LATEST\htrgrouptx-20260511-1324\assets")
backup2 = pathlib.Path(r"C:\Projects\htrgr\REPLIT-LATEST\HTRGroupLLC-source\assets")
have = {p.name for p in dest.glob("photo_*.jpg")}
to_copy = [n for n in needed_names if n not in have]
print("needed", len(needed_names), "to_copy", len(to_copy))
copied = 0
missing_src = []
for n in to_copy:
    src = backup / n
    if not src.is_file():
        src = backup2 / n
    if not src.is_file():
        missing_src.append(n)
        continue
    shutil.copy2(src, dest / n)
    copied += 1
print("copied", copied)
print("missing_src", len(missing_src))
for m in missing_src:
    print(" NO_SRC", m)
