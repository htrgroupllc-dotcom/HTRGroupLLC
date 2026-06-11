from pathlib import Path

def patch_home():
    p = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx")
    h = p.read_text(encoding="utf-8")
    old = 'const PHONE_DISPLAY = "(346) 820-6021";\nconst PHONE_HREF    = "tel:3468206021";'
    new = 'import { PHONE_DISPLAY, PHONE_HREF, COMPANY_PHONE_DISPLAY, COMPANY_PHONE_HREF } from "@/lib/sitePhones";'
    if old in h:
        h = h.replace(old, new, 1)
    elif "sitePhones" not in h:
        raise SystemExit("home.tsx phone constants not found")

    phone_pair = '''
function PhonePair({ compact = false }: { compact?: boolean }) {
  const cls = compact
    ? "inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm"
    : "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm";
  const iconCls = compact ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex flex-col gap-1.5 items-start">
      <a href={PHONE_HREF} className={cls} style={{ backgroundColor: K.accent }}>
        <Phone className={iconCls} /> {PHONE_DISPLAY}
      </a>
      <a href={COMPANY_PHONE_HREF} className={cls} style={{ backgroundColor: K.accent }}>
        <Phone className={iconCls} /> {COMPANY_PHONE_DISPLAY}
      </a>
    </div>
  );
}

function MidPhoneStrip() {
  return (
    <div className="py-6 text-center bg-white border-y border-stone-100">
      <p className="text-stone-600 text-sm font-semibold mb-3">Call us anytime</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href={PHONE_HREF} className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm" style={{ backgroundColor: K.accent }}>
          <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
        </a>
        <a href={COMPANY_PHONE_HREF} className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm" style={{ backgroundColor: K.accent }}>
          <Phone className="h-4 w-4" /> {COMPANY_PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}
'''
    if "function PhonePair" not in h:
        marker = "const PHONE_DISPLAY"
        if marker in h:
            pass
        # insert before BRANDS_BY_APPLIANCE
        anchor = "type BrandEntry = { brand: string; models: string[] };"
        h = h.replace(anchor, phone_pair + "\n" + anchor, 1)

    # desktop header phone block
    h = h.replace(
        '<a href={PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}>\n              <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}\n            </a>',
        '<PhonePair />',
        1,
    )
    h = h.replace(
        '<a href={PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit mt-1" style={{ backgroundColor: K.accent }}>\n              <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}\n            </a>',
        '<div className="mt-1"><PhonePair /></div>',
        1,
    )

    # hero phones (mobile + desktop) - two similar blocks
    hero_old = '''<a href={PHONE_HREF} className="inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm mb-4" style={{ backgroundColor: K.accent }}>
                  <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
                </a>'''
    hero_new = '''<div className="mb-4"><PhonePair compact /></div>'''
    h = h.replace(hero_old, hero_new)

    # after stats section
    stats_end = "        </section>\n\n        {/* ── WHY US ── */}"
    if "<MidPhoneStrip />" not in h and stats_end in h:
        h = h.replace(stats_end, "        </section>\n\n        <MidPhoneStrip />\n\n        {/* ── WHY US ── */}", 1)

    # after gallery section
    gal_end = "        </section>\n\n        {/* ── OUR CERTIFICATIONS ── */}"
    if h.count("<MidPhoneStrip />") < 2 and gal_end in h:
        h = h.replace(gal_end, "        </section>\n\n        <MidPhoneStrip />\n\n        {/* ── OUR CERTIFICATIONS ── */}", 1)

    # contact phone list
    contact_old = '''                  <li className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: K.accent }} />
                    <div>
                      <a href={PHONE_HREF} className="font-bold text-stone-900 hover:opacity-70 transition-opacity">{PHONE_DISPLAY}</a>
                      <p className="text-stone-400 text-xs mt-0.5 leading-snug">{T.smsHint}</p>
                    </div>
                  </li>'''
    contact_new = '''                  <li className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: K.accent }} />
                    <div>
                      <a href={PHONE_HREF} className="font-bold text-stone-900 hover:opacity-70 transition-opacity block">{PHONE_DISPLAY}</a>
                      <a href={COMPANY_PHONE_HREF} className="font-bold text-stone-900 hover:opacity-70 transition-opacity block mt-1">{COMPANY_PHONE_DISPLAY}</a>
                      <p className="text-stone-400 text-xs mt-0.5 leading-snug">{T.smsHint}</p>
                    </div>
                  </li>'''
    h = h.replace(contact_old, contact_new, 1)

    # footer phones
    footer_anchor = '''          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">'''
    footer_new = '''          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm">
            <a href={PHONE_HREF} className="inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" style={{ color: K.accentLight }} /> {PHONE_DISPLAY}
            </a>
            <a href={COMPANY_PHONE_HREF} className="inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" style={{ color: K.accentLight }} /> {COMPANY_PHONE_DISPLAY}
            </a>
          </div>
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">'''
    if "COMPANY_PHONE_HREF" in h and footer_new not in h:
        h = h.replace(footer_anchor, footer_new, 1)

    p.write_text(h, encoding="utf-8")
    print("home patched")


def patch_gallery():
    p = Path(r"C:\Projects\HTRGroupLLC\src\pages\gallery.tsx")
    h = p.read_text(encoding="utf-8")
    old = 'const PHONE_DISPLAY = "(346) 820-6021";\nconst PHONE_HREF    = "tel:3468206021";'
    new = 'import { PHONE_DISPLAY, PHONE_HREF, COMPANY_PHONE_DISPLAY, COMPANY_PHONE_HREF } from "@/lib/sitePhones";'
    if old in h:
        h = h.replace(old, new, 1)

    # header phones - simple duplicate pattern as home
    for block, repl in [
        (
            '<a href={PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}>\n              <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}\n            </a>',
            '<div className="flex flex-col gap-1 items-end"><a href={PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}</a><a href={COMPANY_PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}</a></div>',
        ),
        (
            '<a href={PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit mt-1" style={{ backgroundColor: K.accent }}>\n              <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}\n            </a>',
            '<div className="flex flex-col gap-1.5 mt-1"><a href={PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}</a><a href={COMPANY_PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}</a></div>',
        ),
    ]:
        if block in h:
            h = h.replace(block, repl, 1)

    # dynamic photos onClick
    h = h.replace(
        "{dynPhotos.map(photo => (",
        "{dynPhotos.map((photo, di) => (",
        1,
    )
    dyn_div = '''                <div
                  key={`dyn-${photo.id}`}
                  className="rounded-xl overflow-hidden shadow-sm border border-stone-100 group cursor-pointer flex-shrink-0 relative"
                  style={{ width: "142px" }}
                >'''
    dyn_div_new = '''                <div
                  key={`dyn-${photo.id}`}
                  className="rounded-xl overflow-hidden shadow-sm border border-stone-100 group cursor-pointer flex-shrink-0 relative"
                  style={{ width: "142px" }}
                  onClick={() => setGalleryIdx(di)}
                >'''
    h = h.replace(dyn_div, dyn_div_new, 1)

    h = h.replace("onClick={() => setGalleryIdx(i)}", "onClick={() => setGalleryIdx(dynPhotos.length + i)}", 1)

    # inject helper vars before lightbox - find galleryIdx !== null block and replace GALLERY_PHOTOS[galleryIdx] logic
    if "const galleryTotal" not in h:
        anchor = "      {/* ── LIGHTBOX ── */}"
        inject = '''      {galleryIdx !== null && (() => {
        const galleryTotal = dynPhotos.length + GALLERY_PHOTOS.length;
        const isDyn = galleryIdx < dynPhotos.length;
        const slideSrc = isDyn
          ? `${API}/api/gallery/file/${dynPhotos[galleryIdx].filename}`
          : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].src;
        const slideCapEn = isDyn ? dynPhotos[galleryIdx].caption_en : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEn;
        const slideCapEs = isDyn ? dynPhotos[galleryIdx].caption_es : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEs;
        return (
      {/* ── LIGHTBOX ── */}'''
        # This is getting messy - do direct replacement of lightbox section instead
        pass

    # Replace entire lightbox block
    import re
    lb_pat = re.compile(r"\{/\* ── LIGHTBOX ── \*/\}\s*\{galleryIdx !== null && \([\s\S]*?\)\}\s*\)\}", re.M)
    # simpler string replace for lightbox innards
    h = h.replace(
        "setGalleryIdx((galleryIdx - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length);",
        "setGalleryIdx((galleryIdx - 1 + dynPhotos.length + GALLERY_PHOTOS.length) % (dynPhotos.length + GALLERY_PHOTOS.length));",
    )
    h = h.replace(
        "setGalleryIdx((galleryIdx + 1) % GALLERY_PHOTOS.length);",
        "setGalleryIdx((galleryIdx + 1) % (dynPhotos.length + GALLERY_PHOTOS.length));",
    )
    h = h.replace(
        "src={GALLERY_PHOTOS[galleryIdx].src}",
        "src={galleryIdx < dynPhotos.length ? `${API}/api/gallery/file/${dynPhotos[galleryIdx].filename}` : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].src}",
    )
    h = h.replace(
        "alt={isEs ? GALLERY_PHOTOS[galleryIdx].captionEs : GALLERY_PHOTOS[galleryIdx].captionEn}",
        "alt={isEs ? (galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_es : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEs) : (galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_en : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEn)}",
    )
    h = h.replace(
        "{isEs ? GALLERY_PHOTOS[galleryIdx].captionEs : GALLERY_PHOTOS[galleryIdx].captionEn}",
        "{isEs ? (galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_es : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEs) : (galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_en : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEn)}",
    )
    h = h.replace(
        "{galleryIdx + 1} / {GALLERY_PHOTOS.length}",
        "{galleryIdx + 1} / {dynPhotos.length + GALLERY_PHOTOS.length}",
    )

    # CTA band both phones
    cta_old = '''          <a
            href={PHONE_HREF}
            className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base"
            style={{ backgroundColor: K.accent }}
          >
            <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
          </a>'''
    cta_new = '''          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={PHONE_HREF} className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base" style={{ backgroundColor: K.accent }}>
              <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
            </a>
            <a href={COMPANY_PHONE_HREF} className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base" style={{ backgroundColor: K.accent }}>
              <Phone className="h-4 w-4" /> {COMPANY_PHONE_DISPLAY}
            </a>
          </div>'''
    h = h.replace(cta_old, cta_new, 1)

    p.write_text(h, encoding="utf-8")
    print("gallery patched")

patch_home()
patch_gallery()
