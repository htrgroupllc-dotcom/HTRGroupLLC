# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## User Preferences (ВАЖНО — всегда соблюдать)

- **ГЛАВНОЕ ПРАВИЛО**: ЗАПРЕЩЕНО вносить любые изменения в проект сайта БЕЗ явной команды пользователя. Делать ТОЛЬКО то, что пользователь прямо говорит сделать. Никакой самодеятельности.
- **АБСОЛЮТНЫЙ ЗАПРЕТ**: ЗАПРЕЩЕНО менять дизайн (цвета, шрифты, отступы, layout, визуал), структуру сайта и принцип работы — без прямой команды пользователя.
- **ОБЯЗАТЕЛЬНО ПЕРЕСПРАШИВАТЬ**: Если выполнение просьбы пользователя затронет уже рабочую конструкцию сайта — сначала предупредить и спросить разрешение, ТОЛЬКО потом делать.
- **После каждого изменения** всегда давать ссылку для предпросмотра в Replit: `https://afeff229-5037-4583-8d45-8bd7b51526ee-00-2yzbbswyj587n.picard.replit.dev`
- **После каждого изменения** всегда пересобирать и давать ZIP для загрузки на Cloudflare
- **ОБЯЗАТЕЛЬНО**: ZIP файл называть с датой и временем по Houston (CDT = UTC−5) в формате `htrgrouptx-YYYYMMDD-HHMM.zip` — например `htrgrouptx-20260414-0303.zip`. НИКОГДА не называть просто `htrgrouptx-cloudflare.zip`. Для перевода в Houston time: `new Date(Date.now() - 5*3600*1000)` (или UTC−6 зимой, CST).
- Пользователь общается на русском языке

## Appliance Repair Frontend — Cloudflare Pages Deployment

- Build command: `PORT=3000 BASE_PATH=/ pnpm run build` (run inside `artifacts/appliance-repair/`)
- Build output is at: `artifacts/appliance-repair/dist/public/` ← **ALWAYS zip this folder, not `dist/`**
- Create zip: `zip.addLocalFolder('.../artifacts/appliance-repair/dist/public')` using adm-zip installed at `/tmp/npmtemp/node_modules/adm-zip`
- Upload `site.zip` to: Cloudflare Pages → project `htrgrouptx` → Deployments → Create deployment
- Live domain: `htrgrouptx.com` and `www.htrgrouptx.com`
- Backend API (production): `https://htr-group-llc-appliance-repair.replit.app`

---

## WhatsApp Bot — Настройка ЗАВЕРШЕНА (апрель 2026) ✅

### Архитектура
- **WhatsApp номер**: `+15559554342` (WhatsApp Business API, Twilio)
- **WABA ID**: `17070097757403606`
- **Meta Business Manager ID**: `398941535469435`
- **FROM в коде**: `whatsapp:+15559554342` (env: `TWILIO_WHATSAPP_NUMBER`)
- **OWNER_WA**: `whatsapp:+13468206021` (номер владельца для уведомлений)
- **Webhook URL**: `https://htr-group-llc-appliance-repair.replit.app/api/whatsapp/incoming` (HTTP POST)
- **Twilio Account SID**: `[TWILIO-SID-REMOVED]`
- **Messaging Service SID**: `MGf41635f067768fd033ad4fcea1a1964e` ("HTRGroupTX WhatsApp")
- **Channel Sender SID**: `XE4509e6169458e524bccd27944c237988` (WA sender привязан к Messaging Service)

### Рабочий статус (14.04.2026) — ВСЁ РАБОТАЕТ

**Диалоговый флоу бота (v2 — интерактивные кнопки):**
1. Клиент пишет → бот определяет язык → отправляет **интерактивный список слотов** (list-picker)
2. Клиент выбирает слот → бот спрашивает описание проблемы (текст)
3. Клиент описывает проблему → бот спрашивает **Имя**
4. Клиент вводит имя → бот спрашивает **Email**
5. Клиент вводит email → бот спрашивает **Адрес**
6. Клиент вводит адрес → бот спрашивает **Телефон**
7. Клиент вводит телефон → бот отправляет **сводку с кнопками ✅ Confirm / ❌ Cancel**
8. Клиент подтверждает → запись сохраняется в БД, хозяин получает уведомление на **русском**

