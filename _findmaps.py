with open("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js","r",encoding="utf-8",errors="replace") as f:
    c=f.read()
for pat in ["google.com/maps","Write a Review","reviewsBased","grid-cols-2 md:grid-cols-4"]:
    print(pat, c.find(pat))
