"""Generate Houston metro ZIP polygons for map overlay."""
import json
from pathlib import Path

ROOT = Path(r"C:\Projects\HTRGroupLLC")
PREFIXES = ("770", "772", "773", "774", "775")
EXCLUDED = {
    "77331", "77332", "77335", "77340", "77350", "77356", "77360", "77364",
    "77367", "77368", "77369", "77371", "77374", "77376",
    "77414", "77419", "77426", "77430", "77434", "77437", "77442", "77448",
    "77455", "77456", "77457", "77458", "77460", "77470", "77485", "77488",
}
BBOX = (-96.35, 28.85, -94.45, 30.55)
MAX_PTS = 22


def in_bbox_ring(ring):
    lngs = [p[0] for p in ring]
    lats = [p[1] for p in ring]
    return (
        max(lngs) >= BBOX[0]
        and min(lngs) <= BBOX[2]
        and max(lats) >= BBOX[1]
        and min(lats) <= BBOX[3]
    )


def simplify_ring(ring):
    if len(ring) <= MAX_PTS:
        pts = ring
    else:
        step = max(1, len(ring) // MAX_PTS)
        pts = [ring[i] for i in range(0, len(ring), step)]
    if pts[0] != pts[-1]:
        pts = [*pts, pts[0]]
    return [[round(x, 4), round(y, 4)] for x, y in pts]


def collect():
    data = json.loads((ROOT / "scripts/_tx_zips.geojson").read_text(encoding="utf-8"))
    polys = []
    for feat in data["features"]:
        props = feat.get("properties") or {}
        z = str(props.get("ZCTA5CE10") or props.get("ZIP") or "")
        if len(z) != 5 or not z.startswith(PREFIXES) or z in EXCLUDED:
            continue
        geom = feat["geometry"]
        rings = []
        if geom["type"] == "Polygon":
            rings = [geom["coordinates"][0]]
        elif geom["type"] == "MultiPolygon":
            rings = [p[0] for p in geom["coordinates"]]
        for ring in rings:
            if len(ring) < 4 or not in_bbox_ring(ring):
                continue
            polys.append({"z": z, "r": simplify_ring(ring)})
            break
    polys.sort(key=lambda p: p["z"])
    return polys


def map_view(polys):
    lngs, lats = [], []
    for p in polys:
        for lng, lat in p["r"]:
            lngs.append(lng)
            lats.append(lat)
    pad_lng = (max(lngs) - min(lngs)) * 0.04
    pad_lat = (max(lats) - min(lats)) * 0.04
    return {
        "west": round(min(lngs) - pad_lng, 3),
        "east": round(max(lngs) + pad_lng, 3),
        "north": round(max(lats) + pad_lat, 3),
        "south": round(min(lats) - pad_lat, 3),
    }


def emit_ts(polys, view):
    lines = [
        "/** Houston-metro ZIP boundaries (ZCTA, simplified) for z=9 map embed. */",
        "export const MAP_VIEW = {",
        f"  west: {view['west']},",
        f"  east: {view['east']},",
        f"  north: {view['north']},",
        f"  south: {view['south']},",
        "} as const;",
        "",
        "export type LngLat = readonly [number, number];",
        "",
        "export type ZipPolygon = { zip: string; ring: LngLat[] };",
        "",
        "/** Allowed metro ZIPs (770/772/773/774/775 minus rural exclusions). */",
        "export const SERVICE_ZIP_POLYGONS: ZipPolygon[] = [",
    ]
    for p in polys:
        ring = ", ".join(f"[{a},{b}]" for a, b in p["r"])
        lines.append(f'  {{ zip: "{p["z"]}", ring: [{ring}] }},')
    lines += [
        "];",
        "",
        "export function projectPoint(lng: number, lat: number, width: number, height: number): string {",
        "  const { west, east, north, south } = MAP_VIEW;",
        "  const x = ((lng - west) / (east - west)) * width;",
        "  const y = ((north - lat) / (north - south)) * height;",
        "  return `${x.toFixed(2)},${y.toFixed(2)}`;",
        "}",
        "",
        "export function ringToPath(ring: LngLat[], width: number, height: number): string {",
        "  const pts = ring.map(([lng, lat]) => projectPoint(lng, lat, width, height));",
        "  return `M ${pts.join(\" L \")} Z`;",
        "}",
        "",
    ]
    out = ROOT / "src/lib/serviceAreaGeo.ts"
    out.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    print(f"wrote {out} ({len(polys)} zips)")


def emit_bundle_snippet(polys, view):
    rings_js = ",\n  ".join(
        '{ z: "' + p["z"] + '", r: ' + json.dumps(p["r"], separators=(",", ":")) + " }"
        for p in polys
    )
    snippet = f'''const SERVICE_AREA_MAP_VB = {{ w: 1e3, h: 300 }};
const SERVICE_AREA_MAP_VIEW = {{ west: {view["west"]}, east: {view["east"]}, north: {view["north"]}, south: {view["south"]} }};
const SERVICE_AREA_MAP_FILL = "rgba(56, 189, 248, 0.28)";
const SERVICE_AREA_MAP_STROKE = "#333333";
const SERVICE_AREA_ZIP_POLYGONS = [
  {rings_js}
];
function serviceAreaProject(lng, lat) {{
  const {{ west, east, north, south }} = SERVICE_AREA_MAP_VIEW;
  const {{ w, h }} = SERVICE_AREA_MAP_VB;
  const x = (lng - west) / (east - west) * w;
  const y = (north - lat) / (north - south) * h;
  return `${{x.toFixed(2)}},${{y.toFixed(2)}}`;
}}
function serviceAreaRingPath(ring) {{
  const pts = ring.map(([lng, lat]) => serviceAreaProject(lng, lat));
  return `M ${{pts.join(" L ")}} Z`;
}}
function ServiceAreaMapOverlay() {{
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", {{
    className: "absolute inset-0 w-full h-full pointer-events-none z-[1]",
    viewBox: `0 0 ${{SERVICE_AREA_MAP_VB.w}} ${{SERVICE_AREA_MAP_VB.h}}`,
    preserveAspectRatio: "none",
    "aria-hidden": true,
    children: SERVICE_AREA_ZIP_POLYGONS.map((z) => /* @__PURE__ */ jsxRuntimeExports.jsx("path", {{
      d: serviceAreaRingPath(z.r),
      fill: SERVICE_AREA_MAP_FILL,
      stroke: SERVICE_AREA_MAP_STROKE,
      strokeWidth: 1.25,
      vectorEffect: "non-scaling-stroke"
    }}, z.z))
  }});
}}
/* SERVICE_AREA_MAP_OVERLAY */
'''
    out = ROOT / "scripts/_map_overlay_bundle_snippet.js"
    out.write_text(snippet, encoding="utf-8", newline="\n")
    print(f"wrote {out}")


if __name__ == "__main__":
    polys = collect()
    view = map_view(polys)
    print("MAP_VIEW", view)
    emit_ts(polys, view)
    emit_bundle_snippet(polys, view)
