import { afterEach, describe, expect, it } from "vitest";
import { _resetRateLimitStore, checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  afterEach(() => {
    _resetRateLimitStore();
  });

  it("allows requests within the limit and decrements remaining", () => {
    const first = checkRateLimit("ip-1", 3);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);

    const second = checkRateLimit("ip-1", 3);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);

    const third = checkRateLimit("ip-1", 3);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks the request that exceeds the limit", () => {
    checkRateLimit("ip-2", 2);
    checkRateLimit("ip-2", 2);
    const blocked = checkRateLimit("ip-2", 2);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("uses independent buckets per key", () => {
    checkRateLimit("ip-a", 1);
    const aBlocked = checkRateLimit("ip-a", 1);
    const bAllowed = checkRateLimit("ip-b", 1);
    expect(aBlocked.allowed).toBe(false);
    expect(bAllowed.allowed).toBe(true);
  });

  it("resets after the window expires", () => {
    const r = checkRateLimit("ip-3", 1, 50);
    expect(r.allowed).toBe(true);
    expect(checkRateLimit("ip-3", 1, 50).allowed).toBe(false);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const afterReset = checkRateLimit("ip-3", 1, 50);
        expect(afterReset.allowed).toBe(true);
        resolve();
      }, 80);
    });
  });
});
