import re, os
bundle = open(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js","r",encoding="utf-8",errors="replace").read()
urls = sorted(set(re.findall(r"/assets/photo_[^\"']+\.jpg", bundle)))
assets_dir = r"C:\Projects\HTRGroupLLC\assets"
missing = []
for u in urls:
    fn = u.split("/")[-1]
    if not os.path.isfile(os.path.join(assets_dir, fn)):
        missing.append(fn)
print("total", len(urls), "missing", len(missing))
for m in missing:
    print(m)
