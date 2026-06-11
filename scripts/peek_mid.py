from pathlib import Path
t=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8")
idx=0
while True:
    i=t.find("Call us anytime", idx)
    if i==-1: break
    print(i, t[i-120:i+80])
    idx=i+1
