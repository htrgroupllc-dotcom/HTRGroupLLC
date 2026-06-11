from pathlib import Path
html = Path(r"C:\Projects\HTRGroupLLC\index.html").read_text(encoding="utf-8")
html = html.replace("index-Wa5559554342-v2.js", "index-utf8-v3.js")
import re
html = re.sub(r"<!-- deploy:.*?-->", "<!-- deploy: utf8-fix-20260611 index-utf8-v3.js -->", html)
Path(r"C:\Projects\HTRGroupLLC\index.html").write_text(html, encoding="utf-8", newline="\n")
sw = Path(r"C:\Projects\HTRGroupLLC\sw.js").read_text(encoding="utf-8").replace("htr-pwa-v5", "htr-pwa-v6")
Path(r"C:\Projects\HTRGroupLLC\sw.js").write_text(sw, encoding="utf-8", newline="\n")
