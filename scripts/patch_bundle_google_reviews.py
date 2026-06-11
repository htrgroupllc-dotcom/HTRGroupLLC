from pathlib import Path

bundle = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
prod = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.prod.js")
c = bundle.read_text(encoding="utf-8")

# 1) stars
c = c.replace("fill-yellow-400 text-yellow-400", "fill-[#FBBC04] text-[#FBBC04]")

# 2) grid
c = c.replace(
    'className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4", children: googleHomeReviews.map',
    'className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-2.5", children: googleHomeReviews.slice(reviewPage * 10, reviewPage * 10 + 10).map',
)

# 3) compact card classes in reviews block only (first occurrences after reviews section)
c = c.replace(
    'className: "bg-white rounded-xl p-4 shadow-sm border border-stone-100 flex flex-col h-full"',
    'className: "bg-white rounded-lg p-2.5 md:p-3 shadow-sm border border-stone-100 flex flex-col h-full min-h-0"',
    1,
)
c = c.replace(
    'className: "font-semibold text-sm text-stone-900 truncate"',
    'className: "font-semibold text-xs text-stone-900 truncate"',
    1,
)
c = c.replace(
    'className: "text-stone-600 text-sm leading-relaxed flex-1"',
    'className: "text-stone-600 text-[11px] md:text-xs leading-snug flex-1 line-clamp-4"',
    1,
)

marker = 'const [reviewTab, setReviewTab] = reactExports.useState("all");'
if marker in c and "reviewPage" not in c[c.find("function Home"):c.find("function Home")+8000]:
    insert = marker + '\n  const [reviewPage, setReviewPage] = reactExports.useState(0);\n  const [googleRating, setGoogleRating] = reactExports.useState(5);\n  const [googleReviewCount, setGoogleReviewCount] = reactExports.useState(9);'
    c = c.replace(marker, insert, 1)

# convert googleHomeReviews to state with static seed
start = c.find("  const GOOGLE_REVIEW_URL_HOME")
end = c.find("  const handleServiceClick", start)
if start > 0 and end > start and "setGoogleHomeReviews" not in c[start:end]:
    seed = c[start:end]
    seed = seed.replace("const googleHomeReviews =", "const GOOGLE_HOME_REVIEWS_STATIC =")
    fetch_block = seed + """
  const [googleHomeReviews, setGoogleHomeReviews] = reactExports.useState(GOOGLE_HOME_REVIEWS_STATIC);
  reactExports.useEffect(() => {
    const apiBase = "https://htr-group-llc-appliance-repair.replit.app".replace(/\\/$/, "");
    fetch(apiBase + "/api/google-reviews", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      const live = (d.reviews ?? []).filter((r) => (r.rating ?? 0) >= 4);
      if (live.length) {
        const seen = new Set();
        const merged = [];
        for (const r of [...live, ...GOOGLE_HOME_REVIEWS_STATIC]) {
          const k = (r.name + "|" + (r.textEn || "").slice(0, 40)).toLowerCase();
          if (seen.has(k)) continue;
          seen.add(k);
          if ((r.rating ?? 0) >= 4) merged.push(r);
        }
        setGoogleHomeReviews(merged);
      }
      if (typeof d.rating === "number") setGoogleRating(d.rating);
      if (typeof d.userRatingCount === "number") setGoogleReviewCount(d.userRatingCount);
    }).catch(() => {});
  }, []);
"""
    c = c[:start] + fetch_block + c[end:]

# dynamic header counts in reviews section
c = c.replace('children: "5.0"', 'children: googleRating.toFixed(1)', 1)
c = c.replace('children: "(9 reviews)"', 'children: `(${googleReviewCount} reviews)`', 1)

# carousel after reviews map closing
old_close = '        )) })\n      ] }) }),\n      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "faq"'
# find reviews section close - different structure
needle = 'children: googleHomeReviews.slice(reviewPage * 10, reviewPage * 10 + 10).map'
pos = c.find(needle)
if pos > 0 and "setReviewPage((p)" not in c[pos:pos+4000]:
    close = '        )) })\n      ] }) }),'
    idx = c.find(close, pos)
    if idx > 0:
        carousel = '''        )) }),
        totalReviewPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: reviewPage <= 0, onClick: () => setReviewPage((p) => Math.max(0, p - 1)), className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-stone-500 tabular-nums", children: [reviewPage + 1, " / ", Math.max(1, Math.ceil(googleHomeReviews.length / 10))] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: reviewPage >= Math.ceil(googleHomeReviews.length / 10) - 1, onClick: () => setReviewPage((p) => Math.min(Math.ceil(googleHomeReviews.length / 10) - 1, p + 1)), className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" }) })
        ] })
      ] }) }),'''
        # wrong - need to inspect exact closing structure
        pass

bundle.write_text(c, encoding="utf-8")
if prod.exists():
    prod.write_text(c, encoding="utf-8")
print("bundle partial patch OK", len(c))
