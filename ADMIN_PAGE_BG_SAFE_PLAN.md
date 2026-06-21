# Безопасный план: кнопка «Фон» на Appliance Admin

> **Дата:** 2026-06-21  
> **Статус:** план (код не менять до прохождения чеклиста)  
> **Цель:** PageBgPicker на https://htrgrouptx.com/admin/ — **идентично dental**, без поломки pinned admin PWA  
> **Текущий prod:** `admin-index-utf8-v4.js?v=150` (рабочий, **без** PageBgPicker)

---

## 1. Контекст

| | Appliance admin | Dental admin |
|---|-----------------|--------------|
| Deploy | Отдельный `admin/index.html` + **pinned** `admin-index-utf8-v4.js` | SPA `/admin` в общем app |
| PageBgPicker в src | ✅ `src/pages/admin.tsx` | ✅ |
| PageBgPicker на prod | ❌ | ✅ (через site bundle / src) |
| Employee PageBgPicker | ✅ site bundle v156 | ✅ |

**localStorage:** `htr-portal-page-bg` — после успешного deploy admin цвет синхронизируется с employee.

---

## 2. Что уже ломалось (уроки)

### 2.1 Попытка d6e48b7 (откат → 11f9b38)

- Применён скрипт `scripts/_patch-admin-page-bg.mjs`
- `node --check` прошёл, но **страница не открывалась** в браузере

### 2.2 Корневая причина (проверено)

В патче строка:

```javascript
const piEnd = adm.indexOf("\nfunction ", piStart + 20);
const piBody = adm.slice(piStart, piEnd > piStart ? piEnd : piStart + 300000);
```

В текущем `admin-index-utf8-v4.js` (866 строк) после `function PI(){` **нет** `\nfunction ` → `piEnd = -1` → берётся **300 000 символов** от начала `PI()`, что **режет середину файла** и портит бандл.

### 2.3 Что НЕ делать

| ❌ Запрещено | Почему |
|-------------|--------|
| Копировать весь `index-utf8-v4.js` → `admin-index-utf8-v4.js` | Исторически ломает mobile admin PWA |
| Деплой патча без локального runtime-теста | Syntax check недостаточен |
| Менять payment/booking/auth в том же PR | Scope creep, риск поломки |
| Standalone vanilla script (если нужен parity с dental React UI) | Пользователь просил **как на dental** — React PageBgPicker |

---

## 3. Рекомендуемый путь: исправленный точечный патч

**Приоритет:** Вариант A (минимальный риск, быстрый rollback).  
**Долгосрочно:** Вариант B (отдельная admin-сборка).

### Вариант A — исправить `_patch-admin-page-bg.mjs` + staged deploy

#### Шаг A0 — зафиксировать baseline (обязательно)

```bash
cd C:\Projects\HTRGroupLLC
git checkout main
copy assets\admin-index-utf8-v4.js assets\admin-index-utf8-v4.js.v150.bak
copy admin\index.html admin\index.html.v150.bak
```

Тег или commit-message: «pre-admin-bg-v151».

#### Шаг A1 — исправить патч-скрипт

1. **Не резать `PI()` по 300KB.** Вместо этого:
   - Только **3 точечные** замены `style:{background:$0}` → `style:{background:PgBgVal}` по уникальным контекстам admin (loading screen, main shell, left panel) — grep по bundle перед заменой.
   - Или: вставить hook `[PgBgVal,PgBgSet]=PgBgUseHook($0)` один раз после `a1(),` без перезаписи всего тела `PI()`.

2. **Проверить границы модуля** — вставка только перед `const tS={ru:{schedule` (одно вхождение).

3. **Rename map** — оставить `PgBg*` префиксы (не конфликтовать с `og` interop helper).

4. **React prefix** — `O.` → `_.` в вставленном модуле (admin bundle использует `_`).

5. **Выход патча** — писать в **`assets/admin-index-utf8-v4.js.candidate`**, не перезаписывать v150 сразу.

#### Шаг A2 — автоматические проверки (локально)

```bash
node scripts/_patch-admin-page-bg.mjs   # после правки → candidate
node --check assets/admin-index-utf8-v4.js.candidate
```

Grep-критерии в **candidate**:

- [ ] `htr-portal-page-bg` присутствует
- [ ] `PgBgPicker,{value:PgBgVal` — mobile **и** desktop
- [ ] `[PgBgVal,PgBgSet]=PgBgUseHook($0)` в `function PI()`
- [ ] `HTRGroupTX Admin` — на месте
- [ ] `tabTrash` / Trash — на месте (не сломан порядок вкладок)
- [ ] Размер файла ~2.19–2.25 MiB (не обрезан, не раздут >25 MiB)

#### Шаг A3 — runtime smoke test (локально, обязательно)

1. Временно в `admin/index.html` (локально, **не push**):
   - `admin-index-utf8-v4.js.candidate?v=151-test`
2. Поднять static server из корня HTRGroupLLC:
   ```bash
   npx serve . -p 8787
   ```
