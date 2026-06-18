from pathlib import Path
t = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js").read_text(encoding="utf-8")
idx = 4492193
Path(r"C:/Projects/HTRGroupLLC/scripts/_peek2.txt").write_text(repr(t[idx - 400 : idx + 1200]), encoding="utf-8")
