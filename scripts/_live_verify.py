import urllib.request, re
url = "https://htrgrouptx.com/"
html = urllib.request.urlopen(
    urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30
).read().decode("utf-8", "replace")
m = re.search(r'src="([^"]*index-utf8-v4\.js[^"]*)"', html)
jsurl = m.group(1) if m else "/assets/index-utf8-v4.js"
if jsurl.startswith("/"):
    jsurl = "https://htrgrouptx.com" + jsurl
print("js", jsurl)
js = urllib.request.urlopen(
    urllib.request.Request(jsurl, headers={"User-Agent": "Mozilla/5.0"}), timeout=90
).read().decode("utf-8", "replace")
i = js.find("header-phone-pair")
sn = js[i : i + 900] if i != -1 else ""
p606 = sn.find("660-6067")
p346 = sn.find("696-8751")
print("live header 606 first:", p606 != -1 and (p346 == -1 or p606 < p346))
bad = 0
pos = 0
while True:
    a = js.find("href: PHONE_HREF", pos)
    if a == -1:
        break
    sub = js[a : a + 800]
    c = sub.find("COMPANY_PHONE_HREF")
    if 0 < c < 700:
        bad += 1
    pos = a + 5
print("wrong pairs:", bad)
