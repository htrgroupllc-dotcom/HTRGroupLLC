c=open("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js",encoding="utf-8").read()
idx=c.find("id: \"reviews\"")
open("C:/Projects/HTRGroupLLC/_parent.txt","w",encoding="utf-8").write(c[idx-1200:idx+100])
