import re, math, json
from pathlib import Path
HOUSTON=(29.7604,-95.3698)
ts=(Path(r"C:\Projects\HTRGroupLLC\src\lib\serviceAreaGeo.ts")).read_text()
zips=re.findall(r'zip: "(\d{5})"', ts)
data=json.loads(Path("_tx_zips.geojson").read_text())
def h(lat1,lng1,lat2,lng2):
    R=6371;p=math.pi/180
    a=math.sin((lat2-lat1)*p/2)**2+math.cos(lat1*p)*math.cos(lat2*p)*math.sin((lng2-lng1)*p/2)**2
    return 2*R*math.asin(min(1,math.sqrt(a)))
byz={}
for feat in data["features"]:
    z=str((feat.get("properties")or{}).get("ZCTA5CE10")or"")
    if z in zips:
        g=feat["geometry"]
        ring=g["coordinates"][0] if g["type"]=="Polygon" else g["coordinates"][0][0]
        lngs=[p[0] for p in ring]; lats=[p[1] for p in ring]
        byz[z]=h(HOUSTON[0],HOUSTON[1],sum(lats)/len(lats),sum(lngs)/len(lngs))
far=sorted(byz.items(), key=lambda x:-x[1])[:15]
print("count",len(zips))
print("farthest",far)
for t in ["77380","77381","77384","77494","77521","77520","77379","77449"]:
    print(t, t in zips, round(byz.get(t,0),1) if t in byz else None)
