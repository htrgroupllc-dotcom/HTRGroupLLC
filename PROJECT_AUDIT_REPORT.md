# PROJECT_AUDIT_REPORT.md

**Дата аудита:** 2026-06-20  
**Режим:** read-only (код не менялся, кроме этого файла)  
**Репозитории на диске:**

| Репозиторий | Путь | Назначение |
|-------------|------|-----------|
| Frontend (appliance + shared CRM) | `C:\Projects\HTRGroupLLC` | Cloudflare Pages → `htrgrouptx.com` |
| Frontend (dental public) | `C:\Projects\DentalEquipSite` | Cloudflare Pages → dental site |
| API (Replit) | `C:\Projects\htrgr\REPLIT-LATEST\HTRGroupLLC1\artifacts\api-server` | Backend `/api/*` |

**Production API (проверено в `.env.production`):**  
`https://htr-group-llc-appliance-repair.replit.app`

**Последние известные деплои (из сессии):**

- Frontend bundle: **v=127** (`7944218` — fix `CalendarTab` import на employee)
- API: `6fe3564` (SMS review fallback), `8fbe4ad` (review channels split)

---

## 1. Страницы (Frontend)

### HTRGroupLLC (`src/App.tsx`, wouter)

| URL | Страница | Файл |
|-----|----------|------|
| `/` | Home + booking form (`#contact`) | `src/pages/home.tsx` |
| `/gallery` | Gallery | `src/pages/gallery.tsx` |
| `/blog`, `/blog/:slug` | Blog | `src/pages/blog.tsx`, `blog-post.tsx` |
| `/admin` | Admin CRM (AuthGate) | `src/pages/admin.tsx` |
| `/employee` | Employee portal | `src/pages/employee.tsx` |
| `/pay` | Stripe checkout | `src/pages/pay.tsx` |
| `/payment-success` | Payment confirmation | `src/pages/payment-success.tsx` |
| `/book-call/:token` | Voice intake redirect | `src/pages/voice-book-call.tsx` |
| `/intake/:token`, `/form/:token` | Объявлены в роутере, **token не читается** (см. риски) | `voice-book-call.tsx` |
| `*` | 404 | `src/pages/not-found.tsx` |

**Якоря home:** `#services`, `#about`, `#gallery`, `#faq`, `#contact`, `#brands`

**Отдельные HTML entry:** `admin/index.html`, `pay/index.html` (тот же JS bundle)

### DentalEquipSite (`DentalEquipSite/src/App.tsx`)

Те же CRM-маршруты + `/privacy-policy`, `/terms-of-service`.  
Booking с `business_type: "dental"`.

**Нет отдельных routes** `/services`, `/contact` — это секции на home (`#services`, `#contact`).

---

## 2. API routes (сводка)

Точка входа: `api-server/src/index.ts` → `app.ts` → `/api` → `routes/index.ts`

| Домен | Ключевые endpoints | Файл |
|-------|------------------|------|
| Health | `GET /healthz` | `routes/health.ts` |
| Auth | `/auth/*`, WebAuthn | `routes/auth.ts` |
| **Booking** | `POST /booking`, `GET /availability`, approve/cancel | `routes/booking.ts` |
| **Calendar** | `GET /calendar/events`, `PATCH /calendar/events/:id` | `routes/calendar.ts` |
| **Admin CRM** | `/admin/schedule`, booking CRUD, trash, block slots | `routes/booking.ts`, `admin-schedule.ts` |
| **Employees** | `/admin/employees/*`, assign, close-as-employee | `routes/admin-employees.ts` |
| **Employee** | `/employee/login`, bookings, close, estimate, calendar booking | `routes/employee.ts` |
| **Estimates** | admin/employee estimate CRUD + HTML | `routes/estimates.ts`, `lib/estimateService.ts` |
| **Payments** | Stripe checkout, webhook, invoice PDF/HTML | `routes/stripe-payments.ts`, `lib/paymentService.ts` |
| **WhatsApp** | `POST /whatsapp/incoming` | `routes/whatsapp.ts` |
| **SMS bot** | `POST /sms/incoming` | `routes/whatsapp.ts` |
| **Voice AI** | `/voice/*`, WebSocket stream | `routes/voice.ts` |
| **Intake** | `/intake-form/:token`, `/voice-intake/:token` | `routes/voice-intake.ts`, `lib/intakeFormHtml.ts` |
| **Payroll/Finance** | `/admin/payroll*`, `/admin/finance` | `routes/payroll.ts`, `finance.ts` |
| **Gallery/Reviews** | `/gallery`, `/google-reviews` | `routes/gallery.ts`, `google-reviews.ts` |
| **Settings** | `/admin/settings` | `routes/admin-settings.ts` |
| **Watchdog** | `/admin/watchdog/*` | `watchdog.ts` |

