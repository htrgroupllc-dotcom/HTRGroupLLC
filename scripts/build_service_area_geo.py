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
# Far-south / coastal zips outside trimmed metro (Alvin, Angleton, Lake Jackson, etc.)
SOUTHERN_EXCLUDED = {
    "77415", "77417", "77420", "77422", "77432", "77435", "77436", "77440",
    "77443", "77444", "77451", "77453", "77461", "77465", "77467", "77468",
    "77469", "77480", "77481", "77482", "77486", "77510", "77511", "77515",
    "77517", "77531", "77534", "77539", "77541", "77550", "77551", "77554",
    "77563", "77566", "77568", "77573", "77577", "77590", "77591",
}
# Southern trim arc (lng -> min lat); matches user red line on service map
SOUTHERN_CUTOFF = (
    (-96.0, 29.60),
    (-95.7, 29.61),
    (-95.4, 29.63),
    (-95.1, 29.65),
    (-94.7, 29.66),
    (-94.45, 29.67),
)
BBOX = (-96.35, 28.85, -94.45, 30.55)
MAX_PTS = 22


def southern_cutoff_lat(lng: float) -> float:
    pts = SOUTHERN_CUTOFF
    if lng <= pts[0][0]:
        return pts[0][1]
    if lng >= pts[-1][0]:
        return pts[-1][1]
    for i in range(len(pts) - 1):
        lng0, lat0 = pts[i]
        lng1, lat1 = pts[i + 1]
        if lng0 <= lng <= lng1:
            t = (lng - lng0) / (lng1 - lng0)
            return lat0 + t * (lat1 - lat0)
    return 29.64


def ring_centroid(ring):
    lngs = [p[0] for p in ring]
    lats = [p[1] for p in ring]
    return sum(lngs) / len(lngs), sum(lats) / len(lats), min(lats), max(lats)


def south_of_trim_line(ring) -> bool:
    clng, clat, min_lat, _max_lat = ring_centroid(ring)
    cut = southern_cutoff_lat(clng)
    if clat < cut - 0.01:
        return True
    if min_lat < cut - 0.025:
        return True
    return False


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
    skipped_south = []
    for feat in data["features"]:
        props = feat.get("properties") or {}
        z = str(props.get("ZCTA5CE10") or props.get("ZIP") or "")
        if len(z) != 5 or not z.startswith(PREFIXES) or z in EXCLUDED or z in SOUTHERN_EXCLUDED:
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
            if south_of_trim_line(ring):
                skipped_south.append(z)
                break
            polys.append({"z": z, "r": simplify_ring(ring)})
            break
    polys.sort(key=lambda p: p["z"])
    if skipped_south:
        print("south_of_line:", ", ".join(sorted(set(skipped_south))))
    return polys


def emit_ts(polys):
    lines = [
        "/** Houston-metro ZIP boundaries (ZCTA, simplified) for z=9 map embed. */",
        "/** Matches Google embed: Houston Metropolitan Area @29.7,-95.4 z=9 */",
        "export const MAP_EMBED = {",
        "  centerLat: 29.7,",
        "  centerLng: -95.4,",
        "  zoom: 9,",
        "} as const;",
        "",
        "function latLngToWorld(lat: number, lng: number): { x: number; y: number } {",
        "  const sinY = Math.sin((lat * Math.PI) / 180);",
        "  const clamped = Math.min(Math.max(sinY, -0.9999), 0.9999);",
        "  return {",
        "    x: (lng + 180) / 360,",
        "    y: 0.5 - Math.log((1 + clamped) / (1 - clamped)) / (4 * Math.PI),",
        "  };",
        "}",
        "",
        "export type LngLat = readonly [number, number];",
        "",
        "export type ZipPolygon = { zip: string; ring: LngLat[] };",
        "",
        "/** Allowed metro ZIPs (770/772/773/774/775 minus rural + southern trim). */",
        "export const SERVICE_ZIP_POLYGONS: ZipPolygon[] = [",
    ]
    for p in polys:
        ring = ", ".join(f"[{a},{b}]" for a, b in p["r"])
        lines.append(f'  {{ zip: "{p["z"]}", ring: [{ring}] }},')
    lines += [
        "];",
        "",
        "export function projectPoint(lng: number, lat: number, width: number, height: number): string {",
        "  const { centerLat, centerLng, zoom } = MAP_EMBED;",
        "  const scale = 256 * Math.pow(2, zoom);",
        "  const center = latLngToWorld(centerLat, centerLng);",
        "  const point = latLngToWorld(lat, lng);",
        "  const x = (point.x - center.x) * scale + width / 2;",
        "  const y = (point.y - center.y) * scale + height / 2;",
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


def patch_bundle(polys):
    bp = ROOT / "assets/index-utf8-v4.js"
    b = bp.read_text(encoding="utf-8")
    poly_start = b.find("const SERVICE_AREA_ZIP_POLYGONS = [")
    poly_end = b.find("];\nfunction serviceAreaLatLngToWorld")
    if poly_end < 0:
        poly_end = b.find("];\r\nfunction serviceAreaLatLngToWorld")
    if poly_start < 0 or poly_end < 0:
        raise SystemExit("bundle polygon markers not found")
    rings_js = ",\n  ".join(
        '{ z: "' + p["z"] + '", r: ' + json.dumps(p["r"], separators=(",", ":")) + " }"
        for p in polys
    )
    new_polys = "const SERVICE_AREA_ZIP_POLYGONS = [\n  " + rings_js + "\n];"
    b = b[:poly_start] + new_polys + b[poly_end + 2 :]
    bp.write_text(b, encoding="utf-8", newline="\n")
    print(f"patched {bp}")


if __name__ == "__main__":
    polys = collect()
    emit_ts(polys)
    patch_bundle(polys)
