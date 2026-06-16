from pathlib import Path
root = Path(r"C:\Projects\HTRGroupLLC")
js = root / "assets/index-utf8-v4.js"
j = js.read_text(encoding="utf-8")
blog_cta_old = """      /* @__PURE__ */ jsxRuntimeExports.jsxs(\"div\", { className: \"py-8 text-center\", style: { backgroundColor: K$1.dark }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(\"p\", { className: \"text-white font-bold text-lg mb-3\", children: T2.ctaText }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(\"a\", { href: PHONE_HREF$1, className: \"inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base\", style: { backgroundColor: K$1.accent }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: \"h-4 w-4\" }),
          \" \",
          PHONE_DISPLAY$1
        ] })
      ] })"""
blog_cta_new = """      /* @__PURE__ */ jsxRuntimeExports.jsxs(\"div\", { className: \"py-8 text-center\", style: { backgroundColor: K$1.dark }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(\"p\", { className: \"text-white font-bold text-lg mb-3\", children: T2.ctaText }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(\"div\", { className: \"htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3\", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(\"a\", { href: COMPANY_PHONE_HREF$5, className: \"htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm\", style: { backgroundColor: K$1.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: \"h-4 w-4\" }), \" \", COMPANY_PHONE_DISPLAY$5] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(\"a\", { href: PHONE_HREF$1, className: \"htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm\", style: { backgroundColor: K$1.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: \"h-4 w-4\" }), \" \", PHONE_DISPLAY$1] })
        ] })
      ] })"""
if blog_cta_old not in j:
    raise SystemExit("Blog CTA old block not found")
j = j.replace(blog_cta_old, blog_cta_new, 1)
js.write_text(j, encoding="utf-8", newline="\n")
for name in ("index-utf8-v4.prod.js",):
    prod = root / "assets" / name
    if prod.exists():
        pj = prod.read_text(encoding="utf-8")
        if blog_cta_old in pj:
            prod.write_text(pj.replace(blog_cta_old, blog_cta_new, 1), encoding="utf-8", newline="\n")
            print(f"{name} patched")
print("index-utf8-v4.js patched OK")