**Хозяин ↔ Клиент:**
- Хозяин пишет боту на русском → бот переводит и пересылает клиенту на его языке
- Хозяин получает все уведомления на **русском** (WhatsApp + email)

**Статус:**
- ✅ Интерактивные кнопки/списки (Twilio Content API, templates: htr_slots_v5, htr_confirm_v4)
- ✅ Сессии в PostgreSQL (`wa_sessions` таблица — переживают перезапуск сервера)
- ✅ Запись сохраняется в `bookings` таблицу при подтверждении
- ✅ Уведомление хозяину WhatsApp + email при каждом входящем сообщении и подтверждении
- ✅ Перевод Gemini AI (определение языка, переводы бота клиенту и ответов хозяина)

**Twilio Content API Template SIDs:**
- `htr_slots_v5`: `HX6242517a493fee87eb75d20b2a512cd7` (list-picker, 6 слотов)
- `htr_confirm_v4`: `HX1dfcc4f33dd5f1613544cf8dd895c7d7` (quick-reply, confirm/cancel)

### Ключевая настройка в Twilio Console (уже сделана)
Путь: Messaging → Senders → WhatsApp Senders → +15559554342 → Edit Sender
- **Messaging service**: HTRGroupTX WhatsApp (MGf41635f067768fd033ad4fcea1a1964e)
- **Webhook URL for incoming messages**: `https://htr-group-llc-appliance-repair.replit.app/api/whatsapp/incoming`
- **Method**: HTTP POST
⚠️ БЕЗ этой настройки входящие от клиентов НЕ доходят до webhook

### Важные детали работы уведомлений
- WA уведомления хозяину могут тихо падать с ошибкой 63112 (24-часовое окно WhatsApp Business API)
- Email отправляется ВСЕГДА параллельно с WA — владелец всегда получит хотя бы email
- Чтобы WA работало стабильно: писать боту (+15559554342) раз в сутки для поддержания сессии

### Webhooks для Twilio номеров
- `+16066606067` (SID: `PN02be3e0e82030fd96a4938f6f5fac493`)
  - SMS webhook: `https://htr-group-llc-appliance-repair.replit.app/sms/incoming`
- `+15559554342` — WhatsApp: через Messaging Service (настроено в Twilio Console)

### Ключевые файлы бота
- `artifacts/api-server/src/routes/whatsapp.ts` — логика бота (меню, запись, уведомления, язык)
- Маршрут: `POST /api/whatsapp/incoming`
- `notifyOwner()` — отправляет WA + email одновременно (Promise.allSettled)
- Язык определяется при каждом не-цифровом сообщении, сессия обновляется

## Матрица уведомлений (6 сценариев — все реализованы)
1. **Бронирование с сайта** → Email + Admin WA+SMS + HubSpot deal (pending)
2. **Бронирование через WA бот** → Email + Admin WA+SMS + HubSpot deal (pending)
3. **Admin создаёт вручную** → Email + Admin WA+SMS + HubSpot deal (pending)
4. **Admin одобряет** → HubSpot deal stage → closedwon; email клиенту (confirmed)
5. **Admin/Client отменяет** → Email + Admin WA+SMS + HubSpot deal archived; слот освобождается
6. **Admin редактирует** → Email + Admin WA+SMS + HubSpot (старый deal archived, новый created)

Для сценария 6: `POST /api/admin/edit-booking` — принимает `{ id, name, phone, email, address, appliance, date, time, message }`.
Admin UI: кнопка "Изменить" (фиолетовая, Pencil icon) в mobile-карточке и desktop-таблице; модал с предзаполненными полями.

### Бизнес-контакты
- Телефон: `(346) 820-6021` → `tel:3468206021`
- Email: `htrgroupllc@gmail.com`
- Сайт: `htrgrouptx.com`
- Бэкенд (production): `https://htr-group-llc-appliance-repair.replit.app`
