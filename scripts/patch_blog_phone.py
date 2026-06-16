path = r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()
replacements = [
    ("href: COMPANY_PHONE_HREF,\n                  className: \"htr-phone-btn flex items-center justify-center gap-2 font-bold px-4 py-3 rounded text-white w-full\"",
     "href: COMPANY_PHONE_HREF$6,\n                  className: \"htr-phone-btn flex items-center justify-center gap-2 font-bold px-4 py-3 rounded text-white w-full\""),
    ("COMPANY_PHONE_DISPLAY\n                  ]\n                }\n              ),\n              /* @__PURE__ */ jsxRuntimeExports.jsxs(\n                \"a\",\n                {\n                  href: PHONE_HREF,",
     "COMPANY_PHONE_DISPLAY$6\n                  ]\n                }\n              ),\n              /* @__PURE__ */ jsxRuntimeExports.jsxs(\n                \"a\",\n                {\n                  href: PHONE_HREF,"),
]
for old, new in replacements:
    if old not in s:
        print("MISSING:", old[:60])
    else:
        s = s.replace(old, new, 1)
        print("OK:", old[:40])
with open(path, "w", encoding="utf-8", newline="\n") as f:
    f.write(s)
print("done")
