from pathlib import Path

ROOT = Path(r"C:\Projects\HTRGroupLLC")

# --- serviceAreaGeo.ts: replace MAP_VIEW + projectPoint ---
geo = ROOT / "src/lib/serviceAreaGeo.ts"
t = geo.read_text(encoding="utf-8")
old_header = """/** Houston-metro ZIP boundaries (ZCTA, simplified) for z=9 map embed. */
export const MAP_VIEW = {
  west: -96.53,
  east: -94.306,
  north: 31.044,
  south: 28.549,
} as const;
"""
new_header = """/** Houston-metro ZIP boundaries (ZCTA, simplified) for z=9 map embed. */
/** Matches Google embed: Houston Metropolitan Area @29.7,-95.4 z=9 */
export const MAP_EMBED = {
  centerLat: 29.7,
  centerLng: -95.4,
  zoom: 9,
} as const;

function latLngToWorld(lat: number, lng: number): { x: number; y: number } {
  const sinY = Math.sin((lat * Math.PI) / 180);
  const clamped = Math.min(Math.max(sinY, -0.9999), 0.9999);
  return {
    x: (lng + 180) / 360,
    y: 0.5 - Math.log((1 + clamped) / (1 - clamped)) / (4 * Math.PI),
  };
}
"""
if old_header not in t:
    raise SystemExit("geo header not found")
t = t.replace(old_header, new_header, 1)

old_proj = """export function projectPoint(lng: number, lat: number, width: number, height: number): string {
  const { west, east, north, south } = MAP_VIEW;
  const x = ((lng - west) / (east - west)) * width;
  const y = ((north - lat) / (north - south)) * height;
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}
"""
new_proj = """export function projectPoint(lng: number, lat: number, width: number, height: number): string {
  const { centerLat, centerLng, zoom } = MAP_EMBED;
  const scale = 256 * Math.pow(2, zoom);
  const center = latLngToWorld(centerLat, centerLng);
  const point = latLngToWorld(lat, lng);
  const x = (point.x - center.x) * scale + width / 2;
  const y = (point.y - center.y) * scale + height / 2;
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}
"""
if old_proj not in t:
    raise SystemExit("geo projectPoint not found")
t = t.replace(old_proj, new_proj, 1)
geo.write_text(t, encoding="utf-8", newline="\n")
print("serviceAreaGeo.ts ok")

# --- ServiceAreaMapOverlay.tsx ---
overlay = ROOT / "src/components/ServiceAreaMapOverlay.tsx"
overlay.write_text("""import React, { useLayoutEffect, useRef, useState } from \"react\";
import { SERVICE_ZIP_POLYGONS, ringToPath } from \"@/lib/serviceAreaGeo\";

const FILL = \"rgba(56, 189, 248, 0.28)\";
const STROKE = \"#333333\";

/** Semi-transparent ZIP overlays aligned to the Google Maps embed (z=9, Web Mercator). */
export default function ServiceAreaMapOverlay() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 300 });

  useLayoutEffect(() => {
    const el = wrapRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const w = Math.max(1, Math.round(width));
      const h = Math.max(1, Math.round(height));
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;

  return (
    <div ref={wrapRef} className=\"absolute inset-0 pointer-events-none z-[1]\">
      <svg
        className=\"w-full h-full\"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio=\"none\"
        aria-hidden
      >
        {SERVICE_ZIP_POLYGONS.map((z) => (
          <path
            key={z.zip}
            d={ringToPath(z.ring, w, h)}
            fill={FILL}
            stroke={STROKE}
            strokeWidth={1.25}
            vectorEffect=\"non-scaling-stroke\"
          />
        ))}
      </svg>
    </div>
  );
}
""", encoding="utf-8", newline="\n")
print("ServiceAreaMapOverlay.tsx ok")

# --- home.tsx: iframe ll= for stable center ---
hp = ROOT / "src/pages/home.tsx"
ht = hp.read_text(encoding="utf-8")
old_src = 'src="https://maps.google.com/maps?q=Houston+Metropolitan+Area,+Texas&z=9&output=embed"'
new_src = 'src="https://maps.google.com/maps?q=Houston+Metropolitan+Area,+Texas&ll=29.7,-95.4&z=9&output=embed"'
if old_src in ht:
    ht = ht.replace(old_src, new_src, 1)
    hp.write_text(ht, encoding="utf-8", newline="\n")
    print("home.tsx iframe ok")
