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

**Стек:** Next.js 16.2.6 (App Router + Turbopack) · React 19.2 · TypeScript 5.9 strict · Tailwind 3.4 · ESLint 9 (flat config) · Vitest 2 · Prettier 3.

**Что работает:**

- Скелет лендинга: Header → Hero → HowItWorks → Pricing → UploadSection → Footer.
- Загрузка фото на клиенте (drag&drop, валидация типа/размера, превью).
- `npm run dev | build | start | lint | typecheck | test | format` — все зелёные.

**Что НЕ работает (намеренно):**

- Реальное распознавание лиц. UploadSection после валидации файла НЕ отправляет его никуда.
- Базы знаменитостей / моделей / архивов. В коде нет ни одного фактического совпадения.
- Авторизация, БД, платежи, хранилище фото — отсутствуют.

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

### Фаза 5 · Платежи (scaffolding)

- [ ] Stripe Checkout + webhook handler. Цены — env-driven (price ids).
- [ ] Модель `Subscription`, миграции.
- [ ] Gating: фильтр «модели/спорт/архивы» доступен только Pro+, лимитированные — только Max.
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

- **2026-05-13** Апгрейд Next 14.2.5 → 16.2.6, React 18 → 19. Закрыта цепочка из 25+ CVE в Next 14. ESLint 8 → 9 (flat config). Tailwind оставлен на 3.4 (миграция на 4 — отдельная задача, не блокирует прод).
- **2026-05-13** Решено: лендинг рендерится статически (`prerender`), API-роуты — динамические. Без middleware на этом этапе.
- **2026-05-13** Зафиксировано: в текущем коде проект всё ещё называется «Doppelganger». Полное переименование на «Reflector» — отложено до этапа платежей/легала, чтобы не делать его дважды.
