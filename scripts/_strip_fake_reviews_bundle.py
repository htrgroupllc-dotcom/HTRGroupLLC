"""Remove hardcoded RAW/ALL_REVIEWS fake review data from production bundle."""
from pathlib import Path
import re

ROOT = Path(r"C:/Projects/HTRGroupLLC")
BUNDLES = [
    ROOT / "assets/index-utf8-v4.js",
    ROOT / "assets/index-utf8-v4.prod.js",
]

START = "const C = [\n"
END = ");\nconst API_BASE$2"

REPLACEMENT = "/** NO fake reviews — API only. */\nconst ALL_REVIEWS = [];\nconst API_BASE$2"

FAKE_MARKERS = [
    "James W.",
    "Sarah J.",
    "GOOGLE_HOME_REVIEWS_STATIC",
    "...GOOGLE_HOME_REVIEWS_STATIC",
    "_fiveStar",
    "const RAW = [",
]

for path in BUNDLES:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    if START not in text or END not in text:
        raise SystemExit(f"markers missing in {path}")
    before = text.split(START, 1)[0]
    after = START + text.split(START, 1)[1]
    after = after.split(END, 1)[1]
    text = before + REPLACEMENT + after

    # Ensure home reviews never seed from static
    text = text.replace(
        "const GOOGLE_HOME_REVIEWS_STATIC = [];",
        "/* reviews: API only, no static fallback */",
    )
    for bad in ["James W.", "Sarah J.", "const RAW = [", "_fiveStar"]:
        if bad in text:
            raise SystemExit(f"still has {bad!r} in {path}")

    path.write_text(text, encoding="utf-8")
    print(f"stripped {path.name} -> {path.stat().st_size} bytes")
