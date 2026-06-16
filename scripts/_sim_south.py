import json,re
from pathlib import Path
ROOT = Path(r"C:/Projects/HTRGroupLLC")
text = (ROOT/"src/lib/serviceAreaGeo.ts").read_text()
zips = re.findall(r'zip: "(\d{5})"', text)
print("current count", len(zips))
data = json.loads((ROOT / "scripts/_tx_zips.geojson").read_text(encoding="utf-8"))
feat_by_z = {}
for feat in data["features"]:
    props = feat.get("properties") or {}
    z = str(props.get("ZCTA5CE10") or props.get("ZIP") or "")
    if z: feat_by_z[z]=feat

def ring_of(feat):
    geom = feat["geometry"]
    if geom["type"]=="Polygon": return geom["coordinates"][0]
    if geom["type"]=="MultiPolygon": return geom["coordinates"][0][0]
    return None

def stats(z):
    ring = ring_of(feat_by_z[z])
    lngs=[p[0] for p in ring]; lats=[p[1] for p in ring]
    return sum(lngs)/len(lngs), sum(lats)/len(lats), min(lats), max(lats), min(lngs), max(lngs)

def lat_cut(lng):
    pts = [(-96.0, 29.48), (-95.7, 29.49), (-95.4, 29.51), (-95.1, 29.53), (-94.7, 29.54), (-94.45, 29.55)]
    if lng <= pts[0][0]: return pts[0][1]
    if lng >= pts[-1][0]: return pts[-1][1]
    for i in range(len(pts)-1):
        l0,a0 = pts[i]; l1,a1 = pts[i+1]
        if l0 <= lng <= l1:
            t = (lng-l0)/(l1-l0)
            return a0 + t*(a1-a0)
    return 29.52

remove = []
for z in sorted(zips):
    if z not in feat_by_z: continue
    clng, clat, mn, mx, mln, mxl = stats(z)
    cut = lat_cut(clng)
    if clat < cut or mn < cut - 0.015:
        remove.append((z, clng, clat, mn, cut))
print("would remove", len(remove))
for r in remove:
    print(" ", r[0], f"cent={r[2]:.3f} min={r[3]:.3f} cut={r[4]:.3f} lng={r[1]:.3f}")
