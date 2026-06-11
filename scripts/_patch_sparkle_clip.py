from pathlib import Path
ROOT = Path(r"C:\Projects\HTRGroupLLC")

HERO_EFFECTS_MOBILE = """            <div className=\"htr-home-hero-effects absolute inset-0 overflow-visible pointer-events-none\" aria-hidden>
              <HeroCircuitEffect />
              <div className=\"hero-pulse-ring\" />
              <div className=\"hero-pulse-ring-2\" />
              <div className=\"hero-rotate-glow\" />
              <span className=\"hero-sparkle hero-sparkle-1\" aria-hidden>✦</span>
              <span className=\"hero-sparkle hero-sparkle-2\" aria-hidden>✦</span>
              <span className=\"hero-sparkle hero-sparkle-3\" aria-hidden>✦</span>
              <span className=\"hero-sparkle hero-sparkle-4\" aria-hidden>✦</span>
              <span className=\"hero-sparkle hero-sparkle-5\" aria-hidden>✦</span>
            </div>"""

def patch_home():
    p = ROOT / "src" / "pages" / "home.tsx"
    h = p.read_text(encoding="utf-8")
    h = h.replace(
        '<header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-stone-200 shadow-sm">',
        '<header className="htr-site-header-root fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-stone-200 shadow-sm">',
        1,
    )
    h = h.replace(
        '<div className="w-full text-center text-xs sm:text-sm md:text-lg font-semibold text-white py-1.5 px-3 leading-snug" style={{ backgroundColor: "#D97706" }}>',
        '<div className="htr-promo-bar w-full text-center text-xs sm:text-sm md:text-lg font-semibold text-white py-1.5 px-3 leading-snug" style={{ backgroundColor: "#D97706" }}>',
        1,
    )
    h = h.replace(
        '<div className="relative overflow-hidden" style={{ height: "220px" }}>',
        '<div className="relative htr-home-hero-mobile overflow-x-hidden" style={{ height: "220px" }}>',
        1,
    )
    old_m = """              <HeroCircuitEffect />
              <div className=\"hero-pulse-ring\" />
              <div className=\"hero-pulse-ring-2\" />"""
    if old_m in h and "htr-home-hero-effects" not in h.split(old_m)[0][-500:]:
        h = h.replace(old_m, HERO_EFFECTS_MOBILE.replace("            ", "              "), 1)
    old_d = """            <HeroCircuitEffect />
            <div className=\"hero-pulse-ring\" />
            <div className=\"hero-pulse-ring-2\" />"""
    if old_d in h:
        h = h.replace(old_d, HERO_EFFECTS_MOBILE, 1)
    p.write_text(h, encoding="utf-8")
    print("home.tsx ok")

def patch_css(rel):
    p = ROOT / rel
    css = p.read_text(encoding="utf-8")
    css = css.replace(
        ".logo-container { position: relative; }",
        ".logo-container {\n  position: relative;\n  overflow: visible;\n}",
        1,
    )
    if ".htr-site-header-root" not in css:
        css = css.replace(
            ".htr-site-header-bar {\n  min-height: 3.5rem;\n  padding-top: 2mm;\n  padding-bottom: 2mm;\n}",
            ".htr-site-header-root {\n  overflow: visible;\n}\n.htr-site-header-bar {\n  min-height: 3.5rem;\n  padding-top: 2mm;\n  padding-bottom: 2mm;\n  overflow: visible;\n}",
            1,
        )
    old_hero = """/* Home hero: keep blue banner from overlapping services grid */
.htr-home-hero-desktop {
  overflow: hidden;
  isolation: isolate;
}
.htr-home-hero-desktop .htr-hero-banner {
  max-height: 100%;
  overflow: auto;
}"""
    new_hero = """/* Home hero: keep blue banner from overlapping services grid */
.htr-home-hero-desktop {
  overflow-x: hidden;
  overflow-y: visible;
  isolation: isolate;
}
.htr-home-hero-mobile {
  overflow-x: hidden;
  overflow-y: visible;
}
.htr-home-hero-effects {
  overflow: visible;
  z-index: 6;
}
.htr-home-hero-desktop .htr-hero-banner {
  max-height: 100%;
  overflow: auto;
}
.htr-promo-bar {
  position: relative;
  z-index: 2;
}"""
    if old_hero in css:
        css = css.replace(old_hero, new_hero, 1)
    elif ".htr-home-hero-mobile" not in css and ".htr-home-hero-desktop" in css:
        css = css.replace(
            ".htr-home-hero-desktop {\n  overflow: hidden;",
            ".htr-home-hero-desktop {\n  overflow-x: hidden;\n  overflow-y: visible;",
            1,
        )
    p.write_text(css, encoding="utf-8")
    print("css ok", rel)

