import re, pathlib, urllib.request
js_path = pathlib.Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
js = js_path.read_text(encoding="utf-8", errors="replace")
paths = sorted(set(re.findall(r'"/assets/(photo_[^"]+\.jpg)"', js)))
print("bundle_photo_urls", len(paths))
assets = {p.name for p in pathlib.Path(r"C:\Projects\HTRGroupLLC\assets").glob("photo_*.jpg")}
missing_local = []
for url in paths:
    fn = url.split("/")[-1]
    if fn not in assets:
        missing_local.append(fn)
print("missing_local", len(missing_local))
for m in missing_local[:30]:
    print(" LOCAL_MISSING", m)
if len(missing_local) > 30:
    print("...", len(missing_local)-30, "more")
