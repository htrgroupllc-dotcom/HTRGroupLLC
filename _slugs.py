import re
t=open(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js",encoding="utf-8").read()
i=t.find("BLOG_POSTS")
j=t.find("];", i)
chunk=t[i:j+2]
sl=re.findall(r'slug:\s*"([^"]+)"', chunk)
print("slugs", sl)
