from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
t = p.read_text(encoding="utf-8")
old = '''        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DraggableMarquee,
          {
            brands: MARQUEE_BRANDS,
            base: "/".replace(/\\/$/, "")
          }
        )
      ] }),'''
new = '''        /* @__PURE__ */ jsxRuntimeExports.jsx(
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
        ) })
      ] }),'''
if old not in t:
    raise SystemExit('brands marquee block not found')
if 'reverse: true' in t:
    print('already has reverse marquee')
else:
    t = t.replace(old, new, 1)
    p.write_text(t, encoding='utf-8')
    print('second row added')
