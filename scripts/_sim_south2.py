import json,re
from pathlib import Path
ROOT = Path(r"C:/Projects/HTRGroupLLC")
text = (ROOT/"src/lib/serviceAreaGeo.ts").read_text()
zips = set(re.findall(r'zip: "(\d{5})"', text))
check = ["77478","77479","77545","77546","77581","77584","77578","77583","77459","77469","77571","77586"]
data = json.loads((ROOT / "scripts/_tx_zips.geojson").read_text(encoding="utf-8"))
feat_by_z = {}
for feat in data["features"]:
    props = feat.get("properties") or {}
    z = str(props.get("ZCTA5CE10") or props.get("ZIP") or "")
    if z: feat_by_z[z]=feat

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

for z in check:
    in_map = z in zips
    if z not in feat_by_z:
        print(z, "in_map", in_map, "no geo")
        continue
    geom = feat_by_z[z]["geometry"]
    ring = geom["coordinates"][0] if geom["type"]=="Polygon" else geom["coordinates"][0][0]
    lngs=[p[0] for p in ring]; lats=[p[1] for p in ring]
    clng, clat = sum(lngs)/len(lngs), sum(lats)/len(lats)
    mn, mx = min(lats), max(lats)
    cut = lat_cut(clng)
    ex = clat < cut or mn < cut - 0.015
    print(z, "in_map", in_map, f"cent={clat:.3f} min={mn:.3f} cut={cut:.3f} EXCL", ex)
