with open("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js","r",encoding="utf-8",errors="replace") as f:
    c=f.read()
i=1427643
with open("C:/Projects/HTRGroupLLC/_bundle_ui.txt","w",encoding="utf-8") as o:
    o.write(c[i-3000:i+2000])
