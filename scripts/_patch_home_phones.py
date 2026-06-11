from pathlib import Path
import re
p = Path(r"C:/Projects/HTRGroupLLC/src/pages/home.tsx")
t = p.read_text(encoding="utf-8")
new_fn = """function PhonePair({ compact = false, inHeader = false }: { compact?: boolean; inHeader?: boolean }) {
  const linkCls = compact
    ? \"htr-phone-btn inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm\"
    : inHeader
      ? \"header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm\"
      : \"htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm\";
  const iconCls = compact ? \"h-4 w-4\" : \"h-3.5 w-3.5\";
  const wrapCls = compact
    ? \"htr-phone-pair--hero-top flex flex-row flex-wrap gap-2 items-center justify-start\"
    : inHeader
      ? \"header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end\"
      : \"htr-phone-pair flex flex-col gap-1.5 items-start\";
  return (
    <div className={wrapCls}>
      <a href={COMPANY_PHONE_HREF} className={linkCls} style={{ backgroundColor: K.accent }}>
        <Phone className={iconCls} /> {COMPANY_PHONE_DISPLAY}
      </a>
      <a href={PHONE_HREF} className={linkCls} style={{ backgroundColor: K.accent }}>
        <Phone className={iconCls} /> {PHONE_DISPLAY}
      </a>
    </div>
  );
}"""
t2, n = re.subn(r"function PhonePair\(\{.*?\n\}", new_fn, t, count=1, flags=re.S)
print("count", n)
if n != 1:
    raise SystemExit(1)
p.write_text(t2, encoding="utf-8")