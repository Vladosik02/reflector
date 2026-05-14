import type { Config } from "tailwindcss";

/**
 * Дизайн-токены проекта.
 * Все цвета — единая точка правды. Дизайнер меняет здесь — обновляется везде.
 * Тёмная фиолетово-синяя палитра (ориентир — nakrutochka.com стиль:
 * deep navy фон + фиолетовые CTA + голубые акценты в заголовках).
 *
 * Тени строятся как многослойные:
 *   — внутренний highlight сверху (слабый, ~0.04, иначе грубо на тёмном фоне);
 *   — короткая контактная тень (1px) для отрыва от фона;
 *   — длинная мягкая (24–40px) для атмосферной глубины;
 *   — отдельные glow-shadow для фиолетового свечения вокруг CTA.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0B1124", // тёмный navy — фон страницы
          surface: "#131A2E", // карточки (1-я ступень)
          elevated: "#1A2238", // карточки выделенные / hover-fill
          ink: "#FFFFFF", // основной текст
          muted: "#A3B0C7", // вторичный текст
          subtle: "#6B7894", // подсказки, метки
          line: "rgba(255,255,255,0.08)", // тонкие границы
          "line-strong": "rgba(255,255,255,0.14)",
          accent: "#8B5CF6", // violet — primary CTA
          "accent-hover": "#7C3AED",
          "accent-soft": "rgba(139,92,246,0.15)", // soft fill для outline-кнопок
          "accent-glow": "rgba(139,92,246,0.40)", // для shadow/glow
          info: "#5A8FFF", // голубой акцент для линков и выделений в заголовках
          success: "#22C55E", // чекмарки, успех
          warning: "#F59E0B", // янтарь — лимитированные совпадения (countdown)
          danger: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" }],
        headline: ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        title: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      maxWidth: {
        site: "1200px",
      },
      borderRadius: {
        card: "24px",
        btn: "12px",
        pill: "999px",
      },
      boxShadow: {
        /* Базовая карточка на тёмном фоне. */
        card: [
          "0 1px 0 rgba(255,255,255,0.04) inset",
          "0 1px 2px rgba(0,0,0,0.4)",
          "0 16px 32px -16px rgba(0,0,0,0.55)",
        ].join(", "),
        /* «Поднятая» карточка для hover/featured. */
        lift: [
          "0 1px 0 rgba(255,255,255,0.06) inset",
          "0 1px 2px rgba(0,0,0,0.4)",
          "0 16px 32px -16px rgba(0,0,0,0.55)",
          "0 32px 64px -32px rgba(0,0,0,0.6)",
        ].join(", "),
        /* Фиолетовая CTA с подложкой violet glow. */
        cta: [
          "0 1px 0 rgba(255,255,255,0.2) inset",
          "0 8px 24px -8px rgba(139,92,246,0.55)",
          "0 1px 2px rgba(0,0,0,0.3)",
        ].join(", "),
        "cta-hover": [
          "0 1px 0 rgba(255,255,255,0.25) inset",
          "0 14px 32px -10px rgba(139,92,246,0.75)",
        ].join(", "),
        /* Тёмная featured-карточка (Pricing Pro). */
        "ink-lift": [
          "0 1px 0 rgba(255,255,255,0.08) inset",
          "0 2px 4px rgba(0,0,0,0.3)",
          "0 24px 56px -20px rgba(0,0,0,0.5)",
        ].join(", "),
        /* Inset-окантовка: имитация тонкой внутренней линии. */
        "inset-line": "0 0 0 1px rgba(255,255,255,0.06) inset",
        /* Violet glow вокруг focus-visible / featured. */
        "glow-violet":
          "0 0 0 1px rgba(139,92,246,0.4), 0 24px 56px -20px rgba(139,92,246,0.55)",
        glow: "0 0 0 1px rgba(139,92,246,0.4), 0 24px 56px -20px rgba(139,92,246,0.55)",
        /* Sticky-header при скролле. */
        header: "0 1px 0 rgba(255,255,255,0.04), 0 8px 24px -16px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        /* Hero aurora — фиолетовый + синий glow над navy фоном. */
        "hero-aurora":
          "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(139,92,246,0.22), rgba(11,17,36,0) 60%), radial-gradient(ellipse 60% 50% at 80% 10%, rgba(90,143,255,0.16), rgba(11,17,36,0) 60%)",
        /* Hero spotlight — устаревшее имя, оставлено для совместимости. */
        "hero-spotlight":
          "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(139,92,246,0.22), rgba(11,17,36,0) 60%), radial-gradient(ellipse 60% 50% at 80% 10%, rgba(90,143,255,0.16), rgba(11,17,36,0) 60%)",
        /* Decorative orb под featured/hero — фиолетовый glow. */
        "orb-violet":
          "radial-gradient(circle at center, rgba(139,92,246,0.4), rgba(139,92,246,0) 70%)",
        "orb-info":
          "radial-gradient(circle at center, rgba(90,143,255,0.3), rgba(90,143,255,0) 70%)",
        "orb-warm":
          "radial-gradient(circle at center, rgba(245,158,11,0.18), rgba(245,158,11,0) 70%)",
        /* Surface mesh для featured pricing card — фиолетово-синие подсветки. */
        "surface-mesh":
          "radial-gradient(ellipse 100% 80% at 0% 0%, rgba(139,92,246,0.35), rgba(11,17,36,0) 60%), radial-gradient(ellipse 80% 60% at 100% 100%, rgba(90,143,255,0.22), rgba(11,17,36,0) 55%)",
        "ink-mesh":
          "radial-gradient(ellipse 100% 80% at 0% 0%, rgba(139,92,246,0.35), rgba(11,17,36,0) 60%), radial-gradient(ellipse 80% 60% at 100% 100%, rgba(90,143,255,0.22), rgba(11,17,36,0) 55%)",
        /* Основная фиолетовая CTA-кнопка (gradient violet). */
        "cta-violet": "linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)",
        "cta-violet-hover": "linear-gradient(180deg, #B89CFB 0%, #8B5CF6 100%)",
        /* Старые имена — оставлены для обратной совместимости в коде. */
        "ink-cta": "linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)",
        "accent-cta": "linear-gradient(180deg, #B89CFB 0%, #8B5CF6 100%)",
        /* Soft divider — горизонтальный мягкий fade. */
        "soft-divider":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.12) 80%, transparent 100%)",
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
