"use client";

import { useCallback, useRef, useState } from "react";
import { upload } from "@/lib/content";

/**
 * Функциональный блок: фильтры (левая колонка) + dropzone (правая).
 * Это «рабочий стол» пользователя.
 *
 * Реализована базовая клиентская логика:
 *   - drag & drop файла,
 *   - валидация типа и размера,
 *   - превью выбранного фото.
 *
 * TODO для следующего разработчика:
 *   - заменить imitation `handleFile` на отправку на бэкенд (FormData / fetch),
 *   - подключить выбор фильтров к параметрам запроса,
 *   - подменить блок результатов на реальные данные.
 */

const MAX_BYTES = 15 * 1024 * 1024; // 15 МБ
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export default function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(["public"])
  );
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((next: File | null) => {
    setError(null);

    if (!next) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!ACCEPT.includes(next.type)) {
      setError("Поддерживаются только JPG, PNG и WEBP.");
      return;
    }
    if (next.size > MAX_BYTES) {
      setError("Файл слишком большой. Максимум 15 МБ.");
      return;
    }

    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));

    // TODO: отправить файл на бэкенд для распознавания.
    // Пример:
    // const fd = new FormData();
    // fd.append("photo", next);
    // fd.append("filters", JSON.stringify(Array.from(activeFilters)));
    // await fetch("/api/match", { method: "POST", body: fd });
  }, []);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section
      id="upload"
      className="border-t border-brand-line bg-brand-surface"
    >
      <div className="mx-auto max-w-site px-6 py-24">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-brand-accent">
            Найти двойника
          </span>
          <h2 className="mt-3 text-headline text-brand-ink">{upload.title}</h2>
          <p className="mt-4 text-base text-brand-muted">
            {upload.description}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Левая колонка — меню фильтров источников */}
          <aside className="rounded-card border border-brand-line bg-brand-bg p-6">
            <h3 className="text-sm font-semibold text-brand-ink">
              Источники поиска
            </h3>
            <p className="mt-2 text-xs text-brand-subtle">
              Выберите, где искать совпадения. В платных тарифах доступно
              больше источников.
            </p>

            <div className="mt-5 space-y-2">
              {upload.filters.map((f) => {
                const active = activeFilters.has(f.id);
                return (
                  <label
                    key={f.id}
                    className={[
                      "flex cursor-pointer items-center justify-between rounded-btn border px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-brand-ink bg-brand-surface text-brand-ink"
                        : "border-brand-line text-brand-muted hover:border-brand-ink/40",
                    ].join(" ")}
                  >
                    <span>{f.label}</span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleFilter(f.id)}
                      className="h-4 w-4 accent-brand-ink"
                    />
                  </label>
                );
              })}
            </div>

            <p className="mt-6 rounded-btn border border-brand-line bg-brand-surface p-3 text-xs leading-relaxed text-brand-muted">
              Часть совпадений из уникальных источников доступна только&nbsp;
              <span className="font-medium text-brand-warning">24 часа</span>.
            </p>
          </aside>

          {/* Правая колонка — dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files?.[0] ?? null;
              handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={[
              "flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed bg-brand-bg p-10 text-center transition-colors",
              isDragging
                ? "border-brand-accent bg-brand-accent/5"
                : "border-brand-line hover:border-brand-ink/40",
            ].join(" ")}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT.join(",")}
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              hidden
            />

            {previewUrl ? (
              <div className="flex flex-col items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Превью загруженного фото"
                  className="h-48 w-48 rounded-card object-cover shadow-card"
                />
                <p className="text-sm text-brand-muted">
                  {file?.name} · готово к анализу
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFile(null);
                  }}
                  className="text-xs text-brand-subtle underline-offset-2 hover:text-brand-ink hover:underline"
                >
                  Выбрать другое фото
                </button>
              </div>
            ) : (
              <>
                <UploadIcon />
                <p className="mt-4 text-lg font-medium text-brand-ink">
                  {upload.dropzoneLabel}
                </p>
                <p className="mt-2 text-sm text-brand-subtle">
                  {upload.dropzoneHint}
                </p>
              </>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Плейсхолдер результатов — превратится в реальный список совпадений. */}
        <ResultsPlaceholder />
      </div>
    </section>
  );
}

function UploadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className="text-brand-subtle"
    >
      <path
        d="M20 26V12M20 12L14 18M20 12L26 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 28V30C8 31.1 8.9 32 10 32H30C31.1 32 32 31.1 32 30V28"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Плейсхолдер для блока результатов.
 * После подключения бэкенда сюда придут карточки совпадений.
 * Карточки с пометкой `limited` подсвечиваются янтарным и содержат countdown.
 */
function ResultsPlaceholder() {
  return (
    <div className="mt-10 rounded-card border border-brand-line bg-brand-bg p-6">
      <p className="text-sm font-semibold text-brand-ink">Результаты появятся здесь</p>
      <p className="mt-1 text-xs text-brand-subtle">
        Загрузите фото — и сразу под этим блоком отобразится топ совпадений с
        процентом сходства и сравнением плечо-к-плечу.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="aspect-[3/4] rounded-card border border-dashed border-brand-line bg-brand-surface"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
