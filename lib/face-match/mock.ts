import "server-only";
import { getBlurhashForPublicAsset } from "@/lib/blur";
import type { FaceMatchProvider, Match, MatchRequest, MatchResponse, MatchSource } from "./types";

const PREMIUM_SOURCES: ReadonlySet<MatchSource> = new Set(["models", "sports", "archive"]);

const CATALOG: Array<Omit<Match, "similarity" | "expiresAt" | "blurhash" | "gated">> = [
  { id: "p-1", name: "Алексей В., актёр", source: "public", imageUrl: "/mock/p1.svg" },
  { id: "p-2", name: "Мария К., певица", source: "public", imageUrl: "/mock/p2.svg" },
  { id: "p-3", name: "Дмитрий Л., телеведущий", source: "public", imageUrl: "/mock/p3.svg" },
  { id: "m-1", name: "Анна П., модель", source: "models", imageUrl: "/mock/m1.svg" },
  { id: "m-2", name: "София Р., модель", source: "models", imageUrl: "/mock/m2.svg" },
  { id: "s-1", name: "Игорь С., теннис", source: "sports", imageUrl: "/mock/s1.svg" },
  { id: "s-2", name: "Ольга М., биатлон", source: "sports", imageUrl: "/mock/s2.svg" },
  { id: "a-1", name: "Архив, 1956", source: "archive", imageUrl: "/mock/a1.svg" },
  { id: "a-2", name: "Архив, 1923", source: "archive", imageUrl: "/mock/a2.svg" },
];

/**
 * Детерминированный мок: одинаковые байты на входе → одинаковый порядок матчей.
 * Это нужно для двух вещей:
 *  - Воспроизводимое end-to-end тестирование unlock-флоу.
 *  - Возможность пересчитать матчи из photoHash, не храня само фото.
 */
export const mockProvider: FaceMatchProvider = {
  name: "mock",
  async match(request: MatchRequest): Promise<MatchResponse> {
    const seed = Buffer.from(request.photoHash, "hex");
    if (seed.length !== 32) {
      throw new Error("mockProvider: photoHash must be a 64-char hex sha256");
    }
    const allowed = new Set<MatchSource>(request.sources);

    const ranked = CATALOG.filter((m) => allowed.has(m.source))
      .map((m, idx) => {
        const seedByte = seed[idx % seed.length] ?? 0;
        const jitter = seedByte / 255;
        const similarity = clamp(0.55 + jitter * 0.4, 0.5, 0.96);
        return { ...m, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity);

    const top = ranked.slice(0, 6);

    const matches: Match[] = await Promise.all(
      top.map(async (m) => {
        const gated = PREMIUM_SOURCES.has(m.source);
        const base: Match = {
          ...m,
          gated,
        };
        if (gated) {
          base.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          base.blurhash = await getBlurhashForPublicAsset(m.imageUrl);
        }
        return base;
      }),
    );

    return {
      matches,
      retentionSeconds: 24 * 60 * 60,
    };
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
