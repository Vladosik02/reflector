"use client";

import { decode } from "blurhash";
import { useEffect, useRef } from "react";
import { Lock } from "lucide-react";

interface BlurredPreviewProps {
  blurhash: string;
}

/**
 * Тампер-устойчивый blur через BlurHash:
 *   - на клиент приходит только 30-байтовая строка;
 *   - sharp-картинки нет в DOM, удалить CSS-blur нечего;
 *   - canvas 32x32 декодируется и масштабируется CSS.
 *
 * a11y: aria-label НЕ упоминает имя совпадения — это privacy/dignity вопрос
 * (мы не утверждаем, что заблокированный человек = такой-то).
 */
export function BlurredPreview({ blurhash }: BlurredPreviewProps) {
  const alt = "Заблокированный результат, откройте чтобы увидеть";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const pixels = decode(blurhash, 32, 32);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const imgData = ctx.createImageData(32, 32);
      imgData.data.set(pixels);
      ctx.putImageData(imgData, 0, 0);
    } catch (err) {
      console.warn("blurhash decode failed", err);
    }
  }, [blurhash]);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        width={32}
        height={32}
        role="img"
        aria-label={alt}
        className="h-full w-full blur-sm"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-brand-bg/30">
        <Lock className="h-6 w-6 text-white drop-shadow" aria-hidden="true" />
      </div>
      <span className="sr-only">Заблокировано. Откройте, чтобы увидеть.</span>
    </div>
  );
}
