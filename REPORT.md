# REPORT — htrgrouptx.com (2026-06-11)

## Проверка prod СЕЙЧАС
- `https://htrgrouptx.com` — HTTP 200, `index.html` → `/assets/index-utf8-v4.js?v=9`
- `node --check` на prod и local bundle — OK
- SHA256 prod JS = local `main` (после cc0894a — footer class + cache bust)
- Playwright (desktop/mobile, SW on): `#root` ~210k, console/page errors — нет
- Cloudflare Pages deploy run #35 (cc0894a) — success

## Ошибка на prod (до 0a4f4d9)
- **Runtime:** `ReferenceError: $3 is not defined` при рендере Home (footer)
- **Причина:** в commit `1c12648` при смене порядка телефонов в минифицированном bundle в `children` попал голый `$3` вместо JSX компании:
  `children: [$3, /* ... PHONE_HREF$3 ... */]`

## Исправления
| Commit | Что |
|--------|-----|
| `0a4f4d9` | Восстановлен JSX `COMPANY_PHONE_HREF$3` / `COMPANY_PHONE_DISPLAY$3` в footer Home |
| `cc0894a` | `sw.js` cache `htr-pwa-v9`, query `?v=9` на JS, класс `htr-phone-pair--row` в footer bundle |

## Риски
- Установленное PWA могло держать старый JS в Cache Storage (`htr-pwa-v8`) — v9 сбрасывает старые кэши при activate

## Действие пользователю
Если экран всё ещё белый: закрыть вкладку/приложение PWA, открыть заново `https://htrgrouptx.com` (Ctrl+F5 на ПК). На телефоне: очистить данные сайта для htrgrouptx.com или переустановить ярлык PWA.
