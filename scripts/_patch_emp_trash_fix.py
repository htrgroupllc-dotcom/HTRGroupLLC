"""Patch prod bundle: trash bulk 500 fallback + employee mobile login hang."""
from pathlib import Path

ROOT = Path(r"C:/Projects/HTRGroupLLC")
bundle = ROOT / "assets/index-utf8-v4.js"
html = ROOT / "index.html"

text = bundle.read_text(encoding="utf-8")
replacements = [
    (
        'if (r2.status === 404) {\n        const deletedIds = [];\n        for (const id2 of confirmBulkPerm) {',
        'if (r2.status !== 400 && r2.status !== 401 && r2.status !== 403) {\n        const deletedIds = [];\n        for (const id2 of confirmBulkPerm) {',
    ),
    (
        'const [empScreen, setEmpScreen] = reactExports.useState("checking");\n  const [token, setToken] = reactExports.useState(null);\n  const [empName, setEmpName] = reactExports.useState("");',
        'const storedAuthInit = loadStoredToken();\n  const [empScreen, setEmpScreen] = reactExports.useState("login");\n  const [token, setToken] = reactExports.useState(storedAuthInit?.token ?? null);\n  const [empName, setEmpName] = reactExports.useState(storedAuthInit?.name ?? "");',
    ),
    (
        'if (stored) {\n      setToken(stored.token);\n      setEmpName(stored.name);\n      return;\n    }\n    const bio = await hasPlatformBiometrics$1();',
        'if (stored) {\n      setToken(stored.token);\n      setEmpName(stored.name);\n      setEmpScreen("login");\n      return;\n    }\n    setEmpScreen("login");\n    setShowLoginForm(true);\n    const bio = await hasPlatformBiometrics$1();',
    ),
    (
        'setLoggingIn(false);\n      setEmpScreen("checking");',
        'setLoggingIn(false);\n      setEmpScreen("login");',
    ),
    (
        'onClick: () => setEmpScreen("checking"),',
        'onClick: () => setEmpScreen("login"),',
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f"PATCH MISS:\n{old[:160]}...")
    text = text.replace(old, new, 1)

bundle.write_text(text, encoding="utf-8")

html_text = html.read_text(encoding="utf-8")
html_text = html_text.replace("?v=90", "?v=91")
if "?v=91" not in html_text:
    html_text = html_text.replace("?v=89", "?v=91")
html.write_text(html_text, encoding="utf-8")
print("Patched bundle + index.html cache v=91")
