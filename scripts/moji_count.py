import re
from pathlib import Path
text = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_text("utf-8")
# count lines with typical mojibake marker Ð (U+00D0) inside quotes
count = len(re.findall(r"\u00d0[\u0080-\u00bf]", text))
cyr = len(re.findall(r"[\u0400-\u04ff]", text))
Path(r"C:\Projects\HTRGroupLLC\scripts\moji_count.txt").write_text(f"d0_pairs={count}\ncyrillic_chars={cyr}", encoding="ascii")
