from pathlib import Path

home = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx")
t = home.read_text(encoding="utf-8")

old = """          offsetRef.current += (reverse ? 1 : -1) * speedRef.current * dt;
          const half = track.scrollWidth / 2;
          if (half > 0 && -offsetRef.current >= half) offsetRef.current += half;"""

new = """          offsetRef.current += (reverse ? 1 : -1) * speedRef.current * dt;
          const half = track.scrollWidth / 2;
          if (half > 0) {
            if (reverse) {
              if (offsetRef.current >= half) offsetRef.current -= half;
            } else if (-offsetRef.current >= half) {
              offsetRef.current += half;
            }
          }"""

if old not in t:
    raise SystemExit("tick block not found")
t = t.replace(old, new, 1)
t = t.replace("  }, []);\n\n  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {", "  }, [reverse]);\n\n  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {", 1)
home.write_text(t, encoding="utf-8")
print("marquee wrap ok")
