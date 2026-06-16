with open("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js","r",encoding="utf-8",errors="replace") as f:
    c=f.read()
idx=c.find("Customer Reviews")
print("idx", idx)
with open("C:/Projects/HTRGroupLLC/_bundle_reviews.txt","w",encoding="utf-8") as o:
    o.write(c[idx:idx+10000] if idx>=0 else "nf")
