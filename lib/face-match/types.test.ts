import { describe, expect, it } from "vitest";
import { toPublicMatches, type Match } from "./types";

const publicMatch: Match = {
  id: "m1",
  name: "Public Person",
  similarity: 0.91,
  source: "public",
  imageUrl: "/mock/public-1.svg",
  gated: false,
};

const gatedMatch: Match = {
  id: "m2",
  name: "Premium Person",
  similarity: 0.87,
  source: "models",
  imageUrl: "/mock/premium-1.svg",
  blurhash: "L00000fQfQfQfQfQfQfQfQfQfQfQ",
  gated: true,
  expiresAt: "2026-05-14T18:00:00.000Z",
};

describe("toPublicMatches", () => {
  it("public matches: imageUrl is preserved, no locked flag", () => {
    const [out] = toPublicMatches([publicMatch], false);
    expect(out.gated).toBe(false);
    if (out.gated === false) {
      expect(out.imageUrl).toBe("/mock/public-1.svg");
    }
    // public matches никогда не имеют locked/blurhash/expiresAt — это discriminated union
    expect("locked" in out).toBe(false);
    expect("expiresAt" in out).toBe(false);
    expect("blurhash" in out).toBe(false);
  });

  it("gated + locked: imageUrl and expiresAt are stripped, blurhash exposed", () => {
    const [out] = toPublicMatches([gatedMatch], false);
    expect(out.gated).toBe(true);
    if (out.gated === true && out.locked === true) {
      expect(out.blurhash).toBe("L00000fQfQfQfQfQfQfQfQfQfQfQ");
    }
    // sharp image url MUST NOT leak
    expect("imageUrl" in out).toBe(false);
    expect("expiresAt" in out).toBe(false);
  });

  it("gated + unlocked: imageUrl, blurhash, expiresAt all visible", () => {
    const [out] = toPublicMatches([gatedMatch], true);
    expect(out.gated).toBe(true);
    if (out.gated === true && out.locked === false) {
      expect(out.imageUrl).toBe("/mock/premium-1.svg");
      expect(out.blurhash).toBe("L00000fQfQfQfQfQfQfQfQfQfQfQ");
      expect(out.expiresAt).toBe("2026-05-14T18:00:00.000Z");
    }
  });

  it("gated without blurhash on source: fills with placeholder", () => {
    const [out] = toPublicMatches([{ ...gatedMatch, blurhash: undefined }], false);
    if (out.gated === true && out.locked === true) {
      expect(out.blurhash).toMatch(/^L/); // BlurHash strings start with L
    }
  });

  it("preserves order across mixed input", () => {
    const result = toPublicMatches([gatedMatch, publicMatch, gatedMatch], false);
    expect(result).toHaveLength(3);
    expect(result[0]?.id).toBe("m2");
    expect(result[1]?.id).toBe("m1");
    expect(result[2]?.id).toBe("m2");
  });
});
