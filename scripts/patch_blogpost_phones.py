from pathlib import Path

path = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
s = path.read_text(encoding="utf-8")
marker = "function BlogPost()"
bi = s.find(marker)
if bi < 0:
    raise SystemExit("BlogPost not found")

# const block immediately before BlogPost
pre = s[:bi]
old_block = (
    'const PHONE_DISPLAY = "(346) 820-6021";\n'
    'const PHONE_HREF = "tel:+13468206021";\n'
    'const COMPANY_PHONE_DISPLAY$6 = "(606) 660-6067";\n'
    'const COMPANY_PHONE_HREF$6 = "tel:+16066606067";'
)
new_block = (
    'const PHONE_DISPLAY$6 = "(346) 820-6021";\n'
    'const PHONE_HREF$6 = "tel:+13468206021";\n'
    'const COMPANY_PHONE_DISPLAY$6 = "(606) 660-6067";\n'
    'const COMPANY_PHONE_HREF$6 = "tel:+16066606067";'
)
if old_block not in pre:
    raise SystemExit("expected pre-BlogPost phone const block not found")
pre = pre.replace(old_block, new_block, 1)
rest = s[bi:]
# BlogPost function body only
end = rest.find("\nfunction ", len(marker))
if end < 0:
    end = len(rest)
chunk = rest[:end]
chunk2 = chunk
chunk2 = chunk2.replace("href: PHONE_HREF,", "href: PHONE_HREF$6,")
chunk2 = chunk2.replace("href: PHONE_HREF,", "href: PHONE_HREF$6,")
chunk2 = chunk2.replace('{ href: PHONE_HREF,', '{ href: PHONE_HREF$6,')
chunk2 = chunk2.replace("href: PHONE_HREF,", "href: PHONE_HREF$6,")
# jsx children PHONE_DISPLAY (avoid COMPANY_PHONE_DISPLAY)
chunk2 = chunk2.replace("COMPANY_PHONE_DISPLAY$6", "COMPANY_PHONE_DISPLAY$6")
chunk2 = chunk2.replace("\n              PHONE_DISPLAY\n", "\n              PHONE_DISPLAY$6\n")
chunk2 = chunk2.replace("\n            PHONE_DISPLAY\n", "\n            PHONE_DISPLAY$6\n")
chunk2 = chunk2.replace("\n                    PHONE_DISPLAY\n", "\n                    PHONE_DISPLAY$6\n")
chunk2 = chunk2.replace("href: PHONE_HREF,", "href: PHONE_HREF$6,")
if chunk2 == chunk:
    raise SystemExit("no BlogPost replacements applied")
s = pre + chunk2 + rest[end:]
path.write_text(s, encoding="utf-8", newline="\n")
print("patched BlogPost phone refs")
