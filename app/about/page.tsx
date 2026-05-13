import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "О нас",
  description: "Команда и миссия сервиса Reflector.",
};

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="О нас"
      title="Поиск двойника как ритуал, а не как слежка"
      intro="Reflector — небольшой проект о том, как мы все вписываемся в большую картину человеческих лиц."
    >
      <p className="mt-2 text-brand-muted">
        Идея простая: на планете живёт восемь миллиардов человек. Кто-то из них наверняка похож на
        вас — в чертах, в линиях, в выражении. Найти этого человека — забавный эксперимент, повод
        посмотреть на себя со стороны.
      </p>

      <p className="mt-4 text-brand-muted">
        Мы делаем это аккуратно: не торгуем вашими данными, не показываем рекламу поверх
        результатов, не тренируем модели на загруженных фото. Просто инструмент — и сразу чистое
        окно после него.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">Принципы</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-brand-muted">
        <li>Приватность по умолчанию: фото удаляется через 24 часа, без исключений.</li>
        <li>
          Никакого dark pattern: явные согласия, понятные тарифы, отсутствие скрытых списаний.
        </li>
        <li>Точность важнее количества: лучше топ-10 правдоподобных, чем сотня случайных.</li>
      </ul>
    </PageShell>
  );
}
