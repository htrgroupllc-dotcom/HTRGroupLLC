# Google Reviews — отчёт (11 июня 2026)

## Шаг 1: Сравнение API

| Критерий | Google Places API (New + Legacy) | Google Business Profile API |
|----------|----------------------------------|-----------------------------|
| Авторизация | API key (`GOOGLE_PLACES_API_KEY`) | OAuth 2.0 владельца профиля |
| Отзывы за запрос | **Макс. 5** (жёсткий лимит Google) | Все отзывы локации |
| Рейтинг / count | `rating`, `userRatingCount` / `user_ratings_total` | Полный список + метаданные |
| Публичный доступ | Да | Только verified owner |
| Уже в проекте | Да (Replit Secrets) | Нет OAuth setup |

**Рекомендация:** оставить **Places API (New + Legacy merge)** — ключ уже есть, backend отдаёт только реальные отзывы. GBP API подключать позже, если нужно >5–10 отзывов с полным архивом и есть OAuth.

**Лимит Google:** за один запрос Places Details — не более 5 отзывов. Мы делаем 6 параллельных запросов (New + Legacy с разными `reviews_sort`) и **dedupe/merge** — получаем до ~7–10 уникальных **реальных** отзывов. **Фейковые отзывы для заполнения 10 слотов не добавляются.**

---

## Шаг 2: Что реализовано

### Backend (`api-server/src/routes/google-reviews.ts`)
- `CACHE_VERSION=55`, TTL **8 часов** (диапазон 6–12ч)
- Только verified Place ID: `ChIJG17BnG_bZiARTsOUc0JlvyE` (игнор чужого `GOOGLE_PLACE_ID` из env)
- Merge Places New + Legacy (`most_relevant`, `newest`, `rating`, en)
- Сортировка **newest first** (`publishTime`)
- `profilePhotoUrl` из Google (если есть)
- `googleReviewUrl`: https://g.page/r/CU7DlHNCZb8hEAE/review
- **Fallback:** при сбое Google → `source: stale_cache` (in-memory + файл `.cache/google-reviews-v55.json`) — только ранее загруженные реальные отзывы
- Фильтр чужих отзывов (Mastertex и т.д.)

### Frontend
- `src/components/ReviewsSection.tsx` — карточки, рейтинг, счётчик, pagination
- `src/hooks/useGoogleReviews.ts` — fetch только через backend
- Desktop: **2×5 = 10** карточек + стрелки если >10
- Tablet (md+): grid 2–3 колонки
- Mobile: **1 карусель** со стрелками
- Карточка: имя, звёзды `#FBBC04`, текст, дата, аватар/инициалы, **View on Google**
- Empty state без фейковых данных

### Prod bundle
- `assets/index-utf8-v4.js` + CSS `index-_bdQPowM.css?v=56`
- `node --check` — OK
- Playwright 1280px: **2 rows × 5 cols, 10 cards** — OK
- grep: нет `James W.`, `Mastertex`, `const RAW`

### API build
- HTRGroupLLC1: `voice-v82-google-reviews-v55`

---

## Проверка API (prod до Publish)

До Replit Publish на проде может быть старый API (`CACHE_VERSION=8`, 3ч). После Publish:

```
GET https://htr-group-llc-appliance-repair.replit.app/api/google-reviews
→ ok: true, placeId: ChIJG17BnG_bZiARTsOUc0JlvyE, реальные имена
```

---

## Что вам делать

1. **Replit → Publishing → Publish** (HTRGroupLLC1) — новый backend v55
2. **Cloudflare** подтянет сайт из GitHub `HTRGroupLLC` `main` (2–5 мин) или Push в GitHub Desktop
3. Проверка: https://htrgrouptx.com/#reviews — 2 ряда на desktop, карусель на mobile

---

## Риски

- Places API по-прежнему отдаёт ≤5 отзывов **на запрос** — на сайте может быть 7–10 уникальных, не 312
- Для всех 9+ отзывов с полным текстом нужен GBP API + OAuth (отдельная задача)
- После первого Publish cache v55 сбросится — первый запрос к Google обновит данные
