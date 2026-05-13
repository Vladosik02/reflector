import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Обработка фото",
  description: "Технические детали обработки и хранения загруженных фото в Reflector.",
};

export default function PhotoPolicyPage() {
  return (
    <PageShell
      eyebrow="Правовое"
      title="Обработка фото"
      intro="Технические подробности — что происходит с фото от момента загрузки до удаления."
    >
      <h2 className="mt-2 text-title text-brand-ink">Жизненный цикл загруженного фото</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-6 text-brand-muted">
        <li>
          <strong className="text-brand-ink">Передача.</strong> Фото загружается по HTTPS (TLS 1.3).
          Сервер не пишет тело запроса в логи.
        </li>
        <li>
          <strong className="text-brand-ink">Извлечение признаков.</strong> Из фото вычисляется
          числовой эмбеддинг лица — это короткий вектор, по которому модель ищет похожие лица. Сам
          эмбеддинг не позволяет восстановить исходное фото.
        </li>
        <li>
          <strong className="text-brand-ink">Хранение.</strong> Фото зашифровано (AES-256-GCM)
          сохраняется в объектном хранилище с TTL=24h. Ключ шифрования — на стороне сервиса.
        </li>
        <li>
          <strong className="text-brand-ink">Сравнение.</strong> Эмбеддинг сверяется с базами,
          выбранными вами в фильтрах. Возвращается топ совпадений с процентом сходства.
        </li>
        <li>
          <strong className="text-brand-ink">Удаление.</strong> По истечении 24 часов фоновая задача
          удаляет файл из хранилища и затирает связанные с ним записи в БД (soft delete → через 7
          дней — physical delete).
        </li>
      </ol>

      <h2 className="mt-10 text-title text-brand-ink">Что мы НЕ делаем</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-brand-muted">
        <li>Не используем ваши фото для обучения моделей.</li>
        <li>Не передаём фото или эмбеддинги третьим лицам.</li>
        <li>Не анализируем фото на эмоции, возраст, пол — только сравнение по геометрии.</li>
        <li>Не сохраняем фото после истечения TTL ни в одном бэкапе.</li>
      </ul>
    </PageShell>
  );
}
