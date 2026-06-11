from pathlib import Path

css_block = """
/* Header phone buttons (desktop + mobile menu) */
.htr-header-spacer {
  min-height: 3.5rem;
}
.htr-site-header-bar {
  min-height: 3.5rem;
  padding-top: 2mm;
  padding-bottom: 2mm;
}
.header-phone-pair {
  margin-top: 5mm;
  transform: translateX(5mm);
}
.header-phone-link {
  padding-top: calc(0.375rem + 2.5mm) !important;
  padding-bottom: calc(0.375rem + 2.5mm) !important;
  box-sizing: border-box;
}
"""

for rel in [r"src\index.css", r"assets\index-_bdQPowM.css"]:
    p = Path(r"C:\Projects\HTRGroupLLC") / rel
    t = p.read_text(encoding="utf-8")
    if ".header-phone-pair" not in t:
        t = t.rstrip() + "\n" + css_block
        p.write_text(t, encoding="utf-8")
        print("patched", rel)
    else:
        print("skip", rel)
