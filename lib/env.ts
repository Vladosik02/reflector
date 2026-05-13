import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FACE_MATCH_PROVIDER: z.enum(["mock"]).default("mock"),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(10),

  PAYMENT_PROVIDER: z.enum(["mock", "stripe"]).default("mock"),
  UNLOCK_PRICE_MINOR: z.coerce.number().int().positive().default(29900),
  UNLOCK_CURRENCY: z.string().min(3).max(8).default("rub"),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  SESSION_COOKIE_SECRET: z
    .string()
    .min(32, "SESSION_COOKIE_SECRET must be at least 32 characters")
    .default("DEV-INSECURE-COOKIE-SECRET-DO-NOT-USE-IN-PRODUCTION-PLEASE-REPLACE-ME"),

  DATABASE_URL: z
    .string()
    .url()
    .default("postgresql://reflector:reflector_dev@localhost:5432/reflector?schema=public"),

  /**
   * Доверять X-Forwarded-For / X-Real-IP для определения клиентского IP.
   * Включать ТОЛЬКО за известным reverse-proxy (Vercel, Cloudflare, nginx).
   * В local dev — false, иначе клиент сам подделывает заголовок и обходит rate-limit.
   */
  TRUST_PROXY_HEADERS: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

const parsedServer = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  FACE_MATCH_PROVIDER: process.env.FACE_MATCH_PROVIDER,
  RATE_LIMIT_PER_MINUTE: process.env.RATE_LIMIT_PER_MINUTE,
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
  UNLOCK_PRICE_MINOR: process.env.UNLOCK_PRICE_MINOR,
  UNLOCK_CURRENCY: process.env.UNLOCK_CURRENCY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  SESSION_COOKIE_SECRET: process.env.SESSION_COOKIE_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  TRUST_PROXY_HEADERS: process.env.TRUST_PROXY_HEADERS,
});

const parsedPublic = publicSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsedServer.success) {
  console.error("Invalid server environment variables:", parsedServer.error.flatten());
  throw new Error("Invalid server environment variables");
}
if (!parsedPublic.success) {
  console.error("Invalid public environment variables:", parsedPublic.error.flatten());
  throw new Error("Invalid public environment variables");
}

export const env = {
  ...parsedServer.data,
  ...parsedPublic.data,
};

if (env.PAYMENT_PROVIDER === "stripe" && (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET)) {
  throw new Error("PAYMENT_PROVIDER=stripe requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET");
}

// Production-only гарды. Пропускаются на этапе сборки (NEXT_PHASE=phase-production-build),
// потому что build пре-рендерит страницы, импортирует env и не должен падать из-за того,
// что фактический деплой ещё не сконфигурирован.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
if (env.NODE_ENV === "production" && !isBuildPhase) {
  if (env.PAYMENT_PROVIDER === "mock") {
    throw new Error(
      "PAYMENT_PROVIDER=mock is forbidden in production. Set PAYMENT_PROVIDER=stripe and configure STRIPE_* env vars.",
    );
  }
  if (env.SESSION_COOKIE_SECRET.includes("DEV-INSECURE")) {
    throw new Error(
      "Production refuses the default SESSION_COOKIE_SECRET. Generate a real one: `openssl rand -base64 32`.",
    );
  }
}
