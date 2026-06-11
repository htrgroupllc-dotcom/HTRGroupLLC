from pathlib import Path

home = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx")
t = home.read_text(encoding="utf-8")

old_phonepair = """function PhonePair({ compact = false }: { compact?: boolean }) {
  const cls = compact
    ? \"inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm\"
    : \"flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm\";
  const iconCls = compact ? \"h-4 w-4\" : \"h-3.5 w-3.5\";
  return (
    <div className=\"flex flex-col gap-1.5 items-start\">
      <a href={PHONE_HREF} className={cls} style={{ backgroundColor: K.accent }}>
        <Phone className={iconCls} /> {PHONE_DISPLAY}
      </a>
      <a href={COMPANY_PHONE_HREF} className={cls} style={{ backgroundColor: K.accent }}>
        <Phone className={iconCls} /> {COMPANY_PHONE_DISPLAY}
      </a>
    </div>
  );
}"""

new_phonepair = """function PhonePair({ compact = false, inHeader = false }: { compact?: boolean; inHeader?: boolean }) {
  const linkCls = compact
    ? \"inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm\"
    : inHeader
      ? \"header-phone-link flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm\"
      : \"flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm\";
  const iconCls = compact ? \"h-4 w-4\" : \"h-3.5 w-3.5\";
  const wrapCls = inHeader
    ? \"header-phone-pair flex flex-col gap-1 items-end\"
    : \"flex flex-col gap-1.5 items-start\";
  return (
    <div className={wrapCls}>
      <a href={PHONE_HREF} className={linkCls} style={{ backgroundColor: K.accent }}>
        <Phone className={iconCls} /> {PHONE_DISPLAY}
      </a>
      <a href={COMPANY_PHONE_HREF} className={linkCls} style={{ backgroundColor: K.accent }}>
        <Phone className={iconCls} /> {COMPANY_PHONE_DISPLAY}
      </a>
    </div>
  );
}"""

if old_phonepair not in t:
    raise SystemExit("PhonePair block not found")
t = t.replace(old_phonepair, new_phonepair, 1)

t = t.replace(
    "          <div className=\"hidden md:flex items-center gap-2 flex-shrink-0\">\n            <PhonePair />",
    "          <div className=\"hidden md:flex items-center gap-2 flex-shrink-0\">\n            <PhonePair inHeader />",
    1,
)
t = t.replace(
    "            <div className=\"mt-1\"><PhonePair /></div>",
    "            <div className=\"mt-1\"><PhonePair inHeader /></div>",
    1,
)

# header height
t = t.replace(
    '      <div className="h-14 w-full flex-shrink-0" aria-hidden="true" />',
    '      <div className="htr-header-spacer w-full flex-shrink-0" aria-hidden="true" />',
    1,
)
t = t.replace(
    '        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">',
    '        <div className="container mx-auto px-4 htr-site-header-bar flex items-center justify-between gap-3">',
    1,
)

# DraggableMarquee direction
old_marquee_sig = "function DraggableMarquee({ brands, base }: { brands: [string, string][]; base: string }) {"
new_marquee_sig = "function DraggableMarquee({ brands, base, reverse = false }: { brands: [string, string][]; base: string; reverse?: boolean }) {"
if old_marquee_sig not in t:
    raise SystemExit("DraggableMarquee sig not found")
t = t.replace(old_marquee_sig, new_marquee_sig, 1)

t = t.replace(
    "          offsetRef.current -= speedRef.current * dt;",
    "          offsetRef.current += (reverse ? 1 : -1) * speedRef.current * dt;",
    1,
)

old_marquee_use = """          <DraggableMarquee
            brands={MARQUEE_BRANDS}
            base={import.meta.env.BASE_URL.replace(/\\/$/, \"\")}
          />"""
new_marquee_use = """          <DraggableMarquee
            brands={MARQUEE_BRANDS}
            base={import.meta.env.BASE_URL.replace(/\\/$/, \"\")}
          />
          <div className="mt-3">
            <DraggableMarquee
              brands={MARQUEE_BRANDS}
              base={import.meta.env.BASE_URL.replace(/\\/$/, \"\")}
              reverse
            />
          </div>"""
if old_marquee_use not in t:
    raise SystemExit("marquee use not found")
t = t.replace(old_marquee_use, new_marquee_use, 1)

home.write_text(t, encoding="utf-8")
print("home.tsx ok")
