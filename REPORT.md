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
# REPORT — 2026-06-11 (marquee + Google reviews)

## Найденные ошибки
1. **Center marquee «невидим» на prod:** в DOM секция `.htr-brand-marquee-center` есть, но `.__row` имел **height: 0** — классы `h-[72px]` / `md:h-[88px]` не попали в собранный CSS (только JS-бандл). Логотипы анимировались вне видимой области.
2. **Google Reviews:** API отдавал **чужой бизнес** (Liz Kent / brakes) — `findplacefromtext` брал **первого кандидата** без scoring; кэш TTL 3ч держал неверные данные. Рейтинг 4.2 / 57 vs 1 карточка.

## Исправления
- CSS: `min-height: 80px` для секции, фиксированная высота row 72/88px, `height: 100%` для wings — `src/index.css` + `assets/index-_bdQPowM.css`.
- `index.html` cache bust **v=36**.
- API: `DEFAULT_GOOGLE_PLACE_ID=ChIJG17BnG_bZiARTsOUc0JlvyE` (из g.page/r/CU7DlHNCZb8hEAE), `CACHE_VERSION=3`, scoring для Find Place, сброс кэша при несовпадении placeId.
- Push: HTRGroupLLC `10b1b9e`, HTRGroupLLC1 (api-server artifact).

## Проверка (Playwright, prod до деплоя CSS)
- Без фикса: `rowH: 0`, `visibleImgs: 0`.
- С инжектом CSS: `rowH: 88`, `visibleImgs: 73+` при анимации.

## Действие пользователя
1. **Cloudflare Pages** — подождать деплой после push (2–5 мин), проверить https://htrgrouptx.com/?v=36
2. **Replit → Publish** — обязательно после push API (reviews не обновятся без redeploy backend).

## Gallery (c58c10f)
- В бандле `index-utf8-v4.js` есть `galleryIdx` / lightbox onClick — **не проверено** кликом на prod после деплоя.

## Риски
- До Replit Publish reviews могут оставаться из старого кэша (до 3ч) — после deploy + CACHE_VERSION=3 должны подтянуться реальные отзывы Hitechrepairgroup.

## Gallery fix (2026-06-11)

### Findings (prod htrgrouptx.com/gallery)
- Playwright: click on tile opens lightbox (`1 / 248`); no `pageerror`.
- `node --check` on `assets/index-utf8-v4.js` ? OK.
- 158 static JPG URLs from bundle ? all HTTP 200 `image/jpeg`.
- Commits `3b51679` / `6f5a978` changed home marquee/reviews bundle, not gallery route logic.
- Intermittent Replit `429` on many `/api/gallery/file/*` during burst loads (thumbnails); after idle, 0 broken images in test.

### Fix applied
- Gallery hover overlay: `pointer-events-none` so taps reach tile `onClick`.
- Lightbox `z-[120]` (above header/chat `z-50`).
- Lock `document.body` scroll while lightbox open.
- Cache bust `index.html` ? `v=37`.

### Risks
- Dynamic photos still depend on Replit API; rate limits can blank NEW tiles temporarily.

### Verify after deploy
- Open `/gallery`, tap any photo ? full-screen image + caption counter.
- Hard refresh or wait for CF deploy (`?v=37`).


## Center marquee (2026-06-11)
- Исправлен .htr-brand-marquee-center: цветные логотипы (filter: none), полная ширина экрана, CSS-анимация сходятся к центру, дублированная лента без разрывов.
- Исправлена поломанная строка export default function Home() в home.tsx.
- Playwright local: desktop+mobile — filter none, anim left+right, stage full width.
- Push main 7877397, cache index-utf8-v4.js?v=41, index-_bdQPowM.css?v=8.

## Home split photos — без обрезки (2026-06-11)
- Откат crop из 5e2aac4: убраны max-height, aspect-ratio 4/3, object-fit: cover для Why Us и Our Work.
- Пропорциональное масштабирование: контейнер max-width, img width 100% height auto, object-fit: contain.
- Файлы: home.tsx, src/index.css, assets/index-_bdQPowM.css, index-utf8-v4.js; cache ?v=42 / ?v=9.

