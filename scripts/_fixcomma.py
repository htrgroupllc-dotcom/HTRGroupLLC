from pathlib import Path
p=Path("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
c=p.read_text(encoding="utf-8")
bad="      ] }) }),\n,\n      /* @__PURE__ */ jsxRuntimeExports.jsx(\"section\", { id: \"faq\""
good="      ] }) }),\n      /* @__PURE__ */ jsxRuntimeExports.jsx(\"section\", { id: \"faq\""
if bad not in c:
    raise SystemExit("bad pattern not found")
c=c.replace(bad, good, 1)
p.write_text(c, encoding="utf-8")
print("fixed comma")
