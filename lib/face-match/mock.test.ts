import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { mockProvider } from "./mock";

const SAMPLE_HASH = createHash("sha256").update("fake-image-bytes").digest("hex");

describe("mockProvider", () => {
  it("returns matches sorted by similarity desc", async () => {
    const res = await mockProvider.match({
      photoHash: SAMPLE_HASH,
      mimeType: "image/jpeg",
      sources: ["public", "models", "sports", "archive"],
    });

    expect(res.matches.length).toBeGreaterThan(0);
    for (let i = 0; i < res.matches.length - 1; i += 1) {
      expect(res.matches[i]!.similarity).toBeGreaterThanOrEqual(res.matches[i + 1]!.similarity);
    }
  });

  it("respects requested sources", async () => {
    const res = await mockProvider.match({
      photoHash: SAMPLE_HASH,
      mimeType: "image/jpeg",
      sources: ["public"],
    });

    for (const m of res.matches) {
      expect(m.source).toBe("public");
    }
  });

  it("marks premium sources as gated with blurhash and expiresAt", async () => {
    const res = await mockProvider.match({
      photoHash: SAMPLE_HASH,
      mimeType: "image/jpeg",
      sources: ["models", "archive"],
    });

    for (const m of res.matches) {
      expect(m.gated).toBe(true);
      expect(m.blurhash).toBeDefined();
      expect(m.blurhash!.length).toBeGreaterThan(20);
      expect(m.expiresAt).toBeDefined();
      expect(new Date(m.expiresAt!).getTime()).toBeGreaterThan(Date.now());
    }
  });

  it("leaves public source matches non-gated and without blurhash", async () => {
    const res = await mockProvider.match({
      photoHash: SAMPLE_HASH,
      mimeType: "image/jpeg",
      sources: ["public"],
    });

    for (const m of res.matches) {
      expect(m.gated).toBe(false);
      expect(m.blurhash).toBeUndefined();
      expect(m.expiresAt).toBeUndefined();
    }
  });

  it("is deterministic for identical inputs", async () => {
    const a = await mockProvider.match({
      photoHash: SAMPLE_HASH,
      mimeType: "image/jpeg",
      sources: ["public"],
    });
    const b = await mockProvider.match({
      photoHash: SAMPLE_HASH,
      mimeType: "image/jpeg",
      sources: ["public"],
    });

    expect(a.matches.map((m) => m.id)).toEqual(b.matches.map((m) => m.id));
    expect(a.matches.map((m) => m.similarity)).toEqual(b.matches.map((m) => m.similarity));
  });

  it("rejects non-64-char hex photoHash", async () => {
    await expect(
      mockProvider.match({
        photoHash: "deadbeef",
        mimeType: "image/jpeg",
        sources: ["public"],
      }),
    ).rejects.toThrow(/photoHash/);
  });
});
