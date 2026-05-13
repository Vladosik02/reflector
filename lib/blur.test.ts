import { describe, expect, it } from "vitest";
import path from "node:path";
import { safeResolveUnderPublic } from "./blur";

/**
 * Path-traversal защита — критична. Если кто-то добавит endpoint, который
 * передаёт пользовательский ввод в blur.getBlurhashForPublicAsset, traversal
 * `/../etc/passwd` не должен расширить кругозор за пределы public/.
 */
describe("safeResolveUnderPublic", () => {
  const PUBLIC_DIR = path.resolve(process.cwd(), "public");

  it("accepts a relative path under public/", () => {
    const out = safeResolveUnderPublic("/mock/face-1.svg");
    expect(out).toBe(path.join(PUBLIC_DIR, "mock", "face-1.svg"));
  });

  it("normalises multiple leading slashes", () => {
    const out = safeResolveUnderPublic("///favicon.svg");
    expect(out).toBe(path.join(PUBLIC_DIR, "favicon.svg"));
  });

  it("rejects parent-directory traversal", () => {
    expect(() => safeResolveUnderPublic("/../etc/passwd")).toThrow(/escapes public dir/);
    expect(() => safeResolveUnderPublic("/mock/../../secrets.env")).toThrow(/escapes public dir/);
  });

  it("rejects paths that don't start with a slash", () => {
    expect(() => safeResolveUnderPublic("mock/face.svg")).toThrow(/Invalid public path/);
  });

  it("rejects empty / root path (would expose directory itself)", () => {
    expect(() => safeResolveUnderPublic("/")).toThrow(/escapes public dir/);
  });

  it("rejects non-string input", () => {
    // @ts-expect-error intentional bad input — проверяем runtime-валидацию
    expect(() => safeResolveUnderPublic(null)).toThrow(/Invalid public path/);
    // @ts-expect-error intentional bad input — проверяем runtime-валидацию
    expect(() => safeResolveUnderPublic(123)).toThrow(/Invalid public path/);
  });
});
