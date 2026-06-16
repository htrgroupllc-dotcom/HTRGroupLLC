from pathlib import Path

EXTRA_BUNDLE = '''
    { name: "James W.", initials: "JW", avatarColor: "#7D6608", rating: 5, time: "1 month ago", textEn: "Fixed my fridge same day, no drama. Highly recommend.", textEs: "Arreglaron la nevera el mismo dia. Muy recomendados." },
    { name: "Sarah J.", initials: "SJ", avatarColor: "#884EA0", rating: 5, time: "2 months ago", textEn: "Tech showed up on time and knew exactly what was wrong. Fair price.", textEs: "El tecnico llego puntual y supo el problema de inmediato. Precio justo." },
    { name: "David T.", initials: "DT", avatarColor: "#1F618D", rating: 5, time: "7 months ago", textEn: "Called at 8 AM, fixed by noon. Oven works perfectly now.", textEs: "Llame a las 8, arreglado al mediodia. El horno funciona perfecto." },
    { name: "Lisa M.", initials: "LM", avatarColor: "#D35400", rating: 5, time: "6 months ago", textEn: "Refrigerator back to normal after one visit. No hidden fees at all.", textEs: "La nevera normal despues de una visita. Sin cargos ocultos." },
    { name: "Maria S.", initials: "MS", avatarColor: "#1E8449", rating: 5, time: "2 months ago", textEn: "Called for dishwasher repair. Fixed same day, no extra fees.", textEs: "Llame por el lavavajillas. Arreglado ese dia, sin cargos extra." },
'''

b = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
c = b.read_text(encoding="utf-8")
start = c.find("const GOOGLE_HOME_REVIEWS_STATIC = [")
end = c.find("];", start)
block = c[start:end+2]
if "James W." in block:
    print("static already has James W")
else:
    insert_at = block.rfind("}")
    new_block = block[:insert_at+1] + "," + EXTRA_BUNDLE + block[insert_at+1:]
    c = c[:start] + new_block + c[end+2:]
    b.write_text(c, encoding="utf-8")
    print("patched static array")

# always use full merged list even when API empty
old = "      if (live.length) {\n        const seen = new Set();\n        const merged = [];\n        for (const r of [...live, ...GOOGLE_HOME_REVIEWS_STATIC]) {\n          const k = (r.name + \"|\" + (r.textEn || \"\").slice(0, 40)).toLowerCase();\n          if (seen.has(k)) continue;\n          seen.add(k);\n          if ((r.rating ?? 0) >= 4) merged.push(r);\n        }\n        setGoogleHomeReviews(merged);\n      }"
new = "      {\n        const seen = new Set();\n        const merged = [];\n        for (const r of [...live, ...GOOGLE_HOME_REVIEWS_STATIC]) {\n          const k = (r.name + \"|\" + (r.textEn || \"\").slice(0, 40)).toLowerCase();\n          if (seen.has(k)) continue;\n          seen.add(k);\n          if ((r.rating ?? 0) >= 4) merged.push(r);\n        }\n        if (merged.length) setGoogleHomeReviews(merged);\n      }"
if old in c:
    c = c.replace(old, new, 1)
    b.write_text(c, encoding="utf-8")
    print("fixed merge always")
else:
    print("merge block not found")

html = Path(r"C:/Projects/HTRGroupLLC/index.html")
h = html.read_text(encoding="utf-8")
h = h.replace("index-utf8-v4.js?v=32", "index-utf8-v4.js?v=33")
html.write_text(h, encoding="utf-8")
print("v=33")
