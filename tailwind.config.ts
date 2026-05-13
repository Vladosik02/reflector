import type { Config } from "tailwindcss";

/**
 * Дизайн-токены проекта.
 * Все цвета — единая точка правды. Дизайнер меняет здесь — обновляется везде.
 * Гамма выбрана светлой и тёплой (ориентир — Linear + Anthropic + Stripe).
 * См. RESEARCH.md для обоснования.
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
          success: "#1B7A4F", // featured / popular tag
          warning: "#B5651D", // янтарь — лимитированные источники
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Премиальные тайтлы
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
        card: "0 1px 2px rgba(10,10,10,.04), 0 8px 24px rgba(10,10,10,.04)",
        cta: "0 1px 0 rgba(255,255,255,.2) inset, 0 1px 2px rgba(10,10,10,.08)",
      },
    },
  },
  plugins: [],
};

export default config;
