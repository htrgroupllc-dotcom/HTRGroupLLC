import pathlib
root = pathlib.Path(r"C:\Projects\HTRGroupLLC")

# --- blog-post.tsx ---
tsx = root / "src/pages/blog-post.tsx"
text = tsx.read_text(encoding="utf-8")
old_tsx = """                    <a
                      href={PHONE_HREF}
                      className=\"flex items-center justify-center gap-2 font-bold px-4 py-3 rounded text-white w-full\"
                      style={{ backgroundColor: K.accent }}
                    >
                      <Phone className=\"h-4 w-4\" /> {PHONE_DISPLAY}
                    </a>"""
new_tsx = """                    <div className=\"htr-phone-pair flex flex-col gap-2\">
                      <a
                        href={COMPANY_PHONE_HREF}
                        className=\"htr-phone-btn flex items-center justify-center gap-2 font-bold px-4 py-3 rounded text-white w-full\"
                        style={{ backgroundColor: K.accent }}
                      >
                        <Phone className=\"h-4 w-4\" /> {COMPANY_PHONE_DISPLAY}
                      </a>
                      <a
                        href={PHONE_HREF}
                        className=\"htr-phone-btn flex items-center justify-center gap-2 font-bold px-4 py-3 rounded text-white w-full\"
                        style={{ backgroundColor: K.accent }}
                      >
                        <Phone className=\"h-4 w-4\" /> {PHONE_DISPLAY}
                      </a>
                    </div>"""
if old_tsx not in text:
    raise SystemExit("blog-post.tsx: old block not found")
tsx.write_text(text.replace(old_tsx, new_tsx), encoding="utf-8")
print("blog-post.tsx OK")

# --- index-utf8-v4.js ---
js_path = root / "assets/index-utf8-v4.js"
s = js_path.read_text(encoding="utf-8")
old_js = """            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              \"a\",
              {
                href: PHONE_HREF,
                className: \"flex items-center justify-center gap-2 font-bold px-4 py-3 rounded text-white w-full\",
                style: { backgroundColor: K.accent },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: \"h-4 w-4\" }),
                  \" \",
                  PHONE_DISPLAY
                ]
              }
            )"""
new_js = """            /* @__PURE__ */ jsxRuntimeExports.jsxs(\"div\", { className: \"htr-phone-pair flex flex-col gap-2\", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                \"a\",
                {
                  href: COMPANY_PHONE_HREF,
                  className: \"htr-phone-btn flex items-center justify-center gap-2 font-bold px-4 py-3 rounded text-white w-full\",
                  style: { backgroundColor: K.accent },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: \"h-4 w-4\" }),
                    \" \",
                    COMPANY_PHONE_DISPLAY
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                \"a\",
                {
                  href: PHONE_HREF,
                  className: \"htr-phone-btn flex items-center justify-center gap-2 font-bold px-4 py-3 rounded text-white w-full\",
                  style: { backgroundColor: K.accent },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: \"h-4 w-4\" }),
                    \" \",
                    PHONE_DISPLAY
                  ]
                }
              )
            ] })"""
if old_js not in s:
    raise SystemExit("index-utf8-v4.js: old block not found at " + str(s.find("href: PHONE_HREF")))
js_path.write_text(s.replace(old_js, new_js, 1), encoding="utf-8")
print("index-utf8-v4.js OK")
