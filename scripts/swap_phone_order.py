"""Swap display order: company 606 first, owner 346 second."""
from pathlib import Path
import re

ROOT = Path(r"C:\Projects\HTRGroupLLC")

def swap_two_anchors(text: str, first_marker: str, second_marker: str) -> tuple[str, int]:
    """Swap two consecutive jsx/tsx anchor blocks (first_marker before second_marker)."""
    count = 0
    pos = 0
    while True:
        i1 = text.find(first_marker, pos)
        if i1 == -1:
            break
        i2 = text.find(second_marker, i1)
        if i2 == -1 or i2 - i1 > 2500:
            pos = i1 + len(first_marker)
            continue
        # walk back to start of first block
        b1 = text.rfind("/* @__PURE__ */", 0, i1)
        if b1 == -1:
            b1 = text.rfind('jsxRuntimeExports.jsxs("a"', 0, i1)
        if b1 == -1:
            b1 = text.rfind('<a href=', 0, i1)
        if b1 == -1:
            pos = i1 + 1
            continue
        b2 = text.rfind("/* @__PURE__ */", 0, i2)
        if b2 == -1:
            b2 = text.rfind('jsxRuntimeExports.jsxs("a"', 0, i2)
        if b2 == -1:
            b2 = text.rfind('<a href=', 0, i2)
        if b2 <= b1:
            pos = i1 + 1
            continue

        def end_of_block(s: str, start: int) -> int:
            if s.startswith("<a ", start) or s[start:start+3] == "<a ":
                close = s.find("</a>", start)
                return close + 4 if close != -1 else -1
            # brace/paren balance from jsxs(
            j = s.find("jsxs(", start)
            if j == -1:
                j = s.find('jsx("a"', start)
            if j == -1:
                return -1
            k = s.find("(", j)
            depth = 0
            for idx in range(k, len(s)):
                ch = s[idx]
                if ch == "(":
                    depth += 1
                elif ch == ")":
                    depth -= 1
                    if depth == 0:
                        # include trailing comma if present
                        end = idx + 1
                        while end < len(s) and s[end] in " \t\n\r":
                            end += 1
                        if end < len(s) and s[end] == ",":
                            end += 1
                        return end
            return -1

        e1 = end_of_block(text, b1)
        e2 = end_of_block(text, b2)
        if e1 == -1 or e2 == -1 or e2 <= e1:
            pos = i1 + 1
            continue
        block1 = text[b1:e1]
        block2 = text[b2:e2]
        if first_marker not in block1 or second_marker not in block2:
            pos = i1 + 1
            continue
        text = text[:b1] + block2 + text[e1:b2] + block1 + text[e2:]
        count += 1
        pos = b1 + len(block2) + (b2 - e1) + len(block1)
    return text, count


def patch_site_phones():
    p = ROOT / "src/lib/sitePhones.ts"
    t = p.read_text(encoding="utf-8")
    new = """export const COMPANY_PHONE_DISPLAY = \"(606) 660-6067\";
export const COMPANY_PHONE_HREF = \"tel:+16066606067\";
export const PHONE_DISPLAY = \"(346) 696-8751\";
export const PHONE_HREF = \"tel:+13466968751\";
"""
    if "(606)" not in t:
        raise SystemExit("sitePhones unexpected")
    p.write_text(new, encoding="utf-8")
    print("sitePhones.ts ok")


def patch_tsx(path: Path, markers: list[tuple[str, str]]):
    t = path.read_text(encoding="utf-8")
    total = 0
    for a, b in markers:
        t, n = swap_two_anchors(t, a, b)
        total += n
    path.write_text(t, encoding="utf-8")
    print(f"{path.name}: swapped {total} pairs")


def patch_home_gallery():
    markers = [
        ("href={PHONE_HREF}", "href={COMPANY_PHONE_HREF}"),
    ]
    patch_tsx(ROOT / "src/pages/home.tsx", markers)
    patch_tsx(ROOT / "src/pages/gallery.tsx", markers)


def patch_bundle():
    p = ROOT / "assets/index-utf8-v4.js"
    t = p.read_text(encoding="utf-8")
    total = 0
    for suf in ("$3", "$2"):
        t, n = swap_two_anchors(t, f"href: PHONE_HREF{suf}", f"href: COMPANY_PHONE_HREF{suf}")
        total += n
    # sitePhones const order in bundle (each duplicated chunk)
    old = (
        'const PHONE_DISPLAY$3 = "(346) 696-8751";\n'
        'const PHONE_HREF$3 = "tel:+13466968751";\n'
        'const COMPANY_PHONE_DISPLAY$3 = "(606) 660-6067";\n'
        'const COMPANY_PHONE_HREF$3 = "tel:+16066606067";'
    )
    new = (
        'const COMPANY_PHONE_DISPLAY$3 = "(606) 660-6067";\n'
        'const COMPANY_PHONE_HREF$3 = "tel:+16066606067";\n'
        'const PHONE_DISPLAY$3 = "(346) 696-8751";\n'
        'const PHONE_HREF$3 = "tel:+13466968751";'
    )
    c = t.count(old)
    if c:
        t = t.replace(old, new)
        print(f"bundle const block $3 x{c}")
    old2 = old.replace("$3", "$2")
    new2 = new.replace("$3", "$2")
    c2 = t.count(old2)
    if c2:
        t = t.replace(old2, new2)
        print(f"bundle const block $2 x{c2}")
    p.write_text(t, encoding="utf-8")
    print(f"bundle: swapped {total} anchor pairs")


patch_site_phones()
patch_home_gallery()
patch_bundle()
