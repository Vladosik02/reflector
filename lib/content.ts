/**
 * Единая точка правды для текстов и тарифов.
 * Меняется здесь — обновляется на странице.
 */
import type { MatchSource } from "@/lib/face-match";

export const brandName = "Reflector";

export const nav = [
  { label: "Тарифы", href: "#tariffs" },
  { label: "Загрузить фото", href: "#upload" },
];

export const hero = {
  badge: "AI · Распознавание лиц · 2026",
  title: "Найдите своего двойника за 10 секунд",
  subtitle:
    "Загрузите одно фото — и алгоритм покажет, на кого из миллионов известных и неизвестных людей вы похожи больше всего. Включая уникальные базы, доступные только нашим подписчикам.",
  primaryCta: "Загрузить фото",
};

/**
 * Тарифы.
 * `featured: true` — карточка визуально выделяется в Pricing-секции.
 */
export const plans = [
  {
    id: "free",
    name: "Free",
    price: "0 ₽",
    period: "навсегда",
    description: "Базовый поиск по открытой публичной базе.",
    features: [
      "До 3 анализов в день",
      "Топ-3 совпадения",
      "Публичная база знаменитостей",
      "Фото удаляются через 24 часа",
    ],
    cta: "Начать бесплатно",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "490 ₽",
    period: "в месяц",
    description: "Для тех, кому интересна точность и больше попыток.",
    features: [
      "Безлимит анализов",
      "Топ-10 совпадений",
      "Детальный разбор по чертам лица",
      "История поисков",
      "Без рекламы",
    ],
    cta: "Оформить Pro",
    featured: true,
  },
  {
    id: "max",
    name: "Max",
    price: "1 290 ₽",
    period: "в месяц",
    description:
      "Доступ к уникальным базам — модели, спортсмены, исторические архивы. Часть совпадений показывается только 24 часа.",
    features: [
      "Всё из Pro",
      "Уникальные источники (модели, спорт, архивы)",
      "Лимитированные совпадения — доступ 24 часа",
      "Приоритетная обработка",
      "Личный менеджер",
    ],
    cta: "Оформить Max",
    featured: false,
  },
] as const;

export const upload = {
  title: "Загрузите фото и начните поиск",
  description:
    "Перетащите изображение в окно или нажмите, чтобы выбрать файл. Фото обрабатывается локально и удаляется автоматически в течение 24 часов.",
  dropzoneLabel: "Перетащите фото сюда",
  dropzoneHint: "или нажмите, чтобы выбрать файл · JPG, PNG, WEBP · до 15 МБ",
  filters: [
    { id: "public", label: "Публичная база" },
    { id: "models", label: "Модели" },
    { id: "sports", label: "Спортсмены" },
    { id: "archive", label: "Исторические архивы" },
  ] satisfies ReadonlyArray<{ id: MatchSource; label: string }>,
};

export const footerLinks = {
  product: [{ label: "Тарифы", href: "#tariffs" }],
  company: [
    { label: "О нас", href: "/about" },
    { label: "Контакты", href: "/contacts" },
  ],
  legal: [
    { label: "Политика конфиденциальности", href: "/privacy" },
    { label: "Условия использования", href: "/terms" },
    { label: "Обработка фото", href: "/photo-policy" },
  ],
};
