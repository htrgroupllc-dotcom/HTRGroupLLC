# REPORT — Reviews 2-row grid + center marquee (v59)

Дата: 2026-06-11

## 1. Изменённые файлы

| Файл | Изменение |
|------|-----------|
| `index.html` | cache bump `v58` → `v59` |
| `src/hooks/useGoogleReviews.ts` | dev-only `console.log` count |
| `src/pages/home.tsx` | убран BOM перед `CenterConvergeMarquee` |
| `src/components/ReviewsSection.tsx` | (v58) два ряда `htr-reviews-row`, slice 0–5 / 5–10 |
| `src/index.css` | (v58) `.htr-reviews-row` grid + center marquee wings CSS |
| `assets/index-utf8-v4.js` | (v58) bundle: `htr-reviews-row`, двухкрылый marquee |
| `assets/index-_bdQPowM.css` | (v58) скомпилированный CSS с `.htr-reviews-row` и marquee keyframes |

**API route НЕ тронут** (`api-server`, `google-reviews` backend).

## 2. Reviews — где исправлено

- **`src/components/ReviewsSection.tsx`** (~104–216): `pagedReviews` по 10, `firstRow = slice(0,5)`, `secondRow = slice(5,10)`, два `<div className="htr-reviews-row gap-4">`.
- **`src/index.css`** (~627–642): явный CSS grid 1 / 3 / 5 колонок для `.htr-reviews-row` (не только Tailwind).
- **`assets/index-utf8-v4.js`** (~33379–33380): inline home reviews в bundle — те же два ряда с `htr-reviews-row`.

## 3. Logo marquee — направление

- **`src/pages/home.tsx`** `CenterConvergeMarquee`: два wing (`--left` / `--right`), дублированные strip для seamless loop, центральный seam (белая «дымка»).
- **`src/index.css`** (~644–715): маски на крылья, `htr-marquee-center-left` (к центру справа), `htr-marquee-center-right` (к центру слева). Удалена логика одной полосы на всю ширину.
- Bundle `CenterConvergeMarquee` (~32521–32534): left track `justify-start`, right `justify-end`.

## 4. API route

**Не изменён.** Только frontend fetch существующего endpoint.

## 5. Диагностика API (live)

```
GET https://htr-group-llc-appliance-repair.replit.app/api/google-reviews
count: 5
placeId: ChIJG17BnG_bZiARTsOUc0JlvyE
names: Maksat, Mukhtar Quseynov, Khayyam Amirov
ok: true, source: cache
```

При 5 отзывах: 1 ряд с 5 карточками, 2-й ряд пустой. При 6+ — два ряда (до 10 на странице).

## 6. Prod до деплоя (cache v57, Playwright 1280px)

- Reviews: `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5` (без `.htr-reviews-row`), 5 видимых карточек, 2-й ряд 0.
- Marquee: одна полоса с `justify-end` на left track, `leftDelta` ~1197px (full-width drift).

## 7. Что вам делать

После деплоя Cloudflare Pages (2–5 мин после push): **Ctrl+F5** на https://www.htrgrouptx.com и проверить секцию Reviews + center marquee между services и stats.
