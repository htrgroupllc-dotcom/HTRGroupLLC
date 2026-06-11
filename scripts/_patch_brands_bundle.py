from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
t = p.read_text(encoding="utf-8")
old = """        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DraggableMarquee,
          {
            brands: MARQUEE_BRANDS,
            base: "/".replace(/\\/$/, "")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DraggableMarquee,
          {
            brands: MARQUEE_BRANDS,
            base: "/".replace(/\\/$/, ""),
            reverse: true
          }
        ) })"""
new = """        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-stack flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DraggableMarquee,
            {
              brands: MARQUEE_BRANDS,
              base: "/".replace(/\\/$/, "")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DraggableMarquee,
            {
              brands: MARQUEE_BRANDS,
              base: "/".replace(/\\/$/, ""),
              reverse: true
            }
          )
        ] })"""
if old not in t:
    if "htr-brand-marquee-stack" in t:
        print("bundle stack already patched")
    else:
        raise SystemExit("brands bundle block not found")
else:
    t = t.replace(old, new, 1)
    print("brands stack patched")

old_shell = 'className: "relative w-full overflow-hidden", style: { touchAction: "pan-y" }'
new_shell = 'className: "relative w-full overflow-hidden min-h-[96px] htr-brand-marquee", style: { touchAction: "pan-y" }'
if old_shell in t:
    t = t.replace(old_shell, new_shell)
    print("marquee shell class updated")
elif new_shell in t:
    print("shell already updated")
else:
    raise SystemExit("marquee shell not found")

p.write_text(t, encoding="utf-8", newline="\n")
