# REPORT — Blog не открывался (2026-06-11)

## Найденные ошибки
- **ReferenceError: PHONE_HREF is not defined** в `BlogPost` (мобильная полоса телефонов в шапке).
- В бандле одна строка: `href: PHONE_HREF` / `PHONE_DISPLAY` вместо `PHONE_HREF$6` / `PHONE_DISPLAY$6`.
- `node --check` на бандле проходил (синтаксис валиден); падение только в рантайме React.
- Playwright: тело страницы ~58 символов, статьи не рендерились; клик с `/blog` таймаутил из‑за пустого UI.

## Диагностика
- Prod и git main бандлы совпадали по хешу до фикса — не «устаревший деплой», а баг в закоммиченном бандле.
- Коммиты d858da0 / 44ae14a (legal, home mobile) к блогу не относятся; map 37a7398 / 29548fc5 — отдельно.

## Исправления
- `assets/index-utf8-v4.js`: `PHONE_HREF` → `PHONE_HREF$6`, `PHONE_DISPLAY` → `PHONE_DISPLAY$6` (1 строка).
- `index.html`: `?v=21`, deploy comment `sw-v12`.
- `sw.js`: `htr-pwa-v11`.
- Commit `3612480`, push `main`.

## Проверка после деплоя
- 13 slug — `failed []`.
- Playwright: article? true, len 2400+, клик с `/blog` → `/blog/5-signs-refrigerator-needs-repair`, errors [].

## Риски
- Старый SW/кеш у части пользователей до обновления; v21 + sw-v11 снижают задержку.

## Рекомендации
- При патче телефонов в бандле гонять скрипт проверки bare `PHONE_HREF` / `PHONE_DISPLAY` в `Blog`/`BlogPost`.


---

# REPORT ? ????? service area (2026-06-11)

## ??????
- ZIP-???????? ?? iframe Google Maps ???????? ?? ???????????: ???????? ???????? lng/lat ? ????????????? bbox (MAP_VIEW) + viewBox 1000?300 ?? ????????? ? Web Mercator ? ??????? embed.

## ???????????
- `serviceAreaGeo.ts`: Web Mercator, ????? embed `29.7,-95.4`, zoom `9` (MAP_EMBED).
- `ServiceAreaMapOverlay.tsx`: ResizeObserver ? viewBox = ???????? ?????? ??????????.
- `home.tsx` + bundle: `ll=29.7,-95.4` ? URL iframe.
- ?????: fill `rgba(56,189,248,0.28)`, stroke `#333`.
- `index.html`: `index-utf8-v4.js?v=22`.

## ?????
- ?????? ????? geocode Google ????? ???? ?????????? ?? `ll=` ? ??? ???????? ?????????? centerLat/centerLng ? MAP_EMBED.

## ????????
- `node --check assets/index-utf8-v4.js` ? OK.

---

# REPORT — southern map trim (2026-06-11)

## Problem
- Blue ZIP fill still extended south of user red dashed boundary (Sugar Land, Pearland, Friendswood, coastal).

## Fix (commit d5d1aea)
- uild_service_area_geo.py: raised SOUTHERN_CUTOFF arc (+0.10–0.14 lat), stricter centroid/min-lat test, expanded SOUTHERN_EXCLUDED.
- Rebuilt polygons: **173 → 120** ZIPs.
- index.html: cache bump index-utf8-v4.js?v=26.
- Prod verified: page loads ?v=26; Playwright _prod_contact_map.png.

## Risks
- Inner south Houston (e.g. 77002 min lat ~29.73) still shown — inside loop, above arc at -95.45.

## Checks
- 
ode --check assets/index-utf8-v4.js — OK.

---

# REPORT - circular service map (2026-06-11, commit d349e45)

## Problem
- User red circle on screenshot: metro boundary from downtown Houston, not only southern arc (Woodlands, Katy, Baytown, south must be outside fill).

## Screenshot analysis (verified)
- Red ring on map crop: center near downtown projection (~557,325 px), radius ~165 px ≈ **43.8 km (~27 mi)** at z=9 Mercator (km/px ≈ 0.265 on embed).

## Fix
- `scripts/build_service_area_geo.py`: `RADIUS_KM = 43.8`, `HOUSTON_CENTER = (29.7604, -95.3698)`, haversine filter:
  - centroid ≤ radius
  - ≥50% ring vertices inside circle
  - max vertex distance ≤ radius (no polygons sticking outside circle)
- Removed southern-only `SOUTHERN_EXCLUDED` list and southern arc cut from collect (arc was cutting inner Houston south).
- Rebuilt: **120 → 138 ZIPs** (strict circle; excludes e.g. 77380 Woodlands, 77521 Baytown, 77384; keeps inner 770xx).
- `index.html`: `index-utf8-v4.js?v=27`
- `node --check assets/index-utf8-v4.js` — OK
- Prod: `https://www.htrgrouptx.com/?v=27#contact` loads script `?v=27` (Playwright verified).

## Risks
- 77494 Katy centroid ~39 km — still inside 43.8 km circle; if user wants Katy west out, lower `RADIUS_KM` (~39) manually.
- ZIP count (138) > rough estimate 60–90 because many small 770xx polygons fit in 27 mi circle.

## Recommendations
- Compare live map to red circle screenshot; if west/south still too wide, reduce `RADIUS_KM` in `build_service_area_geo.py` and rerun script.


---

# REPORT — Google Reviews (HOME) — 2026-06-11

## Сделано
- Секция **Google Reviews** на HOME: звёзды **#FBBC04**, компактные карточки, сетка **5 колонок** (desktop) / **2** (mobile), **10 отзывов** на страницу, стрелки prev/next при >10.
- Фронт: `src/pages/home.tsx`, `src/lib/googleReviewsClient.ts` — загрузка `GET /api/google-reviews`, фильтр **rating ≥ 4**, fallback `googleBusinessReviews.ts`.
- Прод-бандл: `assets/index-utf8-v4.js` (+ `.prod`), `index.html?v=30`.
- API: `GET /api/google-reviews` (Places Details + Find Place), кэш **3 ч**, env `GOOGLE_PLACES_API_KEY`, опционально `GOOGLE_PLACE_ID`.

## Ограничение Google (проверено по API)
- Place Details отдаёт **до 5** текстовых отзывов за запрос; остальное — статический fallback + слияние без дублей.

## Если ключ не задан
- Ответ API: `source: unconfigured`, сайт показывает статические отзывы из `googleBusinessReviews.ts`.

## Replit Secrets (HTRGroupLLC1 backend)
1. `GOOGLE_PLACES_API_KEY` — ключ с включённым **Places API**.
2. (опционально) `GOOGLE_PLACE_ID` — если не задан, поиск: *Hitechrepairgroup LLC Katy TX*.

## Риски
- Без ключа авто-подтягивание не работает (UI не ломается).
- Сборка Vite на Windows в monorepo не запускалась (rollup/linux overrides); бандл обновлён патчем.

## Проверки
- `node --check` — `api-server/src/routes/google-reviews.ts`, `assets/index-utf8-v4.js` — OK.
