"""Patch index-utf8-v4.js for Google Reviews v55 — API-only, mobile carousel, View on Google."""
import re
from pathlib import Path

ROOT = Path(r"C:/Projects/HTRGroupLLC")
BUNDLE = ROOT / "assets/index-utf8-v4.js"
PROD = ROOT / "assets/index-utf8-v4.prod.js"
CSS = ROOT / "assets/index-_bdQPowM.css"
INDEX = ROOT / "index.html"

FETCH_OLD = '''  const [googleHomeReviews, setGoogleHomeReviews] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const apiBase = "https://htr-group-llc-appliance-repair.replit.app".replace(/\\/$/, "");
    fetch(apiBase + "/api/google-reviews", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      if (d.ok && Array.isArray(d.reviews) && d.placeId === "ChIJG17BnG_bZiARTsOUc0JlvyE") {
        const live = d.reviews.filter((r) => (r.rating ?? 0) >= 4);
        setGoogleHomeReviews(live);
        if (typeof d.rating === "number") setGoogleRating(d.rating);
        if (typeof d.userRatingCount === "number") setGoogleReviewCount(d.userRatingCount);
      } else {
        setGoogleHomeReviews([]);
        setGoogleRating(null);
        setGoogleReviewCount(null);
      }
    }).catch(() => {
      setGoogleHomeReviews([]);
    });
  }, []);'''

FETCH_NEW = '''  const GOOGLE_PLACE_ID_VERIFIED = "ChIJG17BnG_bZiARTsOUc0JlvyE";
  const sortReviewsNewest = (list) => [...list].sort((a, b) => (b.publishTime ?? 0) - (a.publishTime ?? 0));
  const [googleHomeReviews, setGoogleHomeReviews] = reactExports.useState([]);
  const [mobileReviewIdx, setMobileReviewIdx] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const apiBase = "https://htr-group-llc-appliance-repair.replit.app".replace(/\\/$/, "");
    fetch(apiBase + "/api/google-reviews", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      const okSource = d.ok || d.source === "stale_cache" || d.source === "cache";
      if (okSource && Array.isArray(d.reviews) && d.reviews.length && d.placeId === GOOGLE_PLACE_ID_VERIFIED) {
        const live = sortReviewsNewest(d.reviews.filter((r) => (r.rating ?? 0) >= 4));
        setGoogleHomeReviews(live);
        setMobileReviewIdx(0);
        if (typeof d.rating === "number") setGoogleRating(d.rating);
        if (typeof d.userRatingCount === "number") setGoogleReviewCount(d.userRatingCount);
      } else {
        setGoogleHomeReviews([]);
        setGoogleRating(null);
        setGoogleReviewCount(null);
      }
    }).catch(() => {
      setGoogleHomeReviews([]);
    });
  }, []);'''

REVIEW_CARD_FN = '''
  const renderGoogleReviewCard = (r, i, keyPrefix) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div", { key: `${keyPrefix}-${r.name}-${i}`, className: "bg-white rounded-lg shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
            r.profilePhotoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.profilePhotoUrl, alt: "", className: "htr-google-review-avatar rounded-full flex-shrink-0 object-cover", loading: "lazy", referrerPolicy: "no-referrer" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-google-review-avatar rounded-full flex items-center justify-center text-white font-bold flex-shrink-0", style: { backgroundColor: r.avatarColor }, children: r.initials }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "htr-google-review-name font-semibold text-stone-900 truncate", children: r.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "htr-google-review-time text-stone-400 leading-none", children: r.time })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#4285F4] font-extrabold text-sm leading-none flex-shrink-0", "aria-hidden": "true", children: "G" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5 mb-1.5", children: Array.from({ length: r.rating }).map((_, j) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { key: j, className: "htr-google-star htr-google-review-star", style: { color: "#FBBC04", fill: "#FBBC04" } })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "htr-google-review-body text-stone-600 flex-1 line-clamp-3", children: isEs ? r.textEs : r.textEn }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: GOOGLE_REVIEW_URL_HOME, target: "_blank", rel: "noopener noreferrer", className: "mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#4285F4] hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3 shrink-0" }),
          isEs ? "Ver en Google" : "View on Google"
        ] })
      ]
    }
  );
'''

# Old grid-only block start marker
GRID_START = '        !googleHomeReviews.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p"'
GRID_END = '        ] }) }),\n      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "faq"'