Полный список: ~80+ route handlers (см. explore-отчёт API).

---

## 3. Как работает Booking

### Public web (`POST /api/booking`)

1. Frontend (`home.tsx`): форма name/phone/email/address/appliance/date/time/message.
2. **Дата/время:** selects + grid слотов 9:00–17:00; `GET /api/availability?date=`.
3. **Валидация ZIP** (Houston metro), min date (`lib/bookingDate.ts`, Houston TZ).
4. API: `validateSharedSlot()` — cross-pool (dental DB + appliance DB), 90-min buffer, `blocked_slots`.
5. `business_type` из body / Origin / Referer (`resolveBookingBusinessType`).
6. INSERT `bookings` status **`pending`** → email approve link → owner WhatsApp (`formatOwnerWebBookingWhatsApp`).

### Admin / Employee create

- `POST /api/admin/booking` → **approved**
- `POST /api/employee/booking` → **approved**, assigned to employee
- Оба используют `validateSharedSlot()` (cross-pool)

### WhatsApp bot (`saveWaBooking`)

- Appliance-only conversational flow в `whatsapp.ts`.
- Slot check **только local DB** (без cross-pool) — **риск double-book с dental web**.

### Voice / Intake

- `createVoiceBooking()` / `createPhoneBooking()` — local conflict only.

### Double-booking protection

| Механизм | Где |
|----------|-----|
| Exact slot + ACTIVE statuses | `sharedCalendar.ts` → `validateSharedSlot` |
| 90-min forward buffer | `BOOKING_BUFFER_MINS = 90` |
| Cross-pool | `APPLIANCE_DATABASE_URL` + local pool |
| Cancel releases slot | status → `cancelled` (не в ACTIVE_BLOCKING_STATUSES) |

**ACTIVE_BLOCKING_STATUSES (проверено):**  
`pending`, `confirmed`, `scheduled`, `in_progress`, `approved`

**Не блокируют:** `cancelled`, `completed` (+ `rejected` не используется в SQL — статус в CRM может отличаться)

---

## 4. Как работает CRM (Admin)

**Файл:** `src/pages/admin.tsx` (~4000+ строк)

- Вкладки: Bookings, Calendar, Employees, Archive, Blacklist, Payroll, Reports, Pricebook, Photos, Settings, Trash.
- Auth: PIN + WebAuthn (`adminAuthH()`, Bearer JWT).
- Bookings: approve, edit, reschedule, complete, cancel, trash/restore, assign employee.
- Фильтр **`bizFilter`:** `all | appliance | dental`.
- Estimates, invoices, review request (SMS / Email / WhatsApp отдельно — v126+).
- Calendar: shared `CalendarTab` component.
- Voice callback, call logs, gender picker для перезвона.

**API:** `GET /api/admin/schedule` (merge dental + appliance pools).

---

## 5. Admin panel

См. раздел 4. Дополнительно:

- `AuthGate` на `/admin` (`src/components/AuthGate.tsx`)
- PWA: `admin-manifest.json`
- Mobile + desktop layouts для bookings table
- Face ID / WebAuthn device registration

---

## 6. Employee dashboard

**Файл:** `src/pages/employee.tsx`

- Tabs: **Jobs**, **Calendar**, Stats, Payroll, Profile
- Auth: phone + PIN, WebAuthn
- Jobs: active / completed / archived; search; JobCard
- Close job → payment (cash/Stripe), receipt, photos, signature, estimate
- Calendar: `CalendarTab` mode=`employee` (fix import v127)
- Review buttons: SMS / Email / WhatsApp (v126+)

**API:** JWT `Authorization: Bearer`, routes под `/api/employee/*`

---

## 7. Estimate

**API:** `routes/estimates.ts`, `lib/estimateService.ts`

