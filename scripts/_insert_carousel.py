from pathlib import Path
p = Path(r"C:/Projects/HTRGroupLLC/src/pages/home.tsx")
c = p.read_text(encoding="utf-8")
if "setReviewPage((p)" in c:
    print("carousel exists")
    raise SystemExit(0)
old = """              ))}
            </div>
          </div>
        </section>"""
carousel = old.replace(
    "            </div>",
    """              </div>
              {totalReviewPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    type="button"
                    aria-label={isEs ? "Reseñas anteriores" : "Previous reviews"}
                    disabled={safeReviewPage <= 0}
                    onClick={() => setReviewPage((p) => Math.max(0, p - 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition-opacity disabled:opacity-40 hover:opacity-80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-xs font-semibold text-stone-500 tabular-nums">
                    {safeReviewPage + 1} / {totalReviewPages}
                  </span>
                  <button
                    type="button"
                    aria-label={isEs ? "Siguientes reseñas" : "Next reviews"}
                    disabled={safeReviewPage >= totalReviewPages - 1}
                    onClick={() => setReviewPage((p) => Math.min(totalReviewPages - 1, p + 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition-opacity disabled:opacity-40 hover:opacity-80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
              {loadingGoogleReviews && (
                <p className="text-center text-[11px] text-stone-400 mt-2">{isEs ? "Actualizando reseñas…" : "Updating reviews…"}</p>
              )}
            </div>""",
    1,
)
if old not in c:
    raise SystemExit("old block not found")
idx = c.find("pagedGoogleReviews.map")
pos = c.find(old, idx)
if pos < 0:
    raise SystemExit("position not found")
c = c[:pos] + carousel + c[pos + len(old):]
p.write_text(c, encoding="utf-8")
print("carousel inserted at", pos)
