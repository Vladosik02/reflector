import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: [] },
};

/**
 * Полноценная сборка для прода (Vercel / Railway / своя инфра). Включает API-роуты,
 * middleware, dynamic routes, security headers, standalone output для Docker.
 */
const serverConfig = {
  ...baseConfig,
  output: "standalone",
  turbopack: { root: __dirname },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

/**
 * Статический экспорт для GitHub Pages.
 *  - API/middleware/dynamic routes должны быть удалены `scripts/prepare-static.mjs`
 *    перед `next build`, иначе Next откажется собираться.
 *  - `trailingSlash` обязателен для GH Pages: URL-ы `/about` обслуживаются как `/about/index.html`.
 *  - `images.unoptimized` потому что Image Optimization API сервера нет.
 *  - `basePath` нужен для project-pages (`<user>.github.io/<repo>`). Для custom-домена — пусто.
 */
const exportConfig = {
  ...baseConfig,
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { ...baseConfig.images, unoptimized: true },
};

export default isStaticExport ? exportConfig : serverConfig;
