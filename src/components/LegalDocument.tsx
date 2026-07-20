"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n";
import type { LegalBlock, LegalDoc } from "@/i18n/types";

type LegalDocumentProps = {
  doc: LegalDoc;
};

/**
 * 利用規約・プライバシーポリシー共通のドキュメントレイアウト。
 * zinc 基調のミニマルな読み物ページ（文言は i18n）。
 */
export default function LegalDocument({ doc }: LegalDocumentProps) {
  const { t } = useI18n();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:px-8 sm:py-16">
      <Link
        href="/"
        className="inline-flex text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        {t.legal.back}
      </Link>

      <header className="mt-8 border-b border-zinc-200 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          {t.legal.updatedPrefix}
          {doc.updatedAt}
        </p>
      </header>

      <article className="legal-prose mt-10 space-y-10 text-sm leading-relaxed text-zinc-600 sm:text-[15px] sm:leading-7">
        {doc.sections.map((section) => (
          <LegalSection key={section.title} title={section.title}>
            {section.blocks.map((block, i) => (
              <LegalBlockView key={`${section.title}-${i}`} block={block} />
            ))}
          </LegalSection>
        ))}
      </article>
    </main>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold tracking-tight text-zinc-900">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === "ul") {
    return (
      <ul className="list-disc space-y-1.5 pl-5">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "callout") {
    return (
      <p className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-700">
        {block.parts.map((part, i) =>
          part.strong ? (
            <strong key={i} className="font-semibold text-zinc-900">
              {part.text}
            </strong>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </p>
    );
  }

  if (block.callout) {
    return (
      <p className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-700">
        {block.text}
      </p>
    );
  }

  return <p>{block.text}</p>;
}
