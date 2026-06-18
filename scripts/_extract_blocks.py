from pathlib import Path
t = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js").read_text(encoding="utf-8")
start = 4491698 - 120
end = 4491698 + 1494
Path(r"C:/Projects/HTRGroupLLC/scripts/_mobile_full.txt").write_text(t[start:end], encoding="utf-8")
