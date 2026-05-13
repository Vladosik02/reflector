import { describe, expect, it } from "vitest";
import { buildSessionCookieValue, createSessionId, verifySessionCookie } from "./session";

describe("session cookie", () => {
  it("createSessionId returns 32 bytes of base64url", () => {
    const id = createSessionId();
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    // base64url of 32 bytes is ~43 chars (no padding)
    expect(id.length).toBeGreaterThanOrEqual(40);
    expect(id.length).toBeLessThanOrEqual(50);
  });

  it("round-trips a signed cookie", () => {
    const sid = createSessionId();
    const cookie = buildSessionCookieValue(sid);
    expect(verifySessionCookie(cookie)).toBe(sid);
  });

  it("rejects a tampered payload", () => {
    const sid = createSessionId();
    const cookie = buildSessionCookieValue(sid);
    const dot = cookie.lastIndexOf(".");
    const tampered = cookie.slice(0, dot - 1) + "X" + cookie.slice(dot);
    expect(verifySessionCookie(tampered)).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const sid = createSessionId();
    const cookie = buildSessionCookieValue(sid);
    const tampered = cookie.slice(0, -1) + (cookie.endsWith("a") ? "b" : "a");
    expect(verifySessionCookie(tampered)).toBeNull();
  });

  it("rejects missing or malformed cookies", () => {
    expect(verifySessionCookie(undefined)).toBeNull();
    expect(verifySessionCookie("")).toBeNull();
    expect(verifySessionCookie("no-dot-here")).toBeNull();
    expect(verifySessionCookie(".sigonly")).toBeNull();
  });
});