- Create/send: admin + employee (`POST .../estimate`)
- HTML/PDF: `buildEstimateHtml()` с branding из `documentBranding.ts`
- Tax 8.25%, flag `no_tax`
- Email (Gmail) + optional SMS
- Owner WA notify

**Dental branding (проверено в `documentBranding.ts`):**

- Phone: `(346) 696-8751` ✅
- Company: HTR Group-Dental ✅
- **606-660-6067 на dental estimate:** ❌ не в dental block (только appliance block)

**Dental prep text:** в booking emails (`booking.ts` ~1209) и dental site FAQ ✅  
**Pets text:** только appliance `home.tsx` FAQ ❌ (не должно попадать в dental docs)

---

## 8. Invoice

**API:** `lib/paymentService.ts` — `generateInvoiceHtml()`, `generateInvoicePdf()`

- Trigger: job close (cash/online), Stripe webhook `checkout.session.completed`
- Public: `/api/public/invoice-html?session_id=`
- Branding via `brandingFor(business_type)`

**Dental invoice:** без 606 в `documentBranding` dental block ✅  
**Appliance invoice:** содержит 606 + 346 ✅ (ожидаемо)

---

## 9. Payment

**Flow:**

1. Employee/admin close → `createStripeCheckoutAndSendEmail()` или cash invoice
2. Client → `/pay` (Stripe.js, `VITE_STRIPE_PUBLISHABLE_KEY`)
3. Webhook → `handleStripeWebhook()` → `payment_status=paid`, `stripe_paid=true`
4. `/payment-success` → confirmation + invoice download