3. Открыть `http://localhost:8787/admin/`:
   - [ ] Страница загружается (не белый экран)
   - [ ] Login / PIN экран или CRM (если authed)
   - [ ] Кнопка «Фон» видна (mobile 375px + desktop)
   - [ ] Выбор цвета меняет фон, сохраняется после reload
   - [ ] RU|EN, Portal, Pay, logout работают
   - [ ] Вкладки (Заявки, Календарь, Архив, Корзина) открываются

4. DevTools Console — **0 uncaught errors** при загрузке.

#### Шаг A4 — deploy (только после A3)

1. `copy candidate → assets/admin-index-utf8-v4.js`
2. `admin/index.html` → `?v=151` (JS + CSS)
3. Commit одной задачей: «Add PageBgPicker to appliance admin bundle (patched v151).»
4. Push → Cloudflare ~2–5 min
5. Prod check: https://htrgrouptx.com/admin/

#### Шаг A5 — rollback (если prod сломан)

```bash
git checkout 11f9b38 -- admin/index.html assets/admin-index-utf8-v4.js
git commit -m "Rollback appliance admin to v150 (PageBgPicker patch failed prod)."
git push origin main
```

Или из `.bak` файлов шага A0.

---

### Вариант B — отдельная Vite entry для admin (долгосрочно)

**Когда:** если Вариант A снова нестабилен на mobile PWA.

1. Добавить `admin.build.html` + entry `src/admin-main.tsx` (только admin route tree).
2. Vite config: output `admin-index-utf8-v4.js` отдельно от site bundle.
3. `build-admin-bundle.mjs` — не трогает site `index-utf8-v4.js`.
4. CI: `node --check` оба бандла.
5. Сравнить размер и hash с v150 перед deploy.

**Плюсы:** src = prod, проще поддержка.  
**Минусы:** больше работы, нужен полный regression admin PWA.

---

### Вариант C — не рекомендуется

| Подход | Вердикт |
|--------|---------|
| Standalone `admin-page-bg-picker.js` | Не parity с dental React UI |
| iframe overlay | Лишняя сложность |
| Полная замена admin bundle site-бандлом | **Запрещено** без отдельного проекта тестирования |

---

## 4. Чеклист PROJECT_RULES (перед deploy)

### Admin → Employee
- [ ] Employee `/employee` на v156 уже имеет PageBgPicker — цвет тот же key
- [ ] После admin deploy проверить employee: выбранный в admin цвет виден в employee (и наоборот)

### Admin — не ломать
- [ ] Auth PIN / FIDO не тронуты
- [ ] Trash tab порядок (после Archive) сохранён
- [ ] Calendar week view + back button работают
- [ ] Mobile PWA: `admin-manifest.json`, standalone mode

### Payment / Booking
- [ ] **Не менять** в этом PR

### Appliance ↔ Dental
- [ ] UI кнопки «Фон» совпадает с dental (Palette icon + swatch + grid presets)

---

## 5. Критерии успеха (Definition of Done)

1. https://htrgrouptx.com/admin/ открывается на **mobile и desktop**
2. Кнопка «Фон» в шапке (mobile compact + desktop с подписью «Фон»/«Bg»)
3. 8 preset-цветов, localStorage `htr-portal-page-bg`
4. Admin auth, tabs, trash, calendar — без регрессий
5. Rollback plan проверен (v150 restore < 5 min)
6. `STABLE-BASELINE.md` обновлён: admin v151 + note о PageBgPicker

---

## 6. Оценка рисков

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Белый экран admin | Средняя (было) | Candidate file + local serve + rollback |
| PWA mobile regression | Низкая–средняя | Тест на реальном телефоне после deploy |
| Конфликт имён в minified bundle | Низкая | PgBg* prefix, grep после патча |
| src ≠ prod drift | Высокая (ongoing) | Документировать в HANDOFF; путь B long-term |

---

## 7. Порядок работ для агента (когда пользователь скажет «делай»)

1. Исправить `_patch-admin-page-bg.mjs` (piBody bug + candidate output)
2. Запустить патч → candidate
3. Автопроверки (check + grep)
4. Local serve smoke test
5. **Сообщить пользователю результат локального теста**
6. Только после OK — deploy v151 + prod verify
7. Обновить HANDOFF / STABLE-BASELINE

**Не начинать deploy без успешного шага A3.**

---

## 8. Связанные файлы

| Файл | Роль |
|------|------|
| `src/components/PageBgPicker.tsx` | Эталон UI (dental = appliance src) |
| `src/lib/pageBgPreference.ts` | Presets + storage key |
| `src/hooks/use-page-bg.ts` | Hook |
| `src/pages/admin.tsx` | Уже содержит `<PageBgPicker />` |
| `assets/admin-index-utf8-v4.js` | **Live admin (v150)** — не трогать без candidate |
| `scripts/_patch-admin-page-bg.mjs` | Патч (требует fix) |
| `admin/index.html` | Cache version |
| `STABLE-BASELINE.md` | Restore instructions |

---

*План согласован с HANDOFF.md §17 и PROJECT_RULES.md §1.5. Реализация — только по команде пользователя после review плана.*
