from pathlib import Path
path = Path("assets/index-utf8-v4.js")
lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
start = None
end = None
for i, line in enumerate(lines):
    if start is None and 'function Home() {' in line:
        home_start = i
    if start is None and i > 0 and 'htr-header-mobile-strip md:hidden' in line and any('function Home()' in lines[j] for j in range(max(0,i-500), i)):
        # ensure we're in Home not Gallery
        home_fn = next((j for j in range(i, -1, -1) if 'function Home()' in lines[j]), -1)
        gal_fn = next((j for j in range(i, -1, -1) if 'function Gallery()' in lines[j]), -1)
        if home_fn > gal_fn:
            start = i - 1 if '/* @__PURE__ */' in lines[i-1] else i
            if 'htr-header-mobile-strip' not in lines[start]:
                start = i
    if start is not None and end is None and line.strip().startswith('menuOpen &&') and 'md:hidden bg-white' in line:
        end = i
        break
if start is None or end is None:
    raise SystemExit(f'fail start={start} end={end}')
new_lines = lines[:start] + lines[end:]
path.write_text(''.join(new_lines), encoding='utf-8', newline='\n')
print('removed lines', start+1, 'to', end)
