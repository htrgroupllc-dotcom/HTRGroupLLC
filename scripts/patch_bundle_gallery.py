from pathlib import Path

p = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
t = p.read_text(encoding="utf-8")
orig_len = len(t)

t = t.replace("tel:3466968751", "tel:+13466968751")

# Gallery: dyn photo click
old_dyn = "dynPhotos.map((photo) => /* @__PURE__ */ jsxRuntimeExports.jsxs(\n          \"div\",\n          {\n            className: \"rounded-xl overflow-hidden shadow-sm border border-stone-100 group cursor-pointer flex-shrink-0 relative\",\n            style: { width: \"142px\" },"
new_dyn = "dynPhotos.map((photo, di) => /* @__PURE__ */ jsxRuntimeExports.jsxs(\n          \"div\",\n          {\n            className: \"rounded-xl overflow-hidden shadow-sm border border-stone-100 group cursor-pointer flex-shrink-0 relative\",\n            style: { width: \"142px\" },\n            onClick: () => setGalleryIdx(di),"
if old_dyn not in t:
    raise SystemExit("dynPhotos block not found")
t = t.replace(old_dyn, new_dyn, 1)

t = t.replace("onClick: () => setGalleryIdx(i),", "onClick: () => setGalleryIdx(dynPhotos.length + i),", 1)

t = t.replace(
    "setGalleryIdx((galleryIdx - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length);",
    "setGalleryIdx((galleryIdx - 1 + dynPhotos.length + GALLERY_PHOTOS.length) % (dynPhotos.length + GALLERY_PHOTOS.length));",
)
t = t.replace(
    "setGalleryIdx((galleryIdx + 1) % GALLERY_PHOTOS.length);",
    "setGalleryIdx((galleryIdx + 1) % (dynPhotos.length + GALLERY_PHOTOS.length));",
)
t = t.replace(
    "src: GALLERY_PHOTOS[galleryIdx].src,",
    "src: galleryIdx < dynPhotos.length ? `${API$3}/api/gallery/file/${dynPhotos[galleryIdx].filename}` : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].src,",
)
t = t.replace(
    "alt: isEs ? GALLERY_PHOTOS[galleryIdx].captionEs : GALLERY_PHOTOS[galleryIdx].captionEn,",
    "alt: isEs ? galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_es : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEs : galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_en : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEn,",
)
t = t.replace(
    "children: isEs ? GALLERY_PHOTOS[galleryIdx].captionEs : GALLERY_PHOTOS[galleryIdx].captionEn",
    "children: isEs ? galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_es : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEs : galleryIdx < dynPhotos.length ? dynPhotos[galleryIdx].caption_en : GALLERY_PHOTOS[galleryIdx - dynPhotos.length].captionEn",
)
t = t.replace(
    "galleryIdx + 1,\n                  \" / \",\n                  GALLERY_PHOTOS.length",
    "galleryIdx + 1,\n                  \" / \",\n                  dynPhotos.length + GALLERY_PHOTOS.length",
)

# Inject company phone constants after first PHONE_HREF in home bundle - too hard; patch strings for display
# Add COMPANY constants near sitePhones - inject after PHONE_DISPLAY in home component
marker = 'const PHONE_HREF$5 = "tel:+13466968751";'
if marker in t and "COMPANY_PHONE_HREF" not in t:
    t = t.replace(marker, marker + '\nconst COMPANY_PHONE_DISPLAY$1 = "(606) 660-6067";\nconst COMPANY_PHONE_HREF$1 = "tel:+16066606067";', 1)

# For bundle phone UI - we'll append minimal HTML patches via searching unique home/footer strings
# Skip complex home UI in bundle if we can't - user needs production fix

p.write_text(t, encoding="utf-8")
print("bundle len delta", len(t)-orig_len)
