from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx")
t = p.read_text(encoding="utf-8")
old = """        </section>

        {/*
        <CenterConvergeMarquee
          brands={MARQUEE_BRANDS}
          base={import.meta.env.BASE_URL.replace(/\\/$/, "")}
        />

"""
# find variant with STATS line
idx = t.find(old)
if idx == -1:
    raise SystemExit("old prefix not found")
# find closing */} before about
close = t.find(" */}\n        <section id=\"about\"", idx)
if close == -1:
    raise SystemExit("close not found")
new = """        </section>

        <CenterConvergeMarquee
          brands={MARQUEE_BRANDS}
          base={import.meta.env.BASE_URL.replace(/\\/$/, "")}
        />

"""
t = t[:idx] + new + t[close + len(" */}\n"):]
p.write_text(t, encoding="utf-8")
print("ok")
