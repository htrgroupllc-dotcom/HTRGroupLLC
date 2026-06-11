import re, os, urllib.request, ssl
ctx = ssl.create_default_context()
bundle = open(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js","r",encoding="utf-8",errors="replace").read()
urls = sorted(set(re.findall(r"/assets/photo_[^\"']+\.jpg", bundle)))
bad = []
for u in urls:
    url = "https://htrgrouptx.com" + u
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent":"Mozilla/5.0"})
        r = urllib.request.urlopen(req, context=ctx, timeout=15)
        ct = r.headers.get("Content-Type","")
        if r.status != 200 or "image" not in ct:
            bad.append((url, r.status, ct))
    except Exception as e:
        bad.append((url, "err", str(e)[:80]))
print("checked", len(urls), "bad", len(bad))
for b in bad[:50]:
    print(b[0].split("/")[-1], b[1], b[2] if len(b)>2 else "")
