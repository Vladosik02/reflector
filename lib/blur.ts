import "server-only";
import path from "node:path";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { encode } from "blurhash";

/**
 * Tamper-resistant blur preview через BlurHash.
 *
 * Принцип: BlurHash — это ~30-байтовая строка из 4x3 DCT-коэффициентов цветов.
 * Из неё невозможно восстановить исходную картинку (нет high-frequency информации).
 * Клиент декодирует её в canvas 32x32; sharp-картинка попадает в DOM только после
 * подтверждения unlock на сервере.
 *
 * В нашем случае mock-картинки — это SVG в public/mock/. sharp умеет рендерить SVG
 * в bitmap и считать blurhash.
 *
 * Для прода: blurhash должен считаться один раз при загрузке фото в S3 и храниться
 * в Match-snapshot.
 */

const CACHE_MAX = 256;
const cache = new Map<string, Promise<string>>();

const PUBLIC_DIR = path.resolve(process.cwd(), "public");

export async function getBlurhashForPublicAsset(publicPath: string): Promise<string> {
  const resolvedRel = safeResolveUnderPublic(publicPath);
  const cached = cache.get(resolvedRel);
  if (cached) return cached;
  const promise = computeBlurhash(resolvedRel).catch((err) => {
    cache.delete(resolvedRel);
    throw err;
  });

  if (cache.size >= CACHE_MAX) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(resolvedRel, promise);
  return promise;
}

/**
 * Проверяет, что `publicPath` указывает на файл строго внутри `public/`.
 * Защищает от `..`-traversal'а и абсолютных путей.
 * Возвращает абсолютный путь, если всё ок.
 */
function safeResolveUnderPublic(publicPath: string): string {
  if (typeof publicPath !== "string" || !publicPath.startsWith("/")) {
    throw new Error(`Invalid public path: ${publicPath}`);
  }
  const trimmed = publicPath.replace(/^\/+/, "");
  const candidate = path.resolve(PUBLIC_DIR, trimmed);
  const rel = path.relative(PUBLIC_DIR, candidate);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Path escapes public dir: ${publicPath}`);
  }
  return candidate;
}

async function computeBlurhash(absPath: string): Promise<string> {
  const buffer = await readFile(absPath);
  return computeBlurhashFromBuffer(buffer);
}

export async function computeBlurhashFromBuffer(buffer: Buffer): Promise<string> {
  const { data, info } = await sharp(buffer, { density: 96 })
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

/** Только для тестов. */
export function _clearBlurhashCache(): void {
  cache.clear();
}
