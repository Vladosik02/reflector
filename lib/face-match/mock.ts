import "server-only";
import { getBlurhashForPublicAsset } from "@/lib/blur";
import type { FaceMatchProvider, Match, MatchRequest, MatchResponse, MatchSource } from "./types";

const PREMIUM_SOURCES: ReadonlySet<MatchSource> = new Set(["models", "sports", "archive"]);

const CATALOG: Array<Omit<Match, "similarity" | "expiresAt" | "blurhash" | "gated">> = [
  { id: "p-1", name: "Alex V., actor", source: "public", imageUrl: "/mock/p1.svg" },
  { id: "p-2", name: "Maria K., singer", source: "public", imageUrl: "/mock/p2.svg" },
  { id: "p-3", name: "Dmitry L., TV host", source: "public", imageUrl: "/mock/p3.svg" },
  { id: "m-1", name: "Anna P., model", source: "models", imageUrl: "/mock/m1.svg" },
  { id: "m-2", name: "Sofia R., model", source: "models", imageUrl: "/mock/m2.svg" },
  { id: "s-1", name: "Igor S., tennis", source: "sports", imageUrl: "/mock/s1.svg" },
  { id: "s-2", name: "Olga M., biathlon", source: "sports", imageUrl: "/mock/s2.svg" },
  { id: "a-1", name: "Archive, 1956", source: "archive", imageUrl: "/mock/a1.svg" },
  { id: "a-2", name: "Archive, 1923", source: "archive", imageUrl: "/mock/a2.svg" },
];

/**
 * Deterministic mock: identical bytes in → identical match order.
 * This is needed for two reasons:
 *  - Reproducible end-to-end testing of the unlock flow.
 *  - The ability to recompute matches from photoHash without storing the photo itself.
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
