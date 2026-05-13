/**
 * Контракт face-matching провайдера.
 *
 * Match — это «полный» внутренний тип, который провайдер отдаёт нашему сервису.
 * PublicMatch — это то, что мы отдаём фронту, прошедшее через entitlement-фильтр.
 *
 * Принцип gating:
 *   - gated=false: совпадение из публичной базы, всегда видимое.
 *   - gated=true: премиум-источник, требует unlock. Без unlock → PublicMatch без imageUrl,
 *     с blurhash. С unlock → PublicMatch с imageUrl и expiresAt (countdown).
 */

export type MatchSource = "public" | "models" | "sports" | "archive";

export interface Match {
  id: string;
  name: string;
  similarity: number;
  source: MatchSource;
  imageUrl: string;
  /** ~30-байтовый BlurHash. Обязателен для gated, опционален для public. */
  blurhash?: string;
  /** Премиум-источник, требующий разблокировки. */
  gated: boolean;
  /** Срок доступа к лимитированному источнику. Раскрывается только после unlock. */
  expiresAt?: string;
}

/** То, что уходит на клиент. Поля imageUrl/expiresAt появляются только для разблокированного. */
export type PublicMatch =
  | {
      id: string;
      name: string;
      similarity: number;
      source: MatchSource;
      gated: false;
      imageUrl: string;
    }
  | {
      id: string;
      name: string;
      similarity: number;
      source: MatchSource;
      gated: true;
      locked: true;
      blurhash: string;
    }
  | {
      id: string;
      name: string;
      similarity: number;
      source: MatchSource;
      gated: true;
      locked: false;
      imageUrl: string;
      blurhash: string;
      expiresAt?: string;
    };

export interface MatchRequest {
  /** Hex sha256 загруженного фото. Используется mock-провайдером как seed; реальные
   *  провайдеры в БД его хранят, но в момент запроса работают с photo Buffer. */
  photoHash: string;
  /** Тело фото. Отсутствует при пересчёте по photoHash (после первичной загрузки фото удалено). */
  photo?: Buffer;
  mimeType: string;
  sources: MatchSource[];
  plan?: "free" | "pro" | "max";
}

export interface MatchResponse {
  matches: Match[];
  retentionSeconds: number;
}

export interface FaceMatchProvider {
  name: string;
  match(request: MatchRequest): Promise<MatchResponse>;
}

/**
 * Применяет entitlement: для gated && !unlocked удаляет imageUrl и expiresAt,
 * оставляет только blurhash.
 */
export function toPublicMatches(matches: Match[], isUnlocked: boolean): PublicMatch[] {
  return matches.map((m) => {
    if (!m.gated) {
      return {
        id: m.id,
        name: m.name,
        similarity: m.similarity,
        source: m.source,
        gated: false,
        imageUrl: m.imageUrl,
      };
    }
    if (!isUnlocked) {
      return {
        id: m.id,
        name: m.name,
        similarity: m.similarity,
        source: m.source,
        gated: true,
        locked: true,
        blurhash: m.blurhash ?? "L00000fQfQfQfQfQfQfQfQfQfQfQ",
      };
    }
    return {
      id: m.id,
      name: m.name,
      similarity: m.similarity,
      source: m.source,
      gated: true,
      locked: false,
      imageUrl: m.imageUrl,
      blurhash: m.blurhash ?? "L00000fQfQfQfQfQfQfQfQfQfQfQ",
      expiresAt: m.expiresAt,
    };
  });
}
