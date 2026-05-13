#!/usr/bin/env node
/**
 * Готовит дерево к статическому экспорту для GitHub Pages.
 *
 * Что удаляем (Next.js `output: "export"` не поддерживает):
 *   - app/api/**          — route handlers (API).
 *   - middleware.ts       — runtime middleware.
 *   - app/opengraph-image — динамическая OG-генерация через Edge runtime.
 *   - app/search/**       — динамическая страница, зависит от /api.
 *   - app/unlock/**       — pay-per-unlock флоу, целиком зависит от backend.
 *
 * Логика выполняется ТОЛЬКО на CI runner'е (не трогает локальную рабочую копию).
 * Workflow вызывает скрипт после checkout и до `next build`.
 */
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const REMOVE = ["app/api", "middleware.ts", "app/opengraph-image.tsx", "app/search", "app/unlock"];

async function main() {
  console.log("[prepare-static] removing server-only paths for static export");
  for (const rel of REMOVE) {
    const abs = path.join(repoRoot, rel);
    await rm(abs, { recursive: true, force: true });
    console.log(`  · ${rel}`);
  }
  console.log("[prepare-static] done");
}

main().catch((err) => {
  console.error("[prepare-static] failed:", err);
  process.exit(1);
});
