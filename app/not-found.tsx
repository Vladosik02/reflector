import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-20 md:px-6">
        <p className="text-sm font-medium text-brand-info">404</p>
        <h1 className="mt-3 text-headline text-white">Страница не найдена</h1>
        <p className="mt-4 max-w-xl text-base text-brand-muted">
          Возможно, ссылка устарела или мы переименовали раздел. Можно вернуться на главную и начать
          с поиска двойников.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-btn bg-cta-violet px-5 py-3 text-sm font-medium text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          На главную
        </Link>
      </main>
      <Footer />
    </>
  );
}