MOBILE_DESKTOP_BLOCK = '''        !googleHomeReviews.length && !loadingGoogleReviews && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-stone-500 font-medium py-6 text-center col-span-full", children: isEs ? "No hay reseñas de Google disponibles en este momento." : "No Google reviews available right now. Please try again later." }),
        googleHomeReviews.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden relative htr-google-reviews-mobile", children: [
            renderGoogleReviewCard(googleHomeReviews[mobileReviewIdx], mobileReviewIdx, "mob"),
            googleHomeReviews.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": isEs ? "Reseñas anteriores" : "Previous reviews", disabled: mobileReviewIdx <= 0, onClick: () => setMobileReviewIdx((i) => Math.max(0, i - 1)), className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm disabled:opacity-40 hover:opacity-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-stone-500 tabular-nums", children: [mobileReviewIdx + 1, " / ", googleHomeReviews.length] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": isEs ? "Siguientes reseñas" : "Next reviews", disabled: mobileReviewIdx >= googleHomeReviews.length - 1, onClick: () => setMobileReviewIdx((i) => Math.min(googleHomeReviews.length - 1, i + 1)), className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm disabled:opacity-40 hover:opacity-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative htr-google-reviews-grid-wrap hidden md:block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-google-reviews-grid grid gap-2 md:gap-2.5 lg:grid-cols-5 lg:grid-rows-2 lg:grid-flow-row", children: googleHomeReviews.slice(reviewPage * 10, reviewPage * 10 + 10).map((r, i) => renderGoogleReviewCard(r, i, "desk")) }),
            Math.ceil(googleHomeReviews.length / 10) > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": isEs ? "Reseñas anteriores" : "Previous reviews", disabled: reviewPage <= 0, onClick: () => setReviewPage((p) => Math.max(0, p - 1)), className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm disabled:opacity-40 hover:opacity-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-stone-500 tabular-nums", children: [reviewPage + 1, " / ", Math.max(1, Math.ceil(googleHomeReviews.length / 10))] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": isEs ? "Siguientes reseñas" : "Next reviews", disabled: reviewPage >= Math.ceil(googleHomeReviews.length / 10) - 1, onClick: () => setReviewPage((p) => Math.min(Math.ceil(googleHomeReviews.length / 10) - 1, p + 1)), className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm disabled:opacity-40 hover:opacity-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" }) })
            ] })
          ] })
        ] })
'''


def patch_bundle(path: Path) -> None:
    c = path.read_text(encoding="utf-8")
    for bad in ["James W.", "Mastertex", "const RAW = [", "Brian T.", "Emma L."]:
        if bad in c:
            raise SystemExit(f"{path.name} contains forbidden: {bad}")

    if FETCH_OLD not in c:
        if "GOOGLE_PLACE_ID_VERIFIED" in c and "renderGoogleReviewCard" in c:
            print(f"skip already patched: {path.name}")
            return
        raise SystemExit(f"fetch block not found in {path.name}")

    c = c.replace(FETCH_OLD, FETCH_NEW, 1)

    if "renderGoogleReviewCard" not in c:
        anchor = "  const handleServiceClick = (svc) => {"
        if anchor not in c:
            raise SystemExit("handleServiceClick anchor missing")
        c = c.replace(anchor, REVIEW_CARD_FN + "\n" + anchor, 1)

    # Replace reviews grid section
    faq_idx = c.find('      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "faq"')
    rev_idx = c.rfind('id: "reviews"', 0, faq_idx)
    if rev_idx < 0:
        raise SystemExit("reviews section not found")
    # find empty state line before grid
    empty_marker = '!googleHomeReviews.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p"'
    empty_idx = c.find(empty_marker, rev_idx, faq_idx)
    if empty_idx < 0:
        raise SystemExit("empty state marker not found")
    c = c[empty_idx:faq_idx]
    # re-read - use slice approach on full file
    full = path.read_text(encoding="utf-8")
    faq_idx = full.find('      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "faq"')
    rev_idx = full.rfind('id: "reviews"', 0, faq_idx)
    empty_idx = full.find(empty_marker, rev_idx, faq_idx)
    full = full[:empty_idx] + MOBILE_DESKTOP_BLOCK + ",\n      " + full[faq_idx:]
    path.write_text(full, encoding="utf-8")
    print(f"patched {path.name}")


def patch_css() -> None:
    css = CSS.read_text(encoding="utf-8")
    extra = ".htr-google-reviews-mobile {\n  max-width: 100%;\n}\n"
    if ".htr-google-reviews-mobile" not in css:
        marker = ".htr-google-review-card .htr-google-review-avatar {"
        css = css.replace(marker, extra + marker, 1)
        CSS.write_text(css, encoding="utf-8")
        print("patched CSS")


def bump_index() -> None:
    html = INDEX.read_text(encoding="utf-8")
    html = re.sub(r"index-utf8-v4\.js\?v=\d+", "index-utf8-v4.js?v=56", html)
    html = re.sub(r"index-_bdQPowM\.css\?v=\d+", "index-_bdQPowM.css?v=56", html)
    INDEX.write_text(html, encoding="utf-8")
    print("index.html -> v=56")


for p in [BUNDLE, PROD]:
    if p.exists():
        patch_bundle(p)

patch_css()
bump_index()
print("done v55/v56")
