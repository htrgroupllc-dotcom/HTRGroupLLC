from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
t = p.read_text(encoding="utf-8")
hero_old = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm mb-4", style: { backgroundColor: K$3.accent }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
                  " ",
                  PHONE_DISPLAY$3
                ] })'''
hero_new = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
                    " ",
                    PHONE_DISPLAY$3
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
                    " ",
                    COMPANY_PHONE_DISPLAY$3
                  ] })
                ] })'''
t = t.replace(hero_old, hero_new)
# gallery headers PHONE_REF$2
for old, new in [
(
'''/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$2, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            PHONE_DISPLAY$2
          ] })''',
'''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$2, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              PHONE_DISPLAY$2
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$2, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              COMPANY_PHONE_DISPLAY$2
            ] })
          ] })'''),
]:
    if old in t:
        t = t.replace(old, new, 1)
p.write_text(t, encoding="utf-8")
print("hero left", t.count("inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm mb-4"))
