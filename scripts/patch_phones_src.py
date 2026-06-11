from pathlib import Path

def patch_home():
    p = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx")
    t = p.read_text(encoding="utf-8")
    reps = [
        (
            '"inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm"',
            '"htr-phone-btn inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm"',
        ),
        (
            '"header-phone-link flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm"',
            '"header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm"',
        ),
        (
            '"flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm"',
            '"htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm"',
        ),
        (
            '"header-phone-pair flex flex-col gap-1 items-end"',
            '"header-phone-pair htr-phone-pair flex flex-col gap-1 items-end"',
        ),
        (
            '"flex flex-col gap-1.5 items-start"',
            '"htr-phone-pair flex flex-col gap-1.5 items-start"',
        ),
        (
            'className="flex flex-col sm:flex-row items-center justify-center gap-3">\n        <a href={PHONE_HREF} className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm"',
            'className="htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3">\n        <a href={PHONE_HREF} className="htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm"',
        ),
        (
            '<a href={COMPANY_PHONE_HREF} className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm" style={{ backgroundColor: K.accent }}>\n          <Phone className="h-4 w-4" /> {COMPANY_PHONE_DISPLAY}',
            '<a href={COMPANY_PHONE_HREF} className="htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm" style={{ backgroundColor: K.accent }}>\n          <Phone className="h-4 w-4" /> {COMPANY_PHONE_DISPLAY}',
        ),
        (
            'className="font-bold text-stone-900 hover:opacity-70 transition-opacity block">{PHONE_DISPLAY}',
            'className="htr-phone-btn htr-phone-btn--contact font-bold text-stone-900 hover:opacity-70 transition-opacity block">{PHONE_DISPLAY}',
        ),
        (
            'className="font-bold text-stone-900 hover:opacity-70 transition-opacity block mt-1">{COMPANY_PHONE_DISPLAY}',
            'className="htr-phone-btn htr-phone-btn--contact font-bold text-stone-900 hover:opacity-70 transition-opacity block mt-1">{COMPANY_PHONE_DISPLAY}',
        ),
        (
            'className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm">\n            <a href={PHONE_HREF} className="inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity"',
            'className="htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm">\n            <a href={PHONE_HREF} className="htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity"',
        ),
        (
            '<a href={COMPANY_PHONE_HREF} className="inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity">\n              <Phone className="h-4 w-4" style={{ color: K.accentLight }} /> {COMPANY_PHONE_DISPLAY}',
            '<a href={COMPANY_PHONE_HREF} className="htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity">\n              <Phone className="h-4 w-4" style={{ color: K.accentLight }} /> {COMPANY_PHONE_DISPLAY}',
        ),
    ]
    for old, new in reps:
        if old not in t:
            raise SystemExit(f"home missing: {old[:60]}...")
        t = t.replace(old, new, 1)
    p.write_text(t, encoding="utf-8")
    print("home.tsx ok")

def patch_gallery():
    p = Path(r"C:\Projects\HTRGroupLLC\src\pages\gallery.tsx")
    t = p.read_text(encoding="utf-8")
    reps = [
        (
            'className="flex flex-col gap-1 items-end"><a href={PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm"',
            'className="header-phone-pair htr-phone-pair flex flex-col gap-1 items-end"><a href={PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm"',
        ),
        (
            '<a href={COMPANY_PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}</a></div>',
            '<a href={COMPANY_PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}</a></div>',
        ),
        (
            'className="flex flex-col gap-1.5 mt-1"><a href={PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit"',
            'className="header-phone-pair htr-phone-pair flex flex-col gap-1.5 mt-1 items-start"><a href={PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit"',
        ),
        (
            '<a href={COMPANY_PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}</a></div>',
            '<a href={COMPANY_PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}</a></div>',
        ),
        (
            'className="flex flex-col sm:flex-row items-center justify-center gap-3">\n            <a href={PHONE_HREF} className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base"',
            'className="htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3">\n            <a href={PHONE_HREF} className="htr-phone-btn htr-phone-btn--lg inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base"',
        ),
        (
            '<a href={COMPANY_PHONE_HREF} className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base" style={{ backgroundColor: K.accent }}>\n              <Phone className="h-4 w-4" /> {COMPANY_PHONE_DISPLAY}',
            '<a href={COMPANY_PHONE_HREF} className="htr-phone-btn htr-phone-btn--lg inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base" style={{ backgroundColor: K.accent }}>\n              <Phone className="h-4 w-4" /> {COMPANY_PHONE_DISPLAY}',
        ),
    ]
    for old, new in reps:
        if old not in t:
            raise SystemExit(f"gallery missing: {old[:60]}...")
        t = t.replace(old, new, 1)
    p.write_text(t, encoding="utf-8")
    print("gallery.tsx ok")

patch_home()
patch_gallery()
