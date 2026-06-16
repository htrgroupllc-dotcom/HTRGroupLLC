from pathlib import Path
import re
home = Path(r"C:/Projects/HTRGroupLLC/src/pages/home.tsx")
ht = home.read_text(encoding="utf-8")
imp = '''import {
  GOOGLE_STAR_COLOR,
  REVIEWS_PER_PAGE,
  fetchGoogleReviewsFromApi,
  filterPositiveGoogleReviews,
} from "../lib/googleReviewsClient";
'''
if "googleReviewsClient" not in ht:
    ht = ht.replace(
        'import { GOOGLE_REVIEW_URL } from "../data/googleBusinessReviews";',
        'import { GOOGLE_REVIEW_URL } from "../data/googleBusinessReviews";\n' + imp,
    )
ht = re.sub(
    r"<motion\.div\s+key=\{`\$\{r\.name\}-\$\{i\}`\}[\s\S]*?className=\"bg-white rounded-lg p-2 md:p-2\.5 shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card\"\s*>",
    '<div key={`${r.name}-${i}`} className="bg-white rounded-lg p-2 md:p-2.5 shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card">',
    ht,
    count=1,
)
ht = ht.replace(
    "                  <p className=\"text-stone-600 text-[11px] md:text-xs leading-snug flex-1 line-clamp-3\">{isEs ? r.textEs : r.textEn}</p>\n                </motion.div>",
    "                  <p className=\"text-stone-600 text-[11px] md:text-xs leading-snug flex-1 line-clamp-3\">{isEs ? r.textEs : r.textEn}</p>\n                </div>",
    1,
)
new_center = Path(r"C:/Projects/HTRGroupLLC/scripts/_center_tsx_snip.txt").read_text(encoding="utf-8")
ht = re.sub(r"function CenterConvergeMarquee\([\s\S]*?\n\}\n\nexport default function Home", new_center + "\nexport default function Home", ht, count=1)
home.write_text(ht, encoding="utf-8")
print("home patched")
