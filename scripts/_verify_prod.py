import urllib.request, ssl, re
t = urllib.request.urlopen("https://htrgrouptx.com/assets/index-utf8-v4.js?v=9", context=ssl.create_default_context()).read().decode("utf-8", "replace")
print("n85a", re.search(r"const n85a = \"([^\"]+)\"", t).group(1))
print("hero", "htr-home-hero-desktop" in t)
print("blog606", "COMPANY_PHONE_HREF$5" in t)
