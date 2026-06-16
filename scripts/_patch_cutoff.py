from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\scripts\build_service_area_geo.py")
text = p.read_text(encoding="utf-8")

old_excluded = """SOUTHERN_EXCLUDED = {
    "77415", "77417", "77420", "77422", "77432", "77435", "77436", "77440",
    "77443", "77444", "77451", "77453", "77461", "77465", "77467", "77468",
    "77469", "77480", "77481", "77482", "77486", "77510", "77511", "77515",
    "77517", "77531", "77534", "77539", "77541", "77550", "77551", "77554",
    "77563", "77566", "77568", "77573", "77577", "77590", "77591",
}"""

new_excluded = """SOUTHERN_EXCLUDED = {
    "77415", "77417", "77420", "77422", "77432", "77435", "77436", "77440",
    "77443", "77444", "77451", "77453", "77461", "77465", "77467", "77468",
    "77469", "77478", "77479", "77480", "77481", "77482", "77486", "77489",
    "77502", "77503", "77504", "77505", "77506", "77507", "77510", "77511",
    "77514", "77515", "77517", "77518", "77531", "77534", "77539", "77541",
    "77545", "77546", "77550", "77551", "77554", "77563", "77565", "77566",
    "77568", "77571", "77573", "77577", "77578", "77581", "77583", "77584",
    "77586", "77590", "77591", "77598",
}"""

old_cutoff = """SOUTHERN_CUTOFF = (
    (-96.0, 29.60),
    (-95.7, 29.61),
    (-95.4, 29.63),
    (-95.1, 29.65),
    (-94.7, 29.66),
    (-94.45, 29.67),
)"""

new_cutoff = """HOUSTON_CENTER = (29.7604, -95.3698)
# Southern trim arc (lng -> min lat); user red dashed line on service map
SOUTHERN_CUTOFF = (
    (-96.0, 29.74),
    (-95.85, 29.745),
    (-95.65, 29.755),
    (-95.45, 29.705),
    (-95.25, 29.775),
    (-95.05, 29.785),
    (-94.7, 29.795),
    (-94.45, 29.805),
)"""

old_south = """def south_of_trim_line(ring) -> bool:
    clng, clat, min_lat, _max_lat = ring_centroid(ring)
    cut = southern_cutoff_lat(clng)
    if clat < cut - 0.01:
        return True
    if min_lat < cut - 0.025:
        return True
    return False"""

new_south = """def south_of_trim_line(ring) -> bool:
    clng, clat, min_lat, _max_lat = ring_centroid(ring)
    cut = southern_cutoff_lat(clng)
    if clat < cut:
        return True
    if min_lat < cut - 0.008:
        return True
    return False"""

for old, new in [(old_excluded, new_excluded), (old_cutoff, new_cutoff), (old_south, new_south)]:
    if old not in text:
        raise SystemExit("block not found")
    text = text.replace(old, new)

p.write_text(text, encoding="utf-8", newline="\n")
print("patched build_service_area_geo.py")
