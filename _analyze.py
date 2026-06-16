import re
t=open(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js",encoding="utf-8").read()
i=t.find("function BlogPost()")
j=t.find("\nfunction ", i+100)
if j<0: j=i+25000
chunk=t[i:j]
# find suspicious bare identifiers (uppercase words used as values not strings)
idents=set(re.findall(r"\b([A-Z][A-Z0-9_]{3,})\b", chunk))
# filter common jsx/react
skip={"PURE","URL","FAQ","HTR","GroupTX","IMG","TR","CSS","SVG","API","DOM","UTC","PDF"}
for id in sorted(idents):
    if id in skip: continue
    if id.startswith("K") or id.endswith("Es"): continue
    # check if defined in chunk
    if not re.search(r"const "+re.escape(id)+r"[\s=]", chunk) and not re.search(r"function "+re.escape(id), chunk):
        uses=len(re.findall(r"\b"+re.escape(id)+r"\b", chunk))
        defs=bool(re.search(r"const "+re.escape(id), t[max(0,i-500):i]))
        print(id, "uses", uses, "defined_before", defs)
