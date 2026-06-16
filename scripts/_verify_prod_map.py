import urllib.request, ssl, re, time
ctx = ssl.create_default_context()
for v in ("26", "25"):
    u = f"https://www.htrgrouptx.com/assets/index-utf8-v4.js?v={v}"
    try:
        t = urllib.request.urlopen(u, context=ctx, timeout=60).read().decode("utf-8", "replace")
        z = len(re.findall(r'z: "77', t))
        print(v, "polygons~", z, "bytes", len(t))
    except Exception as e:
        print(v, "err", e)
