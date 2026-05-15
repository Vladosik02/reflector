/**
 * Единая точка правды для текстов и тарифов.
 * Меняется здесь — обновляется на странице.
 */
import type { MatchSource } from "@/lib/face-match";

export const brandName = "Reflector";

export const nav = [
  { label: "Pricing", href: "#tariffs" },
  { label: "How it works", href: "#how" },
  { label: "Upload photo", href: "#upload" },
];

/**
 * Hero-заголовок разбит на части, чтобы можно было покрасить
 * ключевое слово в голубой акцент (brand.info) — паттерн nakrutochka:
 * один акцентный токен в заголовке, остальной текст белый.
 */
export const hero = {
  badge: "AI · Face Recognition · 2026",
  titleParts: [
    { text: "Find your ", accent: false },
    { text: "lookalike", accent: true },
    { text: " in 10 seconds", accent: false },
  ] as ReadonlyArray<{ text: string; accent: boolean }>,
  /** Плоский title для метаданных / fallback. */
  title: "Find your lookalike in 10 seconds",
  subtitle:
    "Upload one photo — and our algorithm will show you who out of millions of known and unknown people you look most like. Including unique databases available only to our subscribers.",
  primaryCta: "Upload photo",
  secondaryCta: "How it works",
};

/**
 * Три шага «как это работает» — для отдельной секции на главной.
 */
export const howItWorks = {
  eyebrow: "How it works",
  title: "Three steps to results",
  subtitle:
    "No accounts, no subscriptions. Upload a photo — get matches. One payment unlocks the premium sources for that session.",
  steps: [
    {
      number: "1",
      title: "Upload a photo",
      description:
        "JPG, PNG, or WEBP up to 15 MB. The photo is processed locally and deleted after 24 hours.",
    },
    {
      number: "2",
      title: "Algorithm finds matches",
      description:
        "A neural network compares your facial features with millions of faces in our public and premium databases.",
    },
    {
      number: "3",
      title: "Unlock premium results",
      description:
        "A single one-time payment reveals every blurred match from this session. No subscription required.",
    },
  ],
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
    period: "forever",
    description: "Basic search across the open public database.",
    features: [
      "Up to 3 searches per day",
      "Top 3 matches",
      "Public celebrity database",
      "Photos deleted after 24 hours",
    ],
    cta: "Start for free",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "490 ₽",
    period: "per month",
    description: "For those who want more accuracy and more attempts.",
    features: [
      "Unlimited searches",
      "Top 10 matches",
      "Detailed facial-feature breakdown",
      "Search history",
      "No ads",
    ],
    cta: "Get Pro",
    featured: true,
  },
  {
    id: "max",
    name: "Max",
    price: "1 290 ₽",
    period: "per month",
    description:
      "Access to unique databases — models, athletes, historical archives. Some matches are only visible for 24 hours.",
    features: [
      "Everything in Pro",
      "Unique sources (models, athletes, archives)",
      "Limited matches — 24-hour access",
      "Priority processing",
      "Personal manager",
    ],
    cta: "Get Max",
    featured: false,
  },
] as const;

export const upload = {
  title: "Upload a photo and start the search",
  mobileTitle: "Upload photo",
  description:
    "Drag an image into the window or click to choose a file. Photos are processed locally and deleted automatically within 24 hours.",
  dropzoneLabel: "Drag photo here",
  dropzoneHint: "or click to choose a file · JPG, PNG, WEBP · up to 15 MB",
  filters: [
    { id: "public", label: "Public database" },
    { id: "models", label: "Models" },
    { id: "sports", label: "Athletes" },
    { id: "archive", label: "Historical archives" },
  ] satisfies ReadonlyArray<{ id: MatchSource; label: string }>,
};

export const footerLinks = {
  product: [{ label: "Pricing", href: "#tariffs" }],
  company: [
    { label: "About", href: "/about" },
    { label: "Contacts", href: "/contacts" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Photo Policy", href: "/photo-policy" },
  ],
};
