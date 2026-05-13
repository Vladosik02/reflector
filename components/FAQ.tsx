"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { faq } from "@/lib/content";

/**
 * FAQ-аккордеон. Без `<details>` — нужен полный контроль над анимацией
 * и aria-атрибутами. По умолчанию открыт первый вопрос.
 */
export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-brand-line bg-brand-surface">
      <div className="mx-auto max-w-site px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-brand-accent">FAQ</span>
          <h2 className="mt-3 text-headline text-brand-ink">Частые вопросы</h2>
          <p className="mt-4 text-base text-brand-muted">
            Если ваш вопрос не покрыт — напишите в&nbsp;
            <Link className="underline underline-offset-2 hover:text-brand-ink" href="/contacts">
              службу поддержки
            </Link>
            .
          </p>
        </div>

        <ul className="mt-12 divide-y divide-brand-line border-y border-brand-line">
          {faq.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <li key={item.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${idx}`}
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-brand-accent"
                >
                  <span className="text-base font-medium text-brand-ink">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-brand-subtle transition-transform",
                      isOpen && "rotate-180 text-brand-accent",
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-${idx}`}
                  role="region"
                  hidden={!isOpen}
                  className="pb-6 pr-10 text-sm leading-relaxed text-brand-muted"
                >
                  {item.answer}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
