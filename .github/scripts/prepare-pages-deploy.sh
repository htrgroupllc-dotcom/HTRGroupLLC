#!/usr/bin/env bash
# Build _pages_deploy/ with ONLY static site files for Cloudflare Pages.
# Cloudflare rejects any single file > 25 MiB — scripts/_tx_zips.geojson is ~77 MiB.
set -euo pipefail

ROOT="${1:-.}"
OUT="${2:-_pages_deploy}"
CF_MAX_MIB=25

rm -rf "$OUT"
mkdir -p "$OUT"

rsync -a \
  --exclude 'scripts/' \
  --exclude 'src/' \
  --exclude '.github/' \
  --exclude 'node_modules/' \
  --exclude 'api-server/' \
  --exclude 'artifacts/' \
  --exclude 'attached_assets/' \
  --exclude 'dist/' \
  --exclude 'build/' \
  --exclude 'out/' \
  --exclude 'public/' \
  --exclude '.git/' \
  --exclude '_pages_deploy/' \
  --exclude '*.zip' \
  --exclude 'package.json' \
  --exclude 'package-lock.json' \
  --exclude 'pnpm-lock.yaml' \
  --exclude 'pnpm-workspace.yaml' \
  --exclude 'vite.config.ts' \
  --exclude 'tsconfig*.json' \
  --exclude 'REPORT.md' \
  --exclude 'replit.md' \
  --exclude 'debug.log' \
  --exclude '.env.production' \
  "$ROOT/" "$OUT/"

# Hard fail before wrangler upload — same error as Cloudflare would return.
oversized="$(find "$OUT" -type f -size +${CF_MAX_MIB}M || true)"
if [ -n "$oversized" ]; then
  echo "::error::Deploy bundle contains file(s) over Cloudflare ${CF_MAX_MIB} MiB limit:"
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    bytes=$(stat -c%s "$f" 2>/dev/null || stat -f%z "$f")
    mib=$(awk "BEGIN {printf \"%.1f\", $bytes/1048576}")
    echo "  $f (${mib} MiB)"
  done <<< "$oversized"
  echo "Remove or exclude these paths from deploy (see .github/scripts/prepare-pages-deploy.sh)."
  exit 1
fi

# Guard: truncated vite CSS breaks admin layout (needs full Tailwind bundle).
if grep -rq 'index-BQDqdfFg.css' "$OUT" --include='*.html' 2>/dev/null; then
  echo "::error::HTML references index-BQDqdfFg.css (~22KB). Use index-_bdQPowM.css for admin/site styling."
  exit 1
fi

echo "Pages deploy bundle OK ($(du -sh "$OUT" | cut -f1), max file < ${CF_MAX_MIB} MiB)"
