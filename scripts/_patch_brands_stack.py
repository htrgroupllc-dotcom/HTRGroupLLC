from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx")
t = p.read_text(encoding="utf-8")
old = """          <DraggableMarquee
            brands={MARQUEE_BRANDS}
            base={import.meta.env.BASE_URL.replace(/\\/$/, \"\")}
          />
          <div className=\"mt-3\">
            <DraggableMarquee
              brands={MARQUEE_BRANDS}
              base={import.meta.env.BASE_URL.replace(/\\/$/, \"\")}
              reverse
            />
          </div>"""
new = """          <div className=\"htr-brand-marquee-stack flex flex-col gap-4\">
            <DraggableMarquee
              brands={MARQUEE_BRANDS}
              base={import.meta.env.BASE_URL.replace(/\\/$/, \"\")}
            />
            <DraggableMarquee
              brands={MARQUEE_BRANDS}
              base={import.meta.env.BASE_URL.replace(/\\/$/, \"\")}
              reverse
            />
          </div>"""
if old not in t:
    raise SystemExit("brands block not found in home.tsx")
t = t.replace(old, new, 1)
# min-height on marquee shell
t = t.replace(
    '<div className="relative w-full overflow-hidden" style={{ touchAction: "pan-y" }}>',
    '<div className="relative w-full overflow-hidden min-h-[96px] htr-brand-marquee" style={{ touchAction: "pan-y" }}>',
    1,
)
# only first occurrence - need all marquees
t = t.replace(
    'className="relative w-full overflow-hidden" style={{ touchAction: "pan-y" }}',
    'className="relative w-full overflow-hidden min-h-[96px] htr-brand-marquee" style={{ touchAction: "pan-y" }}',
)
p.write_text(t, encoding="utf-8")
print("home.tsx updated")
