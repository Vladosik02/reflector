import { describe, expect, it } from "vitest";
import { mockProvider } from "./mock";

const SAMPLE = Buffer.from("fake-image-bytes", "utf8");

describe("mockProvider", () => {
  it("returns matches sorted by similarity desc", async () => {
    const res = await mockProvider.match({
      photo: SAMPLE,
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
      photo: SAMPLE,
      mimeType: "image/jpeg",
      sources: ["public"],
    });

    for (const m of res.matches) {
      expect(m.source).toBe("public");
    }
  });

  it("marks models and archive results as limited with future expiresAt", async () => {
    const res = await mockProvider.match({
      photo: SAMPLE,
      mimeType: "image/jpeg",
      sources: ["models", "archive"],
    });

    for (const m of res.matches) {
      expect(m.expiresAt).toBeDefined();
      expect(new Date(m.expiresAt!).getTime()).toBeGreaterThan(Date.now());
    }
  });

  it("is deterministic for identical inputs", async () => {
    const a = await mockProvider.match({
      photo: SAMPLE,
      mimeType: "image/jpeg",
      sources: ["public"],
    });
    const b = await mockProvider.match({
      photo: SAMPLE,
      mimeType: "image/jpeg",
      sources: ["public"],
    });

    expect(a.matches.map((m) => m.id)).toEqual(b.matches.map((m) => m.id));
    expect(a.matches.map((m) => m.similarity)).toEqual(b.matches.map((m) => m.similarity));
  });

  it("returns sensible TTL", async () => {
    const res = await mockProvider.match({
      photo: SAMPLE,
      mimeType: "image/jpeg",
      sources: ["public"],
    });
    expect(res.retentionSeconds).toBe(24 * 60 * 60);
  });
});
