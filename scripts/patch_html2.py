from pathlib import Path
raw = Path(r"C:\Projects\HTRGroupLLC\index.html").read_bytes()
# strip BOM
if raw.startswith(b"\xef\xbb\xbf"):
    raw = raw[3:]
text = raw.decode("utf-8", errors="replace")
text = text.replace("index-Wa5559554342-v2.js", "index-utf8-v3.js")
import re
text = re.sub(r"<!-- deploy:.*?-->", "<!-- deploy: utf8-fix-20260611 index-utf8-v3.js -->", text, flags=re.DOTALL)
Path(r"C:\Projects\HTRGroupLLC\index.html").write_bytes(text.encode("utf-8"))
