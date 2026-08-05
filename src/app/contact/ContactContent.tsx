"use client";

import Link from "next/link";
import { Bug, Mail, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n";
import { useLayout } from "@/lib/layout";

/** 運営者への連絡先（mailto のみ・サーバー送信なし） */
const CONTACT_EMAIL = "mtb.yoshikazu@gmail.com";

function buildMailto(subject: string, body?: string): string {
  let href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  if (body != null && body !== "") {
    // メーラー向けに CRLF（%0D%0A）へ揃える
    const normalized = body.replace(/\r?\n/g, "\r\n");
    href += `&body=${encodeURIComponent(normalized)}`;
  }
  return href;
}

type ContactCardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
  hint: string;
};

function ContactCard({
  href,
  icon,
  title,
  description,
  cta,
  hint,
}: ContactCardProps) {
  return (
    <a
      href={href}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300 hover:bg-zinc-50/80 active:scale-[0.99] sm:p-6"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors group-hover:border-zinc-300 group-hover:bg-white">
        {icon}
      </div>
      <h2 className="text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
        {title}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-800 underline-offset-4 group-hover:underline">
        <Mail className="h-4 w-4 shrink-0" aria-hidden />
        {cta}
      </span>
      <span className="mt-1.5 text-[11px] text-zinc-400">{hint}</span>
    </a>
  );
}

export default function ContactContent() {
  const { t } = useI18n();
  const { contentClassName } = useLayout();
  const copy = t.contact;

  const generalHref = buildMailto(copy.general.subject);
  const feedbackHref = buildMailto(copy.feedback.subject, copy.feedback.body);

  return (
    <main className="w-full flex-1 py-12 sm:py-16">
      <div className={contentClassName}>
        <Link
          href="/"
          className="inline-flex text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          {t.legal.back}
        </Link>

        <header className="mt-8 border-b border-zinc-200 pb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
            {copy.lead}
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <ContactCard
            href={generalHref}
            icon={<MessageSquare className="h-5 w-5" aria-hidden />}
            title={copy.general.title}
            description={copy.general.description}
            cta={copy.general.cta}
            hint={copy.mailtoHint}
          />
          <ContactCard
            href={feedbackHref}
            icon={<Bug className="h-5 w-5" aria-hidden />}
            title={copy.feedback.title}
            description={copy.feedback.description}
            cta={copy.feedback.cta}
            hint={copy.mailtoHint}
          />
        </div>
      </div>
    </main>
  );
}
