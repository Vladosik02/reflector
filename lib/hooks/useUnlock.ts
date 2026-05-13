"use client";

import { useState } from "react";

interface UnlockResponse {
  checkoutUrl?: string;
  alreadyUnlocked?: boolean;
}

interface UseUnlockOptions {
  /** Called after `alreadyUnlocked: true` to re-fetch fresh data. */
  onAlreadyUnlocked?: () => Promise<void> | void;
  /** Surface a textual error to the caller (UI shows it). */
  onError?: (message: string) => void;
}

/**
 * Кнопка-обработчик unlock-флоу.
 * POST /api/unlock → либо редиректит на checkoutUrl, либо вызывает onAlreadyUnlocked.
 *
 * Дедуплицирует одну и ту же логику в UploadSection и /search/[id].
 */
export function useUnlock(searchId: string | null, options: UseUnlockOptions = {}) {
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async (): Promise<void> => {
    if (!searchId) return;
    setIsUnlocking(true);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        options.onError?.(body.error ?? "Не удалось начать оплату.");
        setIsUnlocking(false);
        return;
      }
      const body = (await res.json()) as UnlockResponse;
      if (body.alreadyUnlocked) {
        await options.onAlreadyUnlocked?.();
        setIsUnlocking(false);
        return;
      }
      if (body.checkoutUrl) {
        window.location.href = body.checkoutUrl;
        return;
      }
      setIsUnlocking(false);
    } catch {
      options.onError?.("Не удалось связаться с платёжным сервисом.");
      setIsUnlocking(false);
    }
  };

  return { handleUnlock, isUnlocking };
}
