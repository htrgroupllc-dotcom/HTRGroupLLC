from pathlib import Path

HOME = Path(r"C:\Projects\HTRGroupLLC\src\pages\home.tsx")
BUNDLE = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")

OLD_HOME = '''  useEffect(() => {
    const DURATION_MS = 160_000;
    const tick = (ts: number) => {
      const track = trackRef.current;
      if (track) {
        if (!speedRef.current && track.scrollWidth > 0) {
          speedRef.current = (track.scrollWidth / 2) / DURATION_MS;
        }
        if (!drag.current.active) {
          const dt = lastTsRef.current ? ts - lastTsRef.current : 0;
          offsetRef.current += (reverse ? 1 : -1) * speedRef.current * dt;
          const half = track.scrollWidth / 2;
          if (half > 0) {
            if (reverse) {
              if (offsetRef.current >= half) offsetRef.current -= half;
            } else if (-offsetRef.current >= half) {
              offsetRef.current += half;
            }
          }
          track.style.transform = `translateX(${offsetRef.current}px)`;
        }
      }
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [reverse]);'''

NEW_HOME = '''  const reverseInitRef = useRef(false);

  const wrapOffset = (offset: number, half: number) => {
    if (half <= 0) return offset;
    while (offset > 0) offset -= half;
    while (offset <= -half) offset += half;
    return offset;
  };

  useEffect(() => {
    reverseInitRef.current = false;
    const DURATION_MS = 160_000;
    const tick = (ts: number) => {
      const track = trackRef.current;
      if (track) {
        const half = track.scrollWidth / 2;
        if (half > 0) {
          speedRef.current = half / DURATION_MS;
          if (reverse && !reverseInitRef.current) {
            offsetRef.current = -half;
            reverseInitRef.current = true;
          }
        }
        if (!drag.current.active) {
          const dt = lastTsRef.current ? ts - lastTsRef.current : 0;
          offsetRef.current += (reverse ? 1 : -1) * speedRef.current * dt;
          offsetRef.current = wrapOffset(offsetRef.current, half);
          track.style.transform = `translateX(${offsetRef.current}px)`;
        }
      }
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [reverse]);'''

OLD_MOVE = '''    if (track) {
      const half = track.scrollWidth / 2;
      if (half > 0) {
        while (-next >= half) next += half;
        while (next > 0) next -= half;
      }
    }'''

NEW_MOVE = '''    if (track) {
      const half = track.scrollWidth / 2;
      if (half > 0) next = wrapOffset(next, half);
    }'''

ht = HOME.read_text(encoding="utf-8")
if OLD_HOME not in ht:
    raise SystemExit("home useEffect block not found")
ht = ht.replace(OLD_HOME, NEW_HOME, 1)
if OLD_MOVE not in ht:
    raise SystemExit("home pointer move block not found")
ht = ht.replace(OLD_MOVE, NEW_MOVE, 1)
HOME.write_text(ht, encoding="utf-8")
print("home.tsx patched")

# Bundle patch
bt = BUNDLE.read_text(encoding="utf-8")
OLD_B = '''  reactExports.useEffect(() => {
    const DURATION_MS = 16e4;
    const tick = (ts) => {
      const track = trackRef.current;
      if (track) {
        if (!speedRef.current && track.scrollWidth > 0) {
          speedRef.current = track.scrollWidth / 2 / DURATION_MS;
        }
        if (!drag2.current.active) {
          const dt = lastTsRef.current ? ts - lastTsRef.current : 0;
          offsetRef.current += (reverse ? 1 : -1) * speedRef.current * dt;
          const half = track.scrollWidth / 2;
          if (half > 0) {
            if (reverse) {
              if (offsetRef.current >= half) offsetRef.current -= half;
            } else if (-offsetRef.current >= half) {
              offsetRef.current += half;
            }
          }
          track.style.transform = `translateX(${offsetRef.current}px)`;
        }
      }
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reverse]);'''

NEW_B = '''  const reverseInitRef = reactExports.useRef(false);
  const wrapOffset = (offset, half) => {
    if (half <= 0) return offset;
    while (offset > 0) offset -= half;
    while (offset <= -half) offset += half;
    return offset;
  };
  reactExports.useEffect(() => {
    reverseInitRef.current = false;
    const DURATION_MS = 16e4;
    const tick = (ts) => {
      const track = trackRef.current;
      if (track) {
        const half = track.scrollWidth / 2;
        if (half > 0) {
          speedRef.current = half / DURATION_MS;
          if (reverse && !reverseInitRef.current) {
            offsetRef.current = -half;
            reverseInitRef.current = true;
          }
        }
        if (!drag2.current.active) {
          const dt = lastTsRef.current ? ts - lastTsRef.current : 0;
          offsetRef.current += (reverse ? 1 : -1) * speedRef.current * dt;
          offsetRef.current = wrapOffset(offsetRef.current, half);
          track.style.transform = `translateX(${offsetRef.current}px)`;
        }
      }
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reverse]);'''

OLD_B_MOVE = '''      if (half > 0) {
        while (-next >= half) next += half;
        while (next > 0) next -= half;
      }'''

NEW_B_MOVE = '''      if (half > 0) next = wrapOffset(next, half);'''

if OLD_B not in bt:
    raise SystemExit("bundle useEffect block not found")
bt = bt.replace(OLD_B, NEW_B, 1)
if OLD_B_MOVE not in bt:
    raise SystemExit("bundle pointer move block not found")
bt = bt.replace(OLD_B_MOVE, NEW_B_MOVE, 1)
BUNDLE.write_text(bt, encoding="utf-8")
print("bundle patched")
