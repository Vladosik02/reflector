# Reflector — дорога до прода

Живая «карта», обновляется по мере прогресса. Каждая сессия должна:

1. Прочитать раздел **«Текущее состояние»**.
2. Выбрать ближайшую невыполненную фазу из **«Этапы»**.
3. По завершении — обновить чекбоксы и раздел «Текущее состояние».

Связанные документы:

- [PLAN.md](./PLAN.md) — исходный план дизайна/архитектуры (стабилен, базовые принципы)
- [RESEARCH.md](./RESEARCH.md) — палитра, типографика, обоснование
- [README.md](./README.md) — как запустить, что внутри

---

## Текущее состояние

**Стек:** Next.js 16.2.6 (App Router + Turbopack) · React 19.2 · TypeScript 5.9 strict · Tailwind 3.4 · Prisma 6 + Postgres 17 (docker-compose) · Stripe 17 · BlurHash · ESLint 9 flat · Vitest 2 (22 tests).

**Что работает end-to-end (с mock-провайдером):**

- Лендинг + страницы legal/about/contacts/FAQ/Trust.
- Загрузка фото → `/api/match` → детерминированный mock-провайдер → JSON с `searchId`, `unlocked`, `matches: PublicMatch[]`.
- Премиум-совпадения (`models | sports | archive`) приходят с blur-плейсхолдером (BlurHash, ~30 байт). Sharp-картинка попадает в DOM только после unlock.
- `/api/unlock` → mock-checkout → `/api/webhooks/mock` → `Unlock` строка в БД (идемпотентно по `providerEventId`).
- `/unlock/success` опрашивает `/api/unlock/status` и редиректит на `/search/[id]`, где результаты уже разблокированы.
- Anonymous-cookie (HMAC-SHA256) → lazy `AnonymousSession` upsert на первом write. Ownership проверяется на всех unlock-роутах.
- Stripe-провайдер прописан (scaffold). Активируется одной переменной `PAYMENT_PROVIDER=stripe` + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`.

**Что НЕ работает (намеренно):**

- Реальное распознавание лиц — провайдер `mock`.
- Реальный платёжный провайдер — мерчант не подключён, scaffold ждёт ключей.
- Хранилище фото с TTL=24h. Сейчас фото читается в RAM на /api/match, хэшируется и не сохраняется на диск — но реального S3-flow с подписанными URL нет.
- Auth (NextAuth). Гостевая сессия покрывает pay-per-unlock; auth понадобится для подписок (Phase 5, отложено).

---

## Этапы

### Фаза 1 · Foundation (вы здесь)

- [x] Апгрейд до Next 16 + React 19 (закрыта критическая CVE-цепочка Next 14).
- [x] ESLint 9 flat config с `next/core-web-vitals` и `next/typescript`.
- [x] Prettier + `prettier-plugin-tailwindcss`.
- [x] Vitest + Testing Library (jsdom) — конфиг готов, тесты — на следующих фазах.
- [x] `next.config.mjs`: turbopack root, базовые security headers, `poweredByHeader: false`.
- [x] Зависимости: `zod` (валидация), `lucide-react` (иконки), `clsx`.
- [ ] Базовый layout-утилитарии: `lib/cn.ts`, `lib/env.ts` (с zod-валидацией ENV).
- [ ] Завести `.env.example` и описать переменные.

### Фаза 2 · Face-matching MVP (мок-провайдер)

Цель: пользователь загружает фото и видит правдоподобные результаты. Реальной модели нет, но API-контракт = «production-shaped», провайдер подменяется одной переменной.

- [ ] Интерфейс `FaceMatchProvider` в `lib/face-match/types.ts`.
- [ ] Mock-провайдер с детерминированными результатами (псевдо-знаменитости + одна «лимитированная» запись с `expiresAt = now + 24h`).
- [ ] API route `app/api/match/route.ts` (POST): multipart upload → валидация (zod) → провайдер → JSON-ответ.
- [ ] Rate limiting: in-memory + интерфейс для Redis (готовность к проду).
- [ ] Компонент `Results.tsx` с side-by-side сравнением, % схожести, бейджем «24:00:00» для лимитированных и countdown-таймером.
- [ ] Интеграция с `UploadSection` (вытаскивает `activeFilters`, отправляет на `/api/match`).
- [ ] Обработка ошибок: тоасты/inline-сообщения, ретраи.

### Фаза 2.5 · Pay-per-search-unlock (ТЕКУЩАЯ)

Продуктовый пивот, ответ на запрос пользователя: **разовая оплата фикс. прайс за разблокировку премиум-источников одной загрузки**. Логин не нужен, anonymous-сессия в cookie. Публичные результаты бесплатны, премиум (`models` / `sports` / `archive`) приходят с blur-плейсхолдером, после оплаты — sharp. Один платёж = unlock всех premium-результатов одной search-сессии.

- [x] DB: Prisma + Postgres + docker-compose. Модели `AnonymousSession`, `Search`, `Payment`, `Unlock`, `ProcessedWebhookEvent`.
- [x] Anonymous-session: подписанный HttpOnly cookie (HMAC-SHA256) + lazy upsert в БД (middleware только выдаёт cookie).
- [x] `PaymentProvider` интерфейс с реализациями: `mock` (мгновенный успех, `/unlock/mock-checkout` UI) и `stripe` (Checkout Session + webhook).
- [x] `POST /api/unlock` создаёт Checkout-сессию для конкретной search-сессии, возвращает URL.
- [x] `POST /api/webhooks/[provider]` с верификацией подписи и идемпотентностью через `ProcessedWebhookEvent` (UNIQUE eventId).
- [x] `GET /api/unlock/status?searchId=...` — для опроса с фронта.
- [x] Страницы `/unlock/mock-checkout`, `/unlock/success` (polling), `/unlock/cancel`, `/search/[id]`.
- [x] Обновление контракта: `Match.gated: boolean` + `PublicMatch` (discriminated union); `toPublicMatches(matches, isUnlocked)` применяет entitlement.
- [x] Mock-провайдер: `models | sports | archive` → `gated: true` с BlurHash в `blurhash`. `expiresAt` теперь раскрывается только после unlock.
- [x] Tamper-resistant blur preview: BlurHash через `sharp` (32×32 → DCT 4×3). Sharp-картинка попадает в DOM только после проверки entitlement на `/api/match` или `/api/search/[id]`.
- [x] UI: `BlurredPreview`, `UnlockBanner`/`MatchCard` в `Results.tsx`, статус-поллинг.
- [x] Тесты: 22 unit-теста (session, payments, mock-провайдер, rate-limit, FAQ). Webhook idempotency / unlock-service интеграционные тесты — в Phase 2.6 (требуют test-БД).
      **Завершено** (review-проход применён).

### Фаза 2.6 · Pay-per-unlock — follow-ups после review

Список зафиксирован после Wave-4 ревью (security + code + a11y + test-gap агенты). Пункты не критичны для текущего MVP (build/lint/test зелёные, известных эксплойтов нет в configuration по умолчанию), но должны быть закрыты до запуска платежей.

**Интеграционные тесты (test-gap-агент, critical):**

- [ ] Webhook idempotency: повторный event с тем же `providerEventId` → `{kind:"duplicate"}`, единственный `Unlock`.
- [ ] Concurrent webhooks для одного `searchId` → ровно один `applied`, один `duplicate`.
- [ ] Webhook без матчингого `Payment` row → `ignored` (после security-fix `no Payment row matches` ветка).
- [ ] Cross-session unlock: session A не может оплатить search session B → 404.
- [ ] Bad signature → handler не вызывается.
- [ ] `toPublicMatches`: ключи `imageUrl` / `expiresAt` отсутствуют в locked-варианте.
- [ ] Middleware: первый визит выдаёт корректную cookie, валидная не перезаписывается, tampered заменяется.
- [ ] Components/Results: locked-вариант рендерит canvas, не `<Image>`; unlocked — наоборот.

Эти тесты требуют тестовой БД (через `docker-compose up postgres -d` + `prisma migrate deploy --schema=prisma/schema.prisma`) или мокинга Prisma. Сейчас обходим: 22 unit-теста покрывают чистые модули (rate-limit, session crypto, mock-провайдеры, FAQ).

**Код-фиксы (code-review-агент, should-fix):**

- [ ] `handleWebhookEvent`: при `providerSessionId=null` искать Payment по `(searchId, status=PENDING)` — иначе Prisma пропускает поле и возвращает любой Payment этого search.
- [ ] `useUnlock(searchId)` — извлечь дублирующий handleUnlock из UploadSection и /search/[id].
- [ ] Поллинг в `/unlock/success`: AbortController на каждый fetch вместо только `cancelled`-флага.
- [ ] `app/unlock/cancel/page.tsx` — проверить, что страница действительно есть (security-агент усомнился; на самом деле есть, но добавить e2e-проверку).
- [ ] `lib/blur.ts`: LRU bounded cache (сейчас простой Map с capped FIFO — достаточно, но LRU был бы корректнее).

**A11y (a11y-агент, blocker уже закрыт):**

- [x] BlurredPreview aria-label больше не утверждает identity.
- [x] UnlockBanner обёрнут в `role="status" aria-live="polite"`.
- [x] /unlock/success имеет live region.
- [ ] Color contrast: `text-brand-warning` на `bg-brand-warning/15` ниже 4.5:1 — заменить либо текст на `text-brand-ink`, либо фон на `bg-brand-bg`.
- [ ] `prefers-reduced-motion`: Loader2 / animate-pulse / countdown — обернуть в `motion-safe:`.
- [ ] Dropzone: динамический `aria-label` после выбора файла; `aria-describedby` ↔ hint; убрать nested interactive (кнопка "Выбрать другое фото" внутри role="button").
- [ ] Error в `UploadSection` связать с input через `aria-describedby` + `aria-invalid`.
- [ ] Focus management на `router.replace('/search/[id]')` — поставить tabindex=-1 на h1 и focus().

**Security (security-агент, оставшиеся MEDIUM):**

- [x] CRITICAL: Mock webhook отключён в production.
- [x] CRITICAL: Webhook требует matching Payment row (ownership).
- [x] HIGH: Path traversal в `lib/blur.ts` закрыт через `path.relative` гард.
- [x] HIGH: Rate-limit на /api/unlock, /api/unlock/status, /api/webhooks/[provider].
- [x] HIGH: Open redirect в /unlock/mock-checkout — sanitize success/cancel URLs к relative path.
- [x] INFO→HIGH: Production-guard на default SESSION_COOKIE_SECRET.
- [ ] MEDIUM: `getClientIp` доверяет X-Forwarded-For — fallback на session id при отсутствии trusted proxy.
- [ ] MEDIUM: Rotate session id на первом успешном unlock.
- [ ] MEDIUM: Stripe raw-body integration test (когда появится мерчант).
- [ ] MEDIUM: Claim-token в `successUrl` для рекавери unlock'а после очистки cookie.

**Стоит зафиксировать в ENV:**

```
PAYMENT_PROVIDER=mock|stripe
UNLOCK_PRICE_RUB=299
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
DATABASE_URL=postgres://...
SESSION_COOKIE_SECRET=...
```

### Фаза 3 · Контент + UX-полировка

- [ ] FAQ-секция (ссылка из футера уже есть).
- [ ] Trust-секция (privacy-first сигналы: «удалим через 24 ч», «не используется для обучения»).
- [ ] Страницы: `/privacy`, `/terms`, `/photo-policy`, `/about`, `/contacts` (минимальный текст + сетка).
- [ ] 404 + общий error.tsx.
- [ ] Loading states / skeleton для результатов.
- [ ] Mobile-first ревью всех секций (сейчас явно desktop-first).
- [ ] Accessibility: `aria-*`, focus visible, prefers-reduced-motion, alt-тексты.
- [ ] Анимации (CSS-only сначала; Framer Motion только если будет острая нужда).

### Фаза 4 · Auth + Storage + DB (готовность к платным тарифам)

- [ ] NextAuth (Auth.js) v5: email + Google OAuth.
- [ ] Prisma + Postgres: модели `User`, `Search`, `Match`, `LimitedMatchView`.
- [ ] Хранилище фото: интерфейс `PhotoStorage` (local-dev, S3-compatible для прода).
- [ ] Background job для авто-удаления фото через 24 ч.
- [ ] `/dashboard`: история поисков (только для авторизованных).

### Фаза 5 · Подписки (отложено)

Основная монетизация теперь — pay-per-search-unlock (Фаза 2.5). Подписочные тарифы Pro/Max остаются в UI как опция, но техническая реализация откладывается до момента, когда понадобится «безлимит» / история / приоритетная очередь — что требует учётной записи.

- [ ] Stripe Subscriptions API. Когда — после первых платных пользователей и фидбека.
- [ ] Модель `Subscription`, миграции.
- [ ] Gating подписки: безлимит, история поисков, приоритет.
- [ ] (Опционально, требует мерчанта) ЮKassa как альтернатива для RU.

### Фаза 6 · Deploy + Observability

- [ ] `Dockerfile` (multi-stage, standalone output).
- [ ] `docker-compose.yml` для локалки (app + postgres + redis + minio).
- [ ] GitHub Actions: lint + typecheck + test + build на каждый PR.
- [ ] Sentry или альтернатива — error reporting.
- [ ] Структурированный логгер (`pino`), correlation ids в API routes.
- [ ] Health-check endpoint `/api/health`.
- [ ] OpenTelemetry hooks (Next 16 поддерживает из коробки).

### Фаза 7 · SEO / Маркетинг

- [ ] `robots.txt`, `sitemap.ts`, JSON-LD (Organization + WebSite + FAQPage).
- [ ] OG-картинка через `app/opengraph-image.tsx`.
- [ ] Мета-описания на все страницы.
- [ ] `manifest.webmanifest` + иконки (PWA-ready).

### Фаза 8 · Legal / Compliance

- [ ] Cookie-баннер (минимальный, без сторонних библиотек).
- [ ] Текст privacy под 152-ФЗ (РФ) + GDPR-совместимый.
- [ ] Согласие на обработку биометрии — явный чекбокс на upload.

---

## Внешние блокеры (требуют пользователя)

| #   | Блокер                          | Что нужно                                                                                  |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Реальный face-match API         | Лицензия / API-ключ провайдера (Face++, Microsoft Face API, или собственная модель + GPU). |
| 2   | Базы фото знаменитостей/моделей | Лицензионные соглашения с правообладателями или public-domain датасет.                     |
| 3   | Мерчант-аккаунт                 | Юр.лицо + договор с ЮKassa/Stripe.                                                         |
| 4   | Домен + хостинг                 | DNS + Vercel/Railway/собственный VPS.                                                      |
| 5   | Биометрия в РФ                  | Юридическая проработка: согласия, локализация хранения по 152-ФЗ.                          |

---

## Журнал решений

- **2026-05-13** Phase 2.5 имплементирован end-to-end с mock-провайдером. 4-волновой подход с агентами: research (4) → синтез → имплементация (я) → review (4) → fix. Критические находки security-агента закрыты сразу (forged mock webhook, payment ownership, path traversal, rate-limits, open redirect). Полная test-coverage и a11y polish — Phase 2.6.
- **2026-05-13** Продуктовый пивот: ввели Phase 2.5 — pay-per-search-unlock как основная монетизация. Подписки (Phase 5) отложены до фидбека от платящих пользователей. Логин в этой схеме не нужен, гость с anonymous-cookie может оплатить и получить unlock.

- **2026-05-13** Апгрейд Next 14.2.5 → 16.2.6, React 18 → 19. Закрыта цепочка из 25+ CVE в Next 14. ESLint 8 → 9 (flat config). Tailwind оставлен на 3.4 (миграция на 4 — отдельная задача, не блокирует прод).
- **2026-05-13** Решено: лендинг рендерится статически (`prerender`), API-роуты — динамические. Без middleware на этом этапе.
- **2026-05-13** Зафиксировано: в текущем коде проект всё ещё называется «Doppelganger». Полное переименование на «Reflector» — отложено до этапа платежей/легала, чтобы не делать его дважды.
