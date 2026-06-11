import subprocess
from pathlib import Path
import re

ROOT = Path(r"C:\Projects\HTRGroupLLC")
data = subprocess.check_output(["git", "-C", str(ROOT), "show", "HEAD:assets/index-utf8-v4.js"])
j = data.decode("utf-8")

pat = re.compile(
    r"(\n\s*/\* @__PURE__ \*/ jsxRuntimeExports\.jsxs\(\"a\", \{ href: PHONE_HREF(\$2|\$3),[\s\S]*?\] \}\),)"
    r"(\n\s*/\* @__PURE__ \*/ jsxRuntimeExports\.jsxs\(\"a\", \{ href: COMPANY_PHONE_HREF\2,[\s\S]*?\] \}\))"
)

def repl(m):
    phone, company = m.group(1), m.group(3)
    c = company.rstrip()
    cfirst = c if c.endswith("}),") else c[:-3] + "}),"
    ph = phone.rstrip()
    phsecond = ph[:-1] if ph.endswith("}),") else ph
    return cfirst + phsecond

j, n1 = pat.subn(repl, j)
print("jsxs", n1)

pat2 = re.compile(
    r"(/\* @__PURE__ \*/ jsxRuntimeExports\.jsxs\(\"a\", \{ href: PHONE_HREF(\$2|\$3),[^}]*children: \[[^\]]*\] \}\), )"
    r"(/\* @__PURE__ \*/ jsxRuntimeExports\.jsxs\(\"a\", \{ href: COMPANY_PHONE_HREF\2,[^}]*children: \[[^\]]*\] \}\))"
)
j, n2 = pat2.subn(lambda m: m.group(2) + ", " + m.group(1).rstrip(", "), j)
print("inline", n2)

CONTACT_OLD = (
    '/* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: PHONE_HREF$3, className: "htr-phone-btn htr-phone-btn--contact font-bold text-stone-900 hover:opacity-70 transition-opacity block", children: PHONE_DISPLAY$3 }),\n'
    '                    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: COMPANY_PHONE_HREF$3, className: "htr-phone-btn htr-phone-btn--contact font-bold text-stone-900 hover:opacity-70 transition-opacity block mt-1", children: COMPANY_PHONE_DISPLAY$3 })'
)
CONTACT_NEW = (
    '/* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: COMPANY_PHONE_HREF$3, className: "htr-phone-btn htr-phone-btn--contact font-bold text-stone-900 hover:opacity-70 transition-opacity block", children: COMPANY_PHONE_DISPLAY$3 }),\n'
    '                    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: PHONE_HREF$3, className: "htr-phone-btn htr-phone-btn--contact font-bold text-stone-900 hover:opacity-70 transition-opacity block mt-1", children: PHONE_DISPLAY$3 })'
)
if CONTACT_OLD not in j:
    raise SystemExit("contact block missing")
j = j.replace(CONTACT_OLD, CONTACT_NEW, 1)
print("contact ok")

for suf in ("$3", "$2"):
    old = (
        f"const PHONE_DISPLAY{suf} = \"(346) 820-6021\";\n"
        f"const PHONE_HREF{suf} = \"tel:+13468206021\";\n"
        f"const COMPANY_PHONE_DISPLAY{suf} = \"(606) 660-6067\";\n"
        f"const COMPANY_PHONE_HREF{suf} = \"tel:+16066606067\";"
    )
    new = (
        f"const COMPANY_PHONE_DISPLAY{suf} = \"(606) 660-6067\";\n"
        f"const COMPANY_PHONE_HREF{suf} = \"tel:+16066606067\";\n"
        f"const PHONE_DISPLAY{suf} = \"(346) 820-6021\";\n"
        f"const PHONE_HREF{suf} = \"tel:+13468206021\";"
    )
    j = j.replace(old, new)

(ROOT / "assets/index-utf8-v4.js").write_text(j, encoding="utf-8")
print("written")