else:
    print("home.tsx iframe already patched or missing")

# --- bundle ---
bp = ROOT / "assets/index-utf8-v4.js"
b = bp.read_text(encoding="utf-8")
start = b.find("const SERVICE_AREA_MAP_VB")
end = b.find("/* SERVICE_AREA_MAP_OVERLAY */")
if start < 0 or end < 0:
    raise SystemExit("bundle map block markers not found")
new_block = r'''const SERVICE_AREA_MAP_EMBED = { centerLat: 29.7, centerLng: -95.4, zoom: 9 };
const SERVICE_AREA_MAP_FILL = "rgba(56, 189, 248, 0.28)";
const SERVICE_AREA_MAP_STROKE = "#333333";
const SERVICE_AREA_ZIP_POLYGONS = [
'''
# keep polygon array from existing bundle
poly_start = b.find("const SERVICE_AREA_ZIP_POLYGONS = [")
poly_end = b.find("];\nfunction serviceAreaProject")
if poly_end < 0:
    poly_end = b.find("];\r\nfunction serviceAreaProject")
polys = b[poly_start + len("const SERVICE_AREA_ZIP_POLYGONS = "):poly_end + 2]

helper_tail = r'''function serviceAreaLatLngToWorld(lat, lng) {
  const sinY = Math.sin(lat * Math.PI / 180);
  const clamped = Math.min(Math.max(sinY, -0.9999), 0.9999);
  return {
    x: (lng + 180) / 360,
    y: 0.5 - Math.log((1 + clamped) / (1 - clamped)) / (4 * Math.PI)
  };
}
function serviceAreaProject(lng, lat, w, h) {
  const { centerLat, centerLng, zoom } = SERVICE_AREA_MAP_EMBED;
  const scale = 256 * Math.pow(2, zoom);
  const center = serviceAreaLatLngToWorld(centerLat, centerLng);
  const point = serviceAreaLatLngToWorld(lat, lng);
  const x = (point.x - center.x) * scale + w / 2;
  const y = (point.y - center.y) * scale + h / 2;
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}
function serviceAreaRingPath(ring, w, h) {
  const pts = ring.map(([lng, lat]) => serviceAreaProject(lng, lat, w, h));
  return `M ${pts.join(" L ")} Z`;
}
function ServiceAreaMapOverlay() {
  const wrapRef = reactExports.useRef(null);
  const [size, setSize] = reactExports.useState({ w: 1e3, h: 300 });
  reactExports.useLayoutEffect(() => {
    const el = wrapRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const w = Math.max(1, Math.round(width));
      const h = Math.max(1, Math.round(height));
      setSize((prev) => prev.w === w && prev.h === h ? prev : { w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = size;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    ref: wrapRef,
    className: "absolute inset-0 pointer-events-none z-[1]",
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", {
      className: "w-full h-full",
      viewBox: `0 0 ${w} ${h}`,
      preserveAspectRatio: "none",
      "aria-hidden": true,
      children: SERVICE_AREA_ZIP_POLYGONS.map((z) => /* @__PURE__ */ jsxRuntimeExports.jsx("path", {
        d: serviceAreaRingPath(z.r, w, h),
        fill: SERVICE_AREA_MAP_FILL,
        stroke: SERVICE_AREA_MAP_STROKE,
        strokeWidth: 1.25,
        vectorEffect: "non-scaling-stroke"
      }, z.z))
    })
  });
}
'''
b = b[:start] + new_block + polys + "\n" + helper_tail + b[end:]
# patch iframe src in bundle
old_b_src = 'src: "https://maps.google.com/maps?q=Houston+Metropolitan+Area,+Texas&z=9&output=embed"'
new_b_src = 'src: "https://maps.google.com/maps?q=Houston+Metropolitan+Area,+Texas&ll=29.7,-95.4&z=9&output=embed"'
if old_b_src in b:
    b = b.replace(old_b_src, new_b_src, 1)
bp.write_text(b, encoding="utf-8", newline="\n")
print("bundle ok")

# index.html v bump
idx = ROOT / "index.html"
ih = idx.read_text(encoding="utf-8")
import re
ih2, n = re.subn(r'index-utf8-v4\.js\?v=\d+', 'index-utf8-v4.js?v=22', ih, count=1)
if n:
    idx.write_text(ih2, encoding="utf-8", newline="\n")
    print("index.html v=22")
else:
    print("index.html v bump skipped")
