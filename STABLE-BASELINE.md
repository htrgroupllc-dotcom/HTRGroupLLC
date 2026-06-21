# Stable baseline — HTRGroupLLC (htrgrouptx.com)

**Зафиксировано:** 2026-06-21 (обновлено: bundle versions v156/v150)  
**Git commit:** `549d4c3aef8bd0aec2bf89b61a21a593b6615dc1` (baseline tag)  
**Текущий prod admin restore:** `11f9b38` — admin-index v150  
**Git tag:** `stable-baseline-jun-2026`  
**Branch:** `main`  
**Repo:** https://github.com/htrgroupllc-dotcom/HTRGroupLLC

> При поломке сайта/админки/оплаты — восстанавливать **из этого коммита/тега**.  
> Не трогать защищённые зоны без явной задачи пользователя.

---

## Что работает (проверено)

| Область | Состояние |
|---------|-----------|
| Сайт htrgrouptx.com | OK |
| Admin mobile (`/admin/`) | OK — отдельный pinned bundle |
| Pay page (`/pay/`) | OK — Stripe key из API, Tap to Pay, Back, без WhatsApp |
| Employee portal | OK — Tap to Pay на карточке и при закрытии заказа |
| Tap to Pay на телефоне | Открывает **приложение Stripe Dashboard** (не Safari) |
| Cloudflare deploy CI | OK |

---

## Бандлы (критично — не смешивать)

| Страница | JS файл | Cache v |
|----------|---------|---------|
| Сайт `index.html` | `/assets/index-utf8-v4.js` | **156** |
| Pay `pay/index.html` | `/assets/index-utf8-v4.js` | **156** (тот же что сайт) |
| Admin `admin/index.html` | `/assets/admin-index-utf8-v4.js` | **150** (отдельный, pinned) |

- **Admin НЕ использует** `index-utf8-v4.js` — иначе ломается mobile PWA.
- Сборка (`scripts/build-pages-bundle.mjs`) **не должна** менять `admin/index.html`.
- CI (`.github/scripts/prepare-pages-deploy.sh`) проверяет: site+pay одна версия, admin — `admin-index-utf8-v4.js`.

---

## Ключевая логика (не ломать)

### Tap to Pay → приложение Stripe (mobile/PWA)
- URL на телефоне: `https://dashboard.stripe.com/dashboard` (universal link → native app)
- URL на desktop: `https://dashboard.stripe.com/terminal/payments/create`
- Файлы: `src/pages/pay.tsx`, `src/pages/employee.tsx`

### Pay page
- Stripe publishable key: `GET /api/public/stripe-config` at runtime (`src/pages/pay.tsx`)
- WhatsApp скрыт на `/pay/` (`src/App.tsx` — `isPay` по pathname)
- Back: event `htr-pay-back` (`BackButton.tsx` + `pay.tsx`)

### Admin mobile
- Bundle: `assets/admin-index-utf8-v4.js` (копия рабочего v145, blob ~2.32 MB)
- Введён в commit `118b8c8`, CI fix `77736ee`

---

## История stable-коммитов (контекст)

```
549d4c3 Open Stripe Dashboard native app on mobile for Tap to Pay
e482f43 Pay: hide WhatsApp; Tap to Pay PWA fix
6c6b671 Fix back button on pay page
7a45108 Tap to Pay button on pay page
77736ee Fix admin deploy CI (pinned admin bundle)
118b8c8 Restore mobile admin (admin-index-utf8-v4.js)
7833d0d Fix pay page Stripe key from API
01a72b4 Revert admin to index-utf8-v4 v145 (до отдельного admin bundle)
```

---

## Быстрое восстановление

### Вариант A — git tag (рекомендуется)
```bash
cd C:\Projects\HTRGroupLLC
git fetch origin
git checkout main
git reset --hard stable-baseline-jun-2026
git push origin main
```
*(push только если пользователь просит задеплоить)*

### Вариант B — один коммит
```bash
git checkout 549d4c3 -- .
git checkout 549d4c3 -- assets/index-utf8-v4.js assets/admin-index-utf8-v4.js
# пересобрать только если менялся src:
# node scripts/build-pages-bundle.mjs
```

### Вариант C — только admin
```bash
git checkout 549d4c3 -- admin/index.html assets/admin-index-utf8-v4.js
```

### Вариант D — только pay/site bundle
```bash
git checkout 549d4c3 -- src/pages/pay.tsx src/App.tsx src/components/BackButton.tsx assets/index-utf8-v4.js index.html pay/index.html
```

После восстановления: commit + push → Cloudflare deploy ~2–5 мин.

---

## Защищённые зоны (минимальные правки)

- `admin/index.html`, `assets/admin-index-utf8-v4.js`
- `src/pages/admin.tsx`
- Payment flow: `src/pages/pay.tsx`, API stripe routes
- `.github/scripts/prepare-pages-deploy.sh`

---

## API / деплой

- API: `https://htr-group-llc-appliance-repair.replit.app`
- Cloudflare Pages project: `htrgrouptx`
- Deploy: push `main` → GitHub Actions → wrangler pages deploy
