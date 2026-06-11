from pathlib import Path
p = Path(r"C:/Projects/HTRGroupLLC/src/pages/home.tsx")
t = p.read_text(encoding="utf-8")
t = t.replace('transition-opacity block" mt-1">{COMPANY_PHONE_DISPLAY}', 'transition-opacity block">{COMPANY_PHONE_DISPLAY}')
p.write_text(t, encoding="utf-8")