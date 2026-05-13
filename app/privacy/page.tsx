import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Как мы обрабатываем фото и персональные данные пользователей сервиса Reflector.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Правовое"
      title="Политика конфиденциальности"
      intro="Документ описывает, какие данные мы собираем, как храним и кому передаём. Не юридическая консультация — публикуется для прозрачности."
    >
      <p className="text-brand-muted">
        Действует с 13 мая 2026 года. Последняя редакция: 13 мая 2026.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">1. Какие данные мы собираем</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-brand-muted">
        <li>
          <strong className="text-brand-ink">Фото лица</strong>, которое вы загружаете для поиска
          двойников. Это биометрические данные.
        </li>
        <li>
          <strong className="text-brand-ink">Технические данные</strong>: IP-адрес, тип браузера,
          время запроса — для защиты от злоупотреблений и базовой аналитики.
        </li>
        <li>
          <strong className="text-brand-ink">Email и платёжные данные</strong> — только если вы
          оформляете платный тариф. Платежи проходят через сертифицированного провайдера, мы не
          храним номер карты.
        </li>
      </ul>

      <h2 className="mt-10 text-title text-brand-ink">2. Зачем мы их используем</h2>
      <p className="mt-3 text-brand-muted">
        Фото — только для одного запроса на поиск, в моменте. Технические данные — для защиты от
        автоматических атак и улучшения сервиса. Email — для уведомлений по тарифу и поддержки.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">3. Сколько мы это храним</h2>
      <p className="mt-3 text-brand-muted">
        Фото автоматически стирается из хранилища через 24 часа после загрузки — фоновой задачей,
        без возможности восстановления. Аккаунтные данные — пока активен аккаунт, плюс 30 дней после
        удаления (для разрешения возможных споров).
      </p>

      <h2 className="mt-10 text-title text-brand-ink">4. Биометрия</h2>
      <p className="mt-3 text-brand-muted">
        Перед загрузкой фото вы даёте явное согласие на обработку биометрии — отдельным чекбоксом.
        Согласие можно отозвать в любой момент, написав на{" "}
        <a className="underline" href="mailto:privacy@reflector.app">
          privacy@reflector.app
        </a>
        . Отзыв означает удаление всех связанных данных в течение 7 дней.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">5. Кому мы передаём данные</h2>
      <p className="mt-3 text-brand-muted">
        Никому. Мы не продаём данные, не передаём рекламным сетям, не обмениваемся с агрегаторами.
        Доступ к фото — только у автоматических процессов нашего сервиса, ни один сотрудник не
        просматривает фото вручную.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">6. Ваши права</h2>
      <p className="mt-3 text-brand-muted">
        Вы вправе запросить копию данных, исправление, удаление или ограничение обработки. Запросы
        обрабатываются в течение 30 дней.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">7. Контакты</h2>
      <p className="mt-3 text-brand-muted">
        Вопросы по приватности —{" "}
        <a className="underline" href="mailto:privacy@reflector.app">
          privacy@reflector.app
        </a>
        . Для регуляторов: оператор — индивидуальный предприниматель/юр.лицо (уточнено будет при
        запуске коммерческой эксплуатации).
      </p>
    </PageShell>
  );
}
