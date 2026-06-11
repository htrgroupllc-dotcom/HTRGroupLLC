import re, pathlib, urllib.request
js = pathlib.Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8", errors="replace")
paths = sorted(set(re.findall(r'"/assets/(photo_[^"]+\.jpg)"', js)))
base = "https://htrgrouptx.com/assets/"
bad = []
ok = 0
for p in paths:
    url = base + p.split("/")[-1]
    req = urllib.request.Request(url, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            ct = r.headers.get("Content-Type", "")
            if "image" in ct:
                ok += 1
            else:
                bad.append((url, ct, r.status))
    except Exception as e:
        bad.append((url, str(e), ""))
print("prod_before_deploy ok", ok, "bad", len(bad))
for b in bad[:15]:
    print(b)
