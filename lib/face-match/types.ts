/**
 * Контракт face-matching провайдера.
 * Mock-реализация лежит в `./mock.ts`, в будущем добавятся реальные провайдеры
 * (Face++, Microsoft Face API, собственный сервис). Выбор — через ENV.
 */

export type MatchSource = "public" | "models" | "sports" | "archive";

export interface Match {
  id: string;
  /** Имя или подпись совпадения (для архивов может быть фамилия + год). */
  name: string;
  /** 0..1 — насколько похож. Фронт показывает в процентах. */
  similarity: number;
  /** Источник совпадения. Влияет на gating по тарифу. */
  source: MatchSource;
  /** Публичная ссылка на фото-совпадение. */
  imageUrl: string;
  /**
   * ISO timestamp окончания доступа. Если задано — совпадение «лимитированное»
   * (тариф Max, бейдж countdown). После истечения фронт показывает blur + «Срок истёк».
   */
  expiresAt?: string;
}

export interface MatchRequest {
  photo: Buffer;
  mimeType: string;
  sources: MatchSource[];
  /** Зарезервировано для будущей интеграции с auth/тарифом. */
  plan?: "free" | "pro" | "max";
}

export interface MatchResponse {
  matches: Match[];
  /** Сколько секунд хранится исходное фото перед автоудалением (TTL). */
  retentionSeconds: number;
}

export interface FaceMatchProvider {
  name: string;
  match(request: MatchRequest): Promise<MatchResponse>;
}
