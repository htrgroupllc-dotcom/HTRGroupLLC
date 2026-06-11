# REPORT — Center-converge marquee (2026-06-11)

## Проверка прода (до фикса)
- Секция `.htr-brand-marquee-center` на https://htrgrouptx.com/ **видна** (между `#services` и синей stats-полосой `#about`).
- В бандле commit `1cdd235` анимация через `requestAnimationFrame` + `scrollWidth/2`; классов `track--left` / CSS keyframes не было.
- Риск: при `scrollWidth === 0` до загрузки PNG цикл не стартовал корректно — визуально «не двигается».

## Исправления (commit `3b51679`)
- `src/pages/home.tsx`: упрощён `CenterConvergeMarquee` — без rAF, дублированный `MARQUEE_BRANDS`, `loading="eager"`.
- `src/index.css` + `assets/index-_bdQPowM.css`:
  - `@keyframes htr-marquee-center-left` / `htr-marquee-center-right` (48s linear infinite);
  - левая дорожка: `-50% → 0` (к центру), правая: `0 → -50%`;
  - маска только с **внешних** краёв (логотипы видны у шва);
  - z-index чередование при встрече у центра.
- `assets/index-utf8-v4.js`: тот же компонент в prod-бандле.
- `index.html`: cache bump `js?v=35`, `css?v=7`.
- `node --check` на бандле — OK.

## Верификация
- Playwright локально (390px): `animationName: htr-marquee-center-left`, transform меняется.
- Playwright прод после push: `track--left` есть, анимация движется.
- Скриншоты: `scripts/center-marquee-local-mobile.png`, `scripts/center-marquee-prod-after.png`.

## Не затронуто
- Нижний dual-row `DraggableMarquee`, Google reviews, stats bar.

## Риски
- Длительность 48s — медленная прокрутка (как у нижнего marquee ~160s, но быстрее); при желании уменьшить до 30–40s в CSS.
- Purge: классы `htr-brand-marquee-center__*` продублированы в `index-_bdQPowM.css` (prod-safe).

## Рекомендации
- После следующих правок `home.tsx` снова патчить `index-utf8-v4.js` или пересобирать Vite-бандл.
- При жалобе «медленно» — только менять `48s` в двух `@keyframes` блоках.

## Что вам делать
Ничего. Деплой с `main` уже на сайте. Ctrl+F5 на главной, проверить полосу между услугами и синей статистикой.
## Google Reviews — только реальные (2026-06-11)

### Найдено
- На сайте и в `index-utf8-v4.js` показывались статические отзывы (Brian T., Emma L. и др.) + merge с API.
- `GET /api/google-reviews` на prod: `place_not_found` (Find Place не находил бизнес).

### Исправлено
- Backend: Places API (New) `searchText` + legacy Text Search / Find Place с bias Katy (29.746, -95.761); Place Details (New) + legacy; фильтр rating ≥ 4; без fake fallback.
- Frontend/bundle: только `GET /api/google-reviews`; при ошибке — «Reviews loading…», без подстановки статики.
- `googleBusinessReviews.ts` / `reviews.ts`: убраны fake arrays.

### Replit
- **Publish** проекта `HTRGroupLLC1` (backend API изменён).
- Secrets: `GOOGLE_PLACES_API_KEY` (Places API New + Legacy), опционально `GOOGLE_PLACE_ID`.
- После деплоя проверка: `https://htr-group-llc-appliance-repair.replit.app/api/google-reviews`

### Риски
- Кэш API 3 ч — после первого успешного ответа подождите или перезапустите repl.
- Google отдаёт ограниченное число отзывов в Place Details (обычно до 5).
