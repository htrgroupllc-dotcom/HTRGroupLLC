import re
from pathlib import Path
ROOT = Path(r"C:\Projects\HTRGroupLLC")

def swap_tsx_pairs(text: str) -> tuple[str, int]:
    pat = re.compile(
        r"(<a href=\{PHONE_HREF\}[\s\S]*?</a>)\s*(<a href=\{COMPANY_PHONE_HREF\}[\s\S]*?</a>)"
    )
    n = 0
    def repl(m):
        nonlocal n
        n += 1
        return m.group(2) + "\n      " + m.group(1)
    new = pat.sub(repl, text)
    return new, n

for name in ("home.tsx", "gallery.tsx"):
    p = ROOT / "src/pages" / name
    t = p.read_text(encoding="utf-8")
    t2, n = swap_tsx_pairs(t)
    if n == 0:
        raise SystemExit(f"{name}: no pairs swapped")
    p.write_text(t2, encoding="utf-8")
    print(f"{name}: {n} pairs")
