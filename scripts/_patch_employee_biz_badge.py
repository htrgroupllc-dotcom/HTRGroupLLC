"""Patch prod bundle: employee JobCard biz badge + EmpLang keys."""
import re
from pathlib import Path

ROOT = Path(r"C:/Projects/HTRGroupLLC")
bundle = ROOT / "assets/index-utf8-v4.js"
html = ROOT / "index.html"

OLD_JOB = """      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 20
      }, className: statusCls(b.status), children: statusLabel(b.status, t) })
    ] }),"""

NEW_JOB = """      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 20
        }, className: statusCls(b.status), children: statusLabel(b.status, t) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 20,
          background: resolveBookingBiz(b.business_type) === "dental" ? "#ede9fe" : "#dbeafe",
          color: resolveBookingBiz(b.business_type) === "dental" ? "#6d28d9" : "#1d4ed8"
        }, children: resolveBookingBiz(b.business_type) === "dental" ? t("bizDental") : t("bizAppliance") })
      ] })
    ] }),"""

BIZ_SNIPPET = """    bizAppliance: "Appliance",
    bizDental: "Dental",
"""

text = bundle.read_text(encoding="utf-8")
if OLD_JOB not in text:
    raise SystemExit("JobCard patch anchor not found")
text = text.replace(OLD_JOB, NEW_JOB, 1)

start = text.find('const translations = {\n  en: {\n    title: "Technician Dashboard"')
if start == -1:
    raise SystemExit("EmpLang block not found")
end = text.find("\n};\nfunction EmpLangProvider", start)
if end == -1:
    end = text.find("\n};\nconst EmpLangContext", start)
if end == -1:
    raise SystemExit("EmpLang block end not found")

emp = text[start:end]
if "bizAppliance:" not in emp:
    emp = re.sub(
        r'(confirmed: "[^"]+",)\n(\s+done:)',
        r"\1\n" + BIZ_SNIPPET + r"\2",
        emp,
    )
    text = text[:start] + emp + text[end:]

bundle.write_text(text, encoding="utf-8", newline="\n")
print("patched", bundle)

html_text = html.read_text(encoding="utf-8")
html_text = re.sub(r"\?v=\d+", "?v=83", html_text)
html.write_text(html_text, encoding="utf-8", newline="\n")
print("bumped cache to v=83")
