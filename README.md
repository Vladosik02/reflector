# Reflector

Сервис поиска двойников по фото с монетизацией **pay-per-search-unlock**: загружаешь фото →
получаешь топ совпадений из публичной базы бесплатно → премиум-источники (модели, спортсмены,
исторические архивы) приходят с blur'ом → один платёж (фикс. цена) разблокирует все
премиум-результаты конкретного поиска. Без подписки и без аккаунта.

**Стек:** Next.js 16 (App Router · Turbopack) · React 19 · TypeScript 5.9 strict · Tailwind 3.4 ·
Prisma 6 + Postgres 17 · Stripe 17 (scaffold) · BlurHash · Vitest 2 · ESLint 9 flat · Prettier 3.

> Текущая стадия — Phase 2.5 (см. [ROADMAP.md](./ROADMAP.md)). Mock-провайдер face-matching и
> mock-провайдер платежей работают end-to-end. Stripe прописан как scaffold — активируется
> переменной `PAYMENT_PROVIDER=stripe` + ключами. Реального face-matching и реального мерчанта
> на момент написания нет.

---

## Локальный запуск

```bash
# 1. Поднять Postgres + Redis в docker-compose
docker-compose up -d postgres

# 2. Установить зависимости + сгенерировать Prisma Client
npm install

# 3. Создать схему БД (без миграций — db push достаточно для разработки)
npx prisma db push

# 4. Скопировать .env.example в .env и заполнить SESSION_COOKIE_SECRET
cp .env.example .env
openssl rand -base64 32   # → вставить в SESSION_COOKIE_SECRET

# 5. Запустить
npm run dev
```

Открыть `http://localhost:3000`. По умолчанию `PAYMENT_PROVIDER=mock` —
`/unlock/mock-checkout` имитирует Stripe Checkout локально, реальных списаний нет.

## Скрипты

| Скрипт                 | Что делает                                           |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Dev-сервер с hot reload                              |
| `npm run build`        | Production-сборка (standalone, для Vercel/Docker)    |
| `npm run build:static` | Static export для GitHub Pages (см. ниже)            |
| `npm run start`        | Запуск собранной версии                              |
| `npm run lint`         | ESLint flat config                                   |
| `npm run typecheck`    | TypeScript strict без emit                           |
| `npm test`             | Vitest (jsdom)                                       |
| `npm run format`       | Prettier write                                       |
| `npm run db:push`      | Sync Prisma schema → Postgres (для dev)              |
| `npm run db:migrate`   | `prisma migrate dev` (для production-grade миграций) |
| `npm run db:studio`    | Prisma Studio                                        |

---

## Деплой

### Вариант 1 · Vercel / Railway / собственный VPS (full feature)

Это правильный путь для prod: middleware, API-роуты, webhook'и, БД работают полноценно.

- **Vercel:** `vercel link → vercel env add → vercel deploy`. Подключите Postgres (Vercel
  Postgres / Neon / Supabase) → положите `DATABASE_URL` в env. Для платежей подключите
  Stripe-аккаунт и положите `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. После первого
  деплоя — зайдите в Stripe Dashboard и направьте webhook на `/api/webhooks/stripe`.
- **Railway / Render / Fly:** есть `Dockerfile` (multi-stage, standalone, non-root). Поднимите
  managed Postgres рядом и положите DSN в env.
- **Свой VPS:** `docker build -t reflector . && docker run -p 3000:3000 --env-file .env reflector`.

Минимальный набор env-переменных (см. полный список в `.env.example`):

```
DATABASE_URL=postgresql://...
SESSION_COOKIE_SECRET=<openssl rand -base64 32>
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
UNLOCK_PRICE_MINOR=29900
UNLOCK_CURRENCY=rub
NEXT_PUBLIC_SITE_URL=https://your-domain.tld
```

### Вариант 2 · GitHub Pages (только preview)

GitHub Pages — статический хостинг. **Backend Reflector'а (API, middleware, webhook'и, БД)
здесь работать не может**. Workflow `.github/workflows/gh-pages.yml` собирает урезанную версию
для маркетингового превью:

- Что попадает в GH Pages: `/`, `/about`, `/contacts`, `/privacy`, `/terms`, `/photo-policy`,
  FAQ, Trust, Pricing, Hero, Header/Footer, robots/sitemap.
- Что вырезается перед сборкой (`scripts/prepare-static.mjs`): `app/api/**`, `middleware.ts`,
  `app/opengraph-image.tsx`, `app/search/**`, `app/unlock/**`.
- UploadSection в preview-режиме показывает баннер: «backend нужен для живой версии».

**Как подключить:**

1. Settings → Pages → Source: «GitHub Actions».
2. Push в `main` (или запустите workflow вручную через Actions → «GitHub Pages (static preview)»).
3. URL появится в Settings → Pages: обычно `https://<user>.github.io/<repo>/`.

Если хотите кастомный домен — добавьте `public/CNAME` с доменом, в DNS поставьте CNAME-запись
на `<user>.github.io`, и установите `NEXT_BASE_PATH=""` в workflow (override на корневой деплой).

---

## Структура

```
app/
  page.tsx                 # лендинг
  layout.tsx               # глобальный layout, JSON-LD, шрифт
  globals.css
  api/
    match/route.ts         # POST: загрузка фото → матчи
    search/[id]/route.ts   # GET: re-fetch результатов с текущим entitlement
    unlock/route.ts        # POST: начать Checkout
    unlock/status/route.ts # GET: poll для success-page
    webhooks/[provider]/route.ts  # POST: webhook (Stripe / mock), идемпотентный
  search/[id]/             # страница результатов после unlock
  unlock/                  # success, cancel, mock-checkout
  about, contacts, privacy, terms, photo-policy
  not-found.tsx, error.tsx, loading.tsx
  opengraph-image.tsx, robots.ts, sitemap.ts
components/
  Header, Hero, HowItWorks, Pricing, UploadSection, Trust, FAQ, Footer
  Results.tsx, BlurredPreview.tsx, PageShell.tsx
lib/
  content.ts               # вся копирайт-правда
  cn.ts, env.ts, rate-limit.ts
  db.ts                    # Prisma singleton
  session.ts               # HMAC-подписанный anonymous-cookie
  blur.ts                  # BlurHash через sharp
  unlock-service.ts        # бизнес-логика checkout + webhook
  face-match/              # FaceMatchProvider interface + mock
  payments/                # PaymentProvider interface + mock + stripe
prisma/
  schema.prisma            # AnonymousSession, Search, Payment, Unlock, ProcessedWebhookEvent
middleware.ts              # выдача rfl_sid cookie на первом визите
scripts/
  prepare-static.mjs       # подготовка дерева к static export (CI only)
```

## Документы

- [ROADMAP.md](./ROADMAP.md) — фазы реализации, чекбоксы, журнал решений, внешние блокеры.
- [PLAN.md](./PLAN.md) — исходный план архитектуры.
- [RESEARCH.md](./RESEARCH.md) — дизайн-исследование, палитра, типографика.
