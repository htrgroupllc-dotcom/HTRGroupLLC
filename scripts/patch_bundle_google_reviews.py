"""Patch production bundle for Google reviews — API only, NEVER static/fake fallback."""
from pathlib import Path

bundle = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
prod = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.prod.js")

FETCH_ONLY = """
  const [googleHomeReviews, setGoogleHomeReviews] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const apiBase = "https://htr-group-llc-appliance-repair.replit.app".replace(/\\/$/, "");
    fetch(apiBase + "/api/google-reviews", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      if (d.ok && Array.isArray(d.reviews)) {
        const live = d.reviews.filter((r) => (r.rating ?? 0) >= 4);
        setGoogleHomeReviews(live);
        if (typeof d.rating === "number") setGoogleRating(d.rating);
        if (typeof d.userRatingCount === "number") setGoogleReviewCount(d.userRatingCount);
      } else {
        setGoogleHomeReviews([]);
      }
    }).catch(() => {
      setGoogleHomeReviews([]);
    });
  }, []);
"""

for path in [bundle, prod]:
    if not path.exists():
        continue
    c = path.read_text(encoding="utf-8")
    if "James W." in c or "const RAW = [" in c:
        raise SystemExit(f"{path.name} still contains fake review data — run _strip_fake_reviews_bundle.py first")
    if "...GOOGLE_HOME_REVIEWS_STATIC" in c:
        raise SystemExit(f"{path.name} still merges static reviews")
    print(f"OK {path.name}")

print("bundle policy: API-only reviews, no static merge")
