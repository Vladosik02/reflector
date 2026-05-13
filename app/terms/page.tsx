import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Условия использования",
  description: "Условия использования сервиса Reflector — поиск двойников по фото.",
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Правовое"
      title="Условия использования"
      intro="Соглашение между вами и сервисом. Использование Reflector означает согласие с этим документом."
    >
      <p className="text-brand-muted">Действует с 13 мая 2026 года.</p>

      <h2 className="mt-10 text-title text-brand-ink">1. Что такое Reflector</h2>
      <p className="mt-3 text-brand-muted">
        Reflector — это онлайн-сервис, который сравнивает загруженное вами фото с базой лиц и
        возвращает топ наиболее похожих. Сервис носит развлекательно-информационный характер и не
        предназначен для идентификации в юридически значимых целях.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">2. Что вы обещаете</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-brand-muted">
        <li>Загружать только фото с лицом, права на которое у вас есть.</li>
        <li>Не использовать сервис для слежки, доксинга или преследования других людей.</li>
        <li>Не пытаться обходить лимиты, перебирать API, эмулировать клиентов.</li>
      </ul>

      <h2 className="mt-10 text-title text-brand-ink">3. Что мы обещаем</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-brand-muted">
        <li>Стремиться к доступности 99.5% в месяц (без SLA на бесплатном тарифе).</li>
        <li>Удалять загруженные фото в течение 24 часов.</li>
        <li>Не использовать ваши фото для обучения моделей — ни наших, ни сторонних.</li>
      </ul>

      <h2 className="mt-10 text-title text-brand-ink">4. Ограничение ответственности</h2>
      <p className="mt-3 text-brand-muted">
        Результаты сервиса носят вероятностный характер. Совпадение в 85% — это не доказательство
        родства или идентичности. Мы не несём ответственности за решения, принятые на основании
        результатов сервиса.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">5. Изменения</h2>
      <p className="mt-3 text-brand-muted">
        Мы можем менять эти условия с уведомлением за 14 дней (на email для авторизованных и
        баннером на сайте — для остальных).
      </p>
    </PageShell>
  );
}
