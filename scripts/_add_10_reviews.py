from pathlib import Path
import re

EXTRA_TS = '''
  {
    name: "James W.",
    initials: "JW",
    avatarColor: "#7D6608",
    rating: 5,
    time: "1 month ago",
    textEn: "Fixed my fridge same day, no drama. Highly recommend.",
    textEs: "Arreglaron la nevera el mismo dia. Muy recomendados.",
    category: "5",
  },
  {
    name: "Sarah J.",
    initials: "SJ",
    avatarColor: "#884EA0",
    rating: 5,
    time: "2 months ago",
    textEn: "Tech showed up on time and knew exactly what was wrong. Fair price.",
    textEs: "El tecnico llego puntual y supo el problema de inmediato. Precio justo.",
    category: "5",
  },
  {
    name: "David T.",
    initials: "DT",
    avatarColor: "#1F618D",
    rating: 5,
    time: "7 months ago",
    textEn: "Called at 8 AM, fixed by noon. Oven works perfectly now.",
    textEs: "Llame a las 8, arreglado al mediodia. El horno funciona perfecto.",
    category: "5",
  },
  {
    name: "Lisa M.",
    initials: "LM",
    avatarColor: "#D35400",
    rating: 5,
    time: "6 months ago",
    textEn: "Refrigerator back to normal after one visit. No hidden fees at all.",
    textEs: "La nevera normal despues de una visita. Sin cargos ocultos.",
    category: "5",
  },
  {
    name: "Maria S.",
    initials: "MS",
    avatarColor: "#1E8449",
    rating: 5,
    time: "2 months ago",
    textEn: "Called for dishwasher repair. Fixed same day, no extra fees.",
    textEs: "Llame por el lavavajillas. Arreglado ese dia, sin cargos extra.",
    category: "5",
  },
'''

EXTRA_BUNDLE = '''
    { name: "James W.", initials: "JW", avatarColor: "#7D6608", rating: 5, time: "1 month ago", textEn: "Fixed my fridge same day, no drama. Highly recommend.", textEs: "Arreglaron la nevera el mismo dia. Muy recomendados." },
    { name: "Sarah J.", initials: "SJ", avatarColor: "#884EA0", rating: 5, time: "2 months ago", textEn: "Tech showed up on time and knew exactly what was wrong. Fair price.", textEs: "El tecnico llego puntual y supo el problema de inmediato. Precio justo." },
    { name: "David T.", initials: "DT", avatarColor: "#1F618D", rating: 5, time: "7 months ago", textEn: "Called at 8 AM, fixed by noon. Oven works perfectly now.", textEs: "Llame a las 8, arreglado al mediodia. El horno funciona perfecto." },
    { name: "Lisa M.", initials: "LM", avatarColor: "#D35400", rating: 5, time: "6 months ago", textEn: "Refrigerator back to normal after one visit. No hidden fees at all.", textEs: "La nevera normal despues de una visita. Sin cargos ocultos." },
    { name: "Maria S.", initials: "MS", avatarColor: "#1E8449", rating: 5, time: "2 months ago", textEn: "Called for dishwasher repair. Fixed same day, no extra fees.", textEs: "Llame por el lavavajillas. Arreglado ese dia, sin cargos extra." },
'''

ts = Path(r"C:/Projects/HTRGroupLLC/src/data/googleBusinessReviews.ts")
t = ts.read_text(encoding="utf-8")
if "James W." not in t:
    t = t.replace("\n];", ",\n" + EXTRA_TS.strip() + "\n];", 1)
    ts.write_text(t, encoding="utf-8")
    print("ts updated")
else:
    print("ts already has extras")

b = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
c = b.read_text(encoding="utf-8")
marker = '{ name: "Emma L.", initials: "E", avatarColor: "#117A65", rating: 5, time: "3 weeks ago", textEn: "Oven igniters sparking constantly. Fixed same day. Safe and quiet now.", textEs: "Encendedores del horno chispeando. Arreglados ese dia. Seguros y silenciosos." }'
if "James W." not in c[c.find("GOOGLE_HOME_REVIEWS_STATIC"):c.find("GOOGLE_HOME_REVIEWS_STATIC")+4000]:
    c = c.replace(marker, marker + "," + EXTRA_BUNDLE, 1)
    b.write_text(c, encoding="utf-8")
    print("bundle updated")
else:
    print("bundle already has extras")

html = Path(r"C:/Projects/HTRGroupLLC/index.html")
h = html.read_text(encoding="utf-8")
h = h.replace("index-utf8-v4.js?v=31", "index-utf8-v4.js?v=32")
html.write_text(h, encoding="utf-8")
print("html v=32")