def patch_bundle():
    p = ROOT / "assets" / "index-utf8-v4.js"
    t = p.read_text(encoding="utf-8")
    t = t.replace(
        'className: "fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-stone-200 shadow-sm"',
        'className: "htr-site-header-root fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-stone-200 shadow-sm"',
        1,
    )
    t = t.replace(
        'className: "w-full text-center text-xs sm:text-sm md:text-lg font-semibold text-white py-1.5 px-3 leading-snug", style: { backgroundColor: "#D97706" }',
        'className: "htr-promo-bar w-full text-center text-xs sm:text-sm md:text-lg font-semibold text-white py-1.5 px-3 leading-snug", style: { backgroundColor: "#D97706" }',
        1,
    )
    t = t.replace(
        'className: "relative overflow-hidden", style: { height: "220px" }',
        'className: "relative htr-home-hero-mobile overflow-x-hidden", style: { height: "220px" }',
        1,
    )
    mob_old = """            /* @__PURE__ */ jsxRuntimeExports.jsx(HeroCircuitEffect, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-pulse-ring" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-pulse-ring-2" })"""
    mob_new = """            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-home-hero-effects absolute inset-0 overflow-visible pointer-events-none", "aria-hidden": true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HeroCircuitEffect, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-pulse-ring" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-pulse-ring-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-rotate-glow" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-sparkle hero-sparkle-1", "aria-hidden": true, children: "\\u2726" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-sparkle hero-sparkle-2", "aria-hidden": true, children: "\\u2726" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-sparkle hero-sparkle-3", "aria-hidden": true, children: "\\u2726" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-sparkle hero-sparkle-4", "aria-hidden": true, children: "\\u2726" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-sparkle hero-sparkle-5", "aria-hidden": true, children: "\\u2726" })
            ] })"""
    if mob_old in t:
        t = t.replace(mob_old, mob_new, 1)
    desk_old = """          /* @__PURE__ */ jsxRuntimeExports.jsx(HeroCircuitEffect, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-pulse-ring" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-pulse-ring-2" }),"""
    desk_new = """          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-home-hero-effects absolute inset-0 overflow-visible pointer-events-none", "aria-hidden": true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HeroCircuitEffect, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-pulse-ring" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-pulse-ring-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-rotate-glow" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-sparkle hero-sparkle-1", "aria-hidden": true, children: "\\u2726" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-sparkle hero-sparkle-2", "aria-hidden": true, children: "\\u2726" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-sparkle hero-sparkle-3", "aria-hidden": true, children: "\\u2726" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-sparkle hero-sparkle-4", "aria-hidden": true, children: "\\u2726" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hero-sparkle hero-sparkle-5", "aria-hidden": true, children: "\\u2726" })
          ] }),"""
    if desk_old in t:
        t = t.replace(desk_old, desk_new, 1)
    p.write_text(t, encoding="utf-8")
    print("bundle ok")

patch_home()
patch_css("src/index.css")
patch_css("assets/index-_bdQPowM.css")
patch_bundle()
