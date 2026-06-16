from pathlib import Path
for name in ["index-utf8-v4.js", "index-utf8-v4.prod.js"]:
    p = Path(r"C:/Projects/HTRGroupLLC/assets") / name
    if not p.exists():
        continue
    c = p.read_text(encoding="utf-8")
    if "setReviewPage((p) => Math.max(0, p - 1))" in c:
        print(name, "carousel exists")
        continue
    old = '''        )) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "faq", className: "py-16 bg-white"'''
    new = '''        )) }),
        Math.ceil(googleHomeReviews.length / 10) > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Previous reviews", disabled: reviewPage <= 0, onClick: () => setReviewPage((p) => Math.max(0, p - 1)), className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm disabled:opacity-40 hover:opacity-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-stone-500 tabular-nums", children: [reviewPage + 1, " / ", Math.max(1, Math.ceil(googleHomeReviews.length / 10))] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Next reviews", disabled: reviewPage >= Math.ceil(googleHomeReviews.length / 10) - 1, onClick: () => setReviewPage((p) => Math.min(Math.ceil(googleHomeReviews.length / 10) - 1, p + 1)), className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm disabled:opacity-40 hover:opacity-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "faq", className: "py-16 bg-white"'''
    if old not in c:
        raise SystemExit(f"needle missing in {name}")
    c = c.replace(old, new, 1)
    p.write_text(c, encoding="utf-8")
    print(name, "carousel added")
