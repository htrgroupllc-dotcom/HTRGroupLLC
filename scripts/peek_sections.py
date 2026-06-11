from pathlib import Path
t=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js").read_text(encoding="utf-8")
for label in ["T2.whyH2", "T2.certsH2", "T2.galleryH2", "Call us anytime"]:
    print(label, t.find(label))
print("--- before why ---")
i=t.find("T2.whyH2")
print(t[i-250:i+80])
