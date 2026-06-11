from pathlib import Path

p = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
t = p.read_text(encoding="utf-8")

# --- header desktop: single phone -> PhonePair with classes ---
header_old = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            PHONE_DISPLAY$3
          ] }),'''
header_new = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair flex flex-col gap-1 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "header-phone-link flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              PHONE_DISPLAY$3
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "header-phone-link flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              COMPANY_PHONE_DISPLAY$3
            ] })
          ] }),'''
if header_old in t and "header-phone-pair" not in t[t.find("hidden md:flex items-center gap-2 flex-shrink-0"):t.find("hidden md:flex items-center gap-2 flex-shrink-0")+2000]:
    t = t.replace(header_old, header_new, 1)
    print("header desktop patched")
elif "header-phone-pair" in t:
    print("header desktop already patched")
else:
    print("WARN header desktop pattern missing")

# --- mobile menu home ---
mobile_old = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit mt-1", style: { backgroundColor: K$3.accent }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
          " ",
          PHONE_DISPLAY$3
        ] })'''
mobile_new = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair flex flex-col gap-1.5 mt-1 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "header-phone-link flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit", style: { backgroundColor: K$3.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            PHONE_DISPLAY$3
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "header-phone-link flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit", style: { backgroundColor: K$3.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            COMPANY_PHONE_DISPLAY$3
          ] })
        ] })'''
# only first occurrence (home menu)
idx = t.find(mobile_old)
if idx != -1:
    t = t[:idx] + mobile_new + t[idx+len(mobile_old):]
    print("mobile menu patched")
else:
    print("WARN mobile menu pattern missing")

# --- header bar height classes ---
t = t.replace(
    'className: "h-14 w-full flex-shrink-0"',
    'className: "htr-header-spacer w-full flex-shrink-0"',
    1,
)
t = t.replace(
    'className: "container mx-auto px-4 h-14 flex items-center justify-between gap-3"',
    'className: "container mx-auto px-4 htr-site-header-bar flex items-center justify-between gap-3"',
    1,
)

# --- DraggableMarquee reverse ---
if "function DraggableMarquee({ brands, base, reverse" not in t:
    t = t.replace(
        "function DraggableMarquee({ brands, base }) {",
        "function DraggableMarquee({ brands, base, reverse = false }) {",
        1,
    )
    old_tick = """          offsetRef.current -= speedRef.current * dt;
          const half = track.scrollWidth / 2;
          if (half > 0 && -offsetRef.current >= half) offsetRef.current += half;"""
    new_tick = """          offsetRef.current += (reverse ? 1 : -1) * speedRef.current * dt;
          const half = track.scrollWidth / 2;
          if (half > 0) {
            if (reverse) {
              if (offsetRef.current >= half) offsetRef.current -= half;
            } else if (-offsetRef.current >= half) {
              offsetRef.current += half;
            }
          }"""
    if old_tick in t:
        t = t.replace(old_tick, new_tick, 1)
        print("marquee tick patched")
    else:
        print("WARN marquee tick missing")
    t = t.replace("  }, []);\n  const onPointerDown = (e) => {", "  }, [reverse]);\n  const onPointerDown = (e) => {", 1)

# second marquee row
marquee_use = """          DraggableMarquee,
          {
            brands: MARQUEE_BRANDS,
            base: import.meta.env.BASE_URL.replace(/\\/$/, \"\")
          }
        )"""
marquee_use2 = """          DraggableMarquee,
          {
            brands: MARQUEE_BRANDS,
            base: import.meta.env.BASE_URL.replace(/\\/$/, \"\")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DraggableMarquee,
          {
            brands: MARQUEE_BRANDS,
            base: import.meta.env.BASE_URL.replace(/\\/$/, \"\"),
            reverse: true
          }
        ) })"""
# find exact bundle format
needle = 'base: import.meta.env.BASE_URL.replace(/\\/$/, "")\n          }\n        )\n      ] })'
if needle not in t:
    # try alternate
    import re
    m = re.search(r"DraggableMarquee,\s*\{\s*brands: MARQUEE_BRANDS,\s*base: import\.meta\.env\.BASE_URL\.replace\(/\\/\$/, \"\"\)\s*\}\s*\)", t)
    if m and "reverse: true" not in t[m.start():m.start()+500]:
        # insert after first closing of DraggableMarquee in brands section
        brands_idx = t.find("Brands We Service")
        if brands_idx > 0:
            sub = t[brands_idx:brands_idx+2500]
            dm = sub.find("DraggableMarquee")
            if dm >= 0:
                end = sub.find("})", dm)
                # fragile - use known string from peek
                old_block = '''        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DraggableMarquee,
          {
            brands: MARQUEE_BRANDS,
            base: import.meta.env.BASE_URL.replace(/\\/$/, "")
          }
        )'''
                new_block = old_block + ''',
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DraggableMarquee,
          {
            brands: MARQUEE_BRANDS,
            base: import.meta.env.BASE_URL.replace(/\\/$/, ""),
            reverse: true
          }
        ) })'''
                if old_block in t and "reverse: true" not in t:
                    t = t.replace(old_block, new_block, 1)
                    print("second marquee row added")
                else:
                    print("WARN second marquee block", old_block in t, "reverse" in t)
else:
    print("needle found - manual")

if "reverse: true" in t:
    print("reverse marquee present")
else:
    old_block = '''        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DraggableMarquee,
          {
            brands: MARQUEE_BRANDS,
            base: import.meta.env.BASE_URL.replace(/\\/$/, "")
          }
        )'''
    new_block = old_block + ''',
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DraggableMarquee,
          {
            brands: MARQUEE_BRANDS,
            base: import.meta.env.BASE_URL.replace(/\\/$/, ""),
            reverse: true
          }
        ) })'''
    if old_block in t:
        t = t.replace(old_block, new_block, 1)
        print("second marquee row added (fallback)")

p.write_text(t, encoding="utf-8")
print("bundle bytes", len(t))