**Env:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`

**Риск:** без Stripe keys checkout не инициализируется (graceful degrade).

---

## 10. WhatsApp bot

### Customer bot (`POST /whatsapp/incoming`)

- **Appliance repair** flow (brand/model/problem/confirm)
- Gemini AI для owner↔client translate
- `saveWaBooking()` — local slot only
- Owner notify: `formatOwnerWaBotBookingWhatsApp()`

### Dental booking notifications (не customer bot)

- **Web dental booking** → `formatDentalOwnerWhatsApp()` via `ownerBookingWhatsApp.ts`
- Поля: name, phone, email, clinic, equipment, brand, model, issue, date, time, source, business type ✅
- Source default: `dentalfixpro.com` (user spec mentions `dentequmentfix.com` — **legacy domain**, проверить prod Origin)
- Отправка: `sendOwnerWhatsApp()` в `booking.ts`

**Отдельного dental customer WhatsApp bot нет** — dental идёт через сайт + owner WA alert.

---

## 11. Environment variables

### API (`api-server`, из кода)

| Variable | Назначение |
|----------|-----------|
| `DATABASE_URL` | Primary PG (dental on Replit deploy) |
| `APPLIANCE_DATABASE_URL` | Cross-pool appliance bookings |
| `DENTAL_DATABASE_URL` | Estimate cross-read |
| `SESSION_SECRET` | Admin/employee JWT |
| `ADMIN_PIN` / `HTR_ADMIN_PIN` | Admin auth |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | SMS/WA/Voice |
| `TWILIO_WHATSAPP_NUMBER`, `TWILIO_FROM`, `TWILIO_VOICE_NUMBER` | Senders |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payments |
| `EMAIL_USER`, `EMAIL_PASS` | Gmail (estimates, invoices, reviews) |
| `OPENAI_API_KEY` | Voice agent, translate |
| `AI_INTEGRATIONS_GEMINI_*` | WA/SMS/chat Gemini |
| `PUBLIC_BASE_URL` | Approve links, Twilio callbacks |
| `OWNER_PHONE`, `OWNER_WHATSAPP_NUMBER` | Owner alerts |
| `HUBSPOT_TOKEN` | CRM sync |
| `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` | Reviews |
| `WEBAUTHN_RP_ID`, `REPLIT_DOMAINS` | WebAuthn |

Settings table также хранит: `admin_pin_hash`, `owner_whatsapp_number`, payroll, visit fees.

### Frontend

| Variable | Где |
|----------|-----|
| `VITE_API_BASE` | Основной API URL |
| `VITE_API_URL` | ChatWidget only (дублирование — риск) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `/pay` |

---

## 12. Таблицы базы данных

| Таблица | Назначение |
|---------|-----------|
| `bookings` | Основные заявки (status, payment, calendar cols, business_type, …) |
| `employees` | Техники + PIN |
| `blocked_slots` | Ручная блокировка слотов |
| `estimates` | Сметы (items JSONB, tax flags) |
| `pricebook` | Прайс для estimate |
| `settings` | Key-value config |
| `employee_warnings` | HR warnings |
| `blacklist` | Чёрный список клиентов |
| `payroll_reports`, `payroll_payments`, `payroll_records` | Зарплата |
| `booking_photos`, `booking_signatures` | Медиа job close |
| `receipt_*_log` | Audit receipts |
| `voice_intake_tokens` | Voice intake links |
| `call_logs` | Call transcripts |
| `wa_sessions` | WhatsApp session state |
| `webauthn_credentials`, `employee_webauthn_credentials` | Biometric auth |
| `gallery_photos` | Site gallery (site=appliance\|dental) |

DDL: self-healing в `app.ts` + runtime CREATE в routes.

---

# ЧТО РАБОТАЕТ (проверено / подтверждено в коде и prod-сессии)

| Область | Статус |
|---------|--------|
| Public appliance site + booking form | ✅ Код + API availability |
| Admin CRM bookings/calendar/employees | ✅ (после v124–127) |
| Employee jobs tab | ✅ |
| Employee calendar tab | ✅ после fix v127 (был сломан import) |
| Review request 3 channels (admin/employee) | ✅ UI v126; SMS нужен Replit Publish для API |
| Shared calendar cross-pool validation | ✅ `validateSharedSlot` |
| Dental web booking → owner WA dental format | ✅ `dentalOwnerWhatsApp.ts` |
| Dental estimate/invoice branding (346, no 606) | ✅ `documentBranding.ts` dental block |
| Stripe payment + webhook flow | ✅ код; зависит от env |
| Voice AI agent | ✅ код обширный |
| Google reviews API | ✅ live 5 reviews (REPORT.md) |

---

# ЧТО НЕ РАБОТАЕТ / ИЗВЕСТНЫЕ БАГИ

| # | Проблема | Severity | Файлы |
|---|----------|----------|-------|
| 1 | Employee calendar **ломался** (удалён import) | 🔴 fixed v127 | `employee.tsx` |
| 2 | SMS review «Twilio SMS not configured» без `TWILIO_FROM` | 🟡 fixed API `6fe3564`, needs Publish | `reviewRequest.ts` |
| 3 | `/intake/:token`, `/form/:token` routes **не читают token** | 🟡 | `voice-book-call.tsx` |
| 4 | WhatsApp appliance bot **не проверяет cross-pool** | 🟡 double-book risk | `whatsapp.ts` |
| 5 | Voice/intake booking **без cross-pool** | 🟡 | `voice.ts`, `voice-intake.ts` |
| 6 | `VITE_API_URL` vs `VITE_API_BASE` inconsistency | 🟡 | `ChatWidget.tsx` |
| 7 | **Нет automated tests** (playwright dep only, no specs) | 🔴 | `scripts/package.json` |
| 8 | Root `npm run build` — stub, не vite | 🟡 | `HTRGroupLLC/package.json` |
| 9 | Missing calendar i18n keys (es/tr/uk) on employee | 🟢 | `EmpLangContext.tsx` |
| 10 | Dental source domain: code uses `dentalfixpro.com`, spec says `dentequmentfix.com` | 🟢 verify prod | `dentalOwnerWhatsApp.ts` |

---

# GLOBAL SEARCH — некорректный контент

| Термин | Appliance (OK) | Dental/API (проблема?) |
|--------|---------------|----------------------|
| `606-660-6067` | ✅ `sitePhones.ts`, appliance docs | ❌ не должно быть на **dental invoice** — dental block OK; ⚠️ `watchdog.ts` emails mix both |
| pets/dogs/cats | ✅ appliance FAQ `home.tsx` | ✅ отсутствует на dental site |
| refrigerator/washer (appliance) | ✅ appliance site | ✅ dental uses dental equipment catalog |
| Dental prep text | N/A | ✅ dental site + API booking emails |

**Не трогать appliance site files** при dental cleanup (user rule).

---

# РИСКИ

1. **Cross-pool gaps** — WA/voice могут забронировать слот, занятый другим business_type.
2. **Replit Publish lag** — frontend на Cloudflare обновляется быстрее API.
3. **Dual DB** — `APPLIANCE_DATABASE_URL` unset → cross-pool отключён silently.
4. **Monolithic admin.tsx / employee.tsx** — высокий риск случайных удалений (CalendarTab incident).
5. **No CI/tests** — регрессии не ловятся автоматически.
6. **Secrets in Replit** — SMS/email/WA зависят от env на prod.

---

# ЧТО НУЖНО ИСПРАВИТЬ (Phase 2 — по приоритету)

## P0 — стабильность

1. ✅ Restore `CalendarTab` import (done v127)
2. ✅ SMS review fallback (done API `6fe3564`, Publish needed)
3. Add **test harness** + `npm run audit:project`
4. E2E smoke: home, admin login gate, employee tabs

## P1 — корректность dental

5. Verify dental WA `source` matches live domain (`dentalfixpro.com` vs `dentequmentfix.com`)
6. Add unit tests for `validateSharedSlot`, ACTIVE statuses, buffer
7. E2E estimate/invoice dental content (346, prep text, no 606, no pets)

## P2 — booking integrity

8. Align WA/voice slot checks with `validateSharedSlot` (**осторожно — не ломать working WA flow**)
9. Fix `/intake` and `/form` token routing

## P3 — DX

10. Unify `VITE_API_BASE` / `VITE_API_URL`
11. Complete i18n calendar keys (es/tr/uk)
12. Real `npm run build` in root package.json

---

# ФАЙЛЫ, КОТОРЫЕ БУДУТ ЗАТРОНУТЫ (Phase 2, план)

| Файл | Зачем |
|------|-------|
| `tests/e2e/*.spec.ts` | NEW — Playwright E2E |
| `tests/unit/*.test.ts` | NEW — Vitest unit |
| `playwright.config.ts` | NEW |
| `vitest.config.ts` | NEW |
| `package.json` (root + api-server) | scripts: test, lint, audit:project |
| `employee.tsx` | ✅ already fixed |
| `reviewRequest.ts` | ✅ already fixed |
| `sharedCalendar.ts` | unit tests only (no logic change unless test fails) |
| `whatsapp.ts`, `voice.ts` | only if cross-pool tests prove bug |
| `voice-book-call.tsx` | intake token fix |
| `EmpLangContext.tsx` | missing keys |
| `ChatWidget.tsx` | env unification |

**Не планируется менять:** appliance public copy, appliance branding, payment core logic без failing test.

---

# ТЕКУЩЕЕ СОСТОЯНИЕ ТЕСТОВ

| Tool | Status |
|------|--------|
| Playwright | dependency in `scripts/package.json` only |
| Vitest/Jest | ❌ not configured |
| API route tests | ❌ none |
| `npm run test` | ❌ missing |
| `npm run audit:project` | ❌ missing |

---

# СЛЕДУЮЩИЙ ШАГ (Phase 2 — по вашему ТЗ)

1. `git checkout -b safe-audit-fixes` (в каждом repo)
2. Добавить Vitest + Playwright config + test files из списка ТЗ
3. Добавить scripts + `npm run audit:project`
4. Запустить lint → typecheck → test → e2e → build
5. Чинить **только** падающие тесты маленькими шагами
6. Создать `FINAL_TEST_REPORT.md`

**Branch `safe-audit-fixes` и тесты ещё не созданы** — ждут Phase 2.

---

# КОМАНДЫ ДЛЯ РУЧНОЙ ПРОВЕРКИ (сейчас)

```powershell
# Frontend bundle rebuild
Set-Location C:\Projects\HTRGroupLLC
node scripts/build-pages-bundle.mjs

# API build
Set-Location C:\Projects\htrgr\REPLIT-LATEST\HTRGroupLLC1\artifacts\api-server
node ./build.mjs
```

**Prod URLs:**

- https://htrgrouptx.com/
- https://htrgrouptx.com/admin/
- https://htrgrouptx.com/employee/
- API: https://htr-group-llc-appliance-repair.replit.app/api/healthz

---

*Отчёт составлен без изменения production-кода. Phase 2 (тесты + fixes) — следующий этап.*
