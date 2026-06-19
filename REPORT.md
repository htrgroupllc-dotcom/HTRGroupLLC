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

## 8. Prod после деплоя v59 (Playwright 1280px)

- cache: **v59**
- Reviews: `htr-reviews-row` × 2, row0 = 5 карточек, row1 = 0 (API даёт 5 отзывов), `firstCols = 5`
- Marquee: wings left/right, `justify-start` / `justify-end`, `animLeft` + `animRight` = true

## 7. Что вам делать

Деплой уже на **v59**. **Ctrl+F5** на https://www.htrgrouptx.com и проверить секцию Reviews + center marquee между services и stats.

---

## 2026-06-19 — Admin: вкладка «Архив заказов» (v96)

### Сделано
- Вкладка **«Архив»** для завершённых/отменённых заказов; на «Заявки» остаются только активные.
- Восстановление заказа из архива — кнопка «Восстановить» (существующий API).
- Старая вкладка «Архив» (уволенные сотрудники) → **«Уволенные»**.
- Одинаковая логика admin на appliance и dental (`defaultBizFilter: all`).
- Production: `assets/index-utf8-v4.js` + cache `?v=96` в `index.html`, `admin/`, `pay/`.

### Проверка
- https://htrgrouptx.com/admin — вкладка «Архив», restore, «Заявки» без закрытых.
- Dental-сайт: те же правки в `DentalEquipSite/src` (деплой dental отдельно).

---

## 2026-06-19 — Invoice PDF fix (v98)

### Проблема
Пустой PDF инвойса в admin/employee — клиентский `html2pdf` + iframe 10px + `cid:` логотипы.

### Сделано
- `_patch_pdf_download.js` — server PDF через `downloadBinaryPdf` + endpoints `invoice-pdf`
- Исправлена **SyntaxError** в bundle (лишняя `)` от `_patch_jobs_archive.js`, строка ~89785) — CI deploy падал
- Cache bump **v98**, push → GitHub Actions #173 **success**
- Prod bundle проверен: `downloadBinaryPdf: true`, `invoice-pdf` admin/employee, старый `invoice-html` убран

### Проверка (ручная)
1. https://htrgrouptx.com/admin → вкладка «Архив» → оплаченный заказ → кнопка PDF
2. https://htrgrouptx.com/employee → закрытый job → PDF
3. Файл должен быть **непустой** server-generated PDF (PDFKit на API)

### Коммиты
- `ba08f27` — patch v97
- `0ebd418` — cache v98
- `d16e4ba` — fix syntax + deploy
