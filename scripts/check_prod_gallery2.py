import re, pathlib, subprocess, json
js = pathlib.Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8", errors="replace")
paths = sorted(set(re.findall(r'"/assets/(photo_[^"]+\.jpg)"', js)))
bad = []
ok = 0
for p in paths:
    url = "https://htrgrouptx.com/assets/" + p.split("/")[-1]
    r = subprocess.run(["curl.exe","-sI",url], capture_output=True, text=True, timeout=30)
    out = r.stdout
    ct = ""
    for line in out.splitlines():
        if line.lower().startswith("content-type:"):
            ct = line.split(":",1)[1].strip()
    if "image/" in ct:
        ok += 1
    else:
        bad.append((p.split("/")[-1], ct or out.splitlines()[0] if out else "no response"))
print("ok", ok, "bad", len(bad))
for b in bad[:25]:
    print(b)
