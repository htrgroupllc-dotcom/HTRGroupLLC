from pathlib import Path
import re

PLACE = "ChIJG17BnG_bZiARTsOUc0JlvyE"

paths = [
    Path(r"C:/Projects/HTRGroupLLC/api-server/src/routes/google-reviews.ts"),
    Path(r"C:/Projects/htrgr/REPLIT-LATEST/HTRGroupLLC1/artifacts/api-server/src/routes/google-reviews.ts"),
    Path(r"C:/Projects/htrgr/REPLIT-LATEST/HTRGroupLLC-source/api-server/src/routes/google-reviews.ts"),
]

for path in paths:
    if not path.exists():
        print("skip", path)
        continue
    t = path.read_text(encoding="utf-8")
    t = re.sub(r"const CACHE_VERSION = \d+;", "const CACHE_VERSION = 3;", t)
    t = re.sub(
        r'const DEFAULT_GOOGLE_PLACE_ID = "[^"]*";',
        f'const DEFAULT_GOOGLE_PLACE_ID = "{PLACE}";',
        t,
    )
    old = """    url.searchParams.set("fields", "place_id");
    url.searchParams.set("locationbias", `circle:80000@${BUSINESS_LOCATION.lat},${BUSINESS_LOCATION.lng}`);
    url.searchParams.set("key", key);
    const res = await fetch(url.toString());
    if (!res.ok) continue;
    const data = (await res.json()) as { candidates?: { place_id?: string }[] };
    const pid = data.candidates?.[0]?.place_id;
    if (pid) return pid;"""
    new = """    url.searchParams.set("fields", "place_id,name,formatted_address");
    url.searchParams.set("locationbias", `circle:80000@${BUSINESS_LOCATION.lat},${BUSINESS_LOCATION.lng}`);
    url.searchParams.set("key", key);
    const res = await fetch(url.toString());
    if (!res.ok) continue;
    const data = (await res.json()) as {
      candidates?: { place_id?: string; name?: string; formatted_address?: string }[];
    };
    for (const c of data.candidates ?? []) {
      const score = scoreBusinessCandidate(c.name ?? "", c.formatted_address ?? "");
      if (score >= 10 && c.place_id) return c.place_id;
    }"""
    if old in t:
        t = t.replace(old, new)
    if "cachedPlaceId" not in t:
        t = t.replace(
            "  if (cache && cache.version === CACHE_VERSION && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {",
            """  const expectedPlaceId = (process.env["GOOGLE_PLACE_ID"] ?? "").trim() || DEFAULT_GOOGLE_PLACE_ID.trim();
  if (cache && cache.version === CACHE_VERSION && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    const cachedPlaceId = typeof cache.payload.placeId === "string" ? cache.payload.placeId : "";
    if (expectedPlaceId && cachedPlaceId && cachedPlaceId !== expectedPlaceId) {
      cache = null;
    } else {""",
        )
        t = t.replace(
            '    res.json({ ...cache.payload, source: "cache" });\n    return;\n  }',
            '      res.json({ ...cache.payload, source: "cache" });\n      return;\n    }\n  }',
        )
    path.write_text(t, encoding="utf-8", newline="\n")
    print("patched", path)
