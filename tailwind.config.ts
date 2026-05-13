import type { Config } from "tailwindcss";

/**
 * Дизайн-токены проекта.
 * Все цвета — единая точка правды. Дизайнер меняет здесь — обновляется везде.
 * Гамма выбрана светлой и тёплой (ориентир — Linear + Anthropic + Stripe).
 * См. RESEARCH.md для обоснования.
 *
 * Тени строятся как многослойные:
 *   — внутренний highlight сверху (имитация стекла / премиум-пластика),
 *   — короткая контактная тень (1px) для отрыва от фона,
 *   — длинная мягкая (24–40px) для атмосферной глубины.
 * Это даёт «глубину», не теряя светлый off-white характер.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FAFAF7", // тёплый off-white фон страницы
          surface: "#FFFFFF", // фон карточек и поверхностей
          ink: "#0A0A0A", // основной тёмный текст
          muted: "#4D4D48", // вторичный текст
          subtle: "#8A8A82", // подсказки, метки
          line: "#E7E6E1", // тонкие границы
          accent: "#5B5BD6", // основной акцент (приглушённый violet)
          "accent-hover": "#4848C7",
          "accent-soft": "#EEEEFB", // мягкая подложка под accent (для glow)
          success: "#1B7A4F", // featured / popular tag
          warning: "#B5651D", // янтарь — лимитированные источники
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "600" }],
        headline: ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
        title: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      maxWidth: {
        site: "1200px",
      },
      borderRadius: {
        card: "16px",
        btn: "10px",
      },
      boxShadow: {
        /* Базовая карточка: едва уловимый отрыв от фона + длинная мягкая тень. */
        card: [
          "0 1px 0 rgba(255,255,255,0.7) inset",
          "0 1px 2px rgba(10,10,10,0.04)",
          "0 12px 32px -12px rgba(10,10,10,0.08)",
        ].join(", "),
        /* «Поднятая» карточка для hover/featured. */
        lift: [
          "0 1px 0 rgba(255,255,255,0.8) inset",
          "0 1px 2px rgba(10,10,10,0.06)",
          "0 18px 40px -16px rgba(10,10,10,0.16)",
          "0 32px 64px -32px rgba(10,10,10,0.12)",
        ].join(", "),
        /* CTA-кнопка: highlight сверху + плотная контактная тень. */
        cta: [
          "0 1px 0 rgba(255,255,255,0.18) inset",
          "0 1px 2px rgba(10,10,10,0.18)",
          "0 8px 20px -8px rgba(10,10,10,0.35)",
        ].join(", "),
        "cta-hover": [
          "0 1px 0 rgba(255,255,255,0.22) inset",
          "0 2px 4px rgba(10,10,10,0.22)",
          "0 14px 28px -10px rgba(91,91,214,0.45)",
        ].join(", "),
        /* Тёмная featured-карточка (Pricing Pro). */
        "ink-lift": [
          "0 1px 0 rgba(255,255,255,0.08) inset",
          "0 2px 4px rgba(10,10,10,0.18)",
          "0 24px 56px -20px rgba(10,10,10,0.45)",
        ].join(", "),
        /* Inset-окантовка: имитация тонкой внутренней линии для премиум-края. */
        "inset-line": "0 0 0 1px rgba(10,10,10,0.04) inset",
        /* Glow вокруг видео/featured (тёплый, не «голливудский»). */
        glow: "0 40px 80px -40px rgba(91,91,214,0.25), 0 20px 40px -20px rgba(10,10,10,0.08)",
        /* Sticky-header при скролле. */
        header: "0 1px 0 rgba(10,10,10,0.04), 0 8px 24px -16px rgba(10,10,10,0.08)",
      },
      backgroundImage: {
        /* Тёплый радиальный spotlight для hero — центр чуть светлее фона. */
        "hero-spotlight":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.9), rgba(250,250,247,0) 70%)",
        /* Decorative orb под featured/hero — едва уловимый violet glow. */
        "orb-violet":
          "radial-gradient(circle at center, rgba(91,91,214,0.18), rgba(91,91,214,0) 70%)",
        "orb-warm":
          "radial-gradient(circle at center, rgba(181,101,29,0.12), rgba(181,101,29,0) 70%)",
        /* Mesh-gradient для featured pricing card — едва живой violet оттенок. */
        "ink-mesh":
          "radial-gradient(ellipse 100% 80% at 0% 0%, rgba(91,91,214,0.35), rgba(10,10,10,0) 60%), radial-gradient(ellipse 80% 60% at 100% 100%, rgba(91,91,214,0.18), rgba(10,10,10,0) 55%)",
        /* CTA-кнопка с тонким верхним highlight'ом и нижним углублением. */
        "ink-cta":
          "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
        "accent-cta":
          "linear-gradient(180deg, #6868dd 0%, #4848C7 100%)",
        /* Soft divider — горизонтальный мягкий fade для разделения секций. */
        "soft-divider":
          "linear-gradient(90deg, transparent 0%, rgba(10,10,10,0.08) 20%, rgba(10,10,10,0.08) 80%, transparent 100%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "subtle-pulse": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "subtle-pulse": "subtle-pulse 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
