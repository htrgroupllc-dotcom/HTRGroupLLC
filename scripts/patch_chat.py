from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\src\components\ChatWidget.tsx")
h = p.read_text(encoding="utf-8")
h = h.replace(
    'const PHONE_DISPLAY = "(346) 696-8751";\nconst PHONE_HREF = "tel:3466968751";',
    'import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/sitePhones";',
    1,
)
p.write_text(h, encoding="utf-8")
print("chatwidget updated")
