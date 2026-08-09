"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { useI18n } from "@/i18n";
import { genres } from "@/data/tools";
import { useLayout } from "@/lib/layout";

/** 運営者への連絡先（mailto のみ・サーバー送信なし） */
const CONTACT_EMAIL = "mtb.yoshikazu@gmail.com";

type ContactCategory = "general" | "feature" | "bug" | "other";

const CATEGORY_KEYS: ContactCategory[] = [
  "general",
  "feature",
  "bug",
  "other",
];

/** ポータル掲載アプリ（coming-soon 以外） */
function useListedAppOptions(
  tools: Record<string, { title: string }>,
): { id: string; title: string }[] {
  return useMemo(() => {
    const options: { id: string; title: string }[] = [];
    for (const genre of genres) {
      for (const tool of genre.tools) {
        if (tool.id === "coming-soon") continue;
        const title = tools[tool.id]?.title;
        if (title) options.push({ id: tool.id, title });
      }
    }
    return options;
  }, [tools]);
}

function collectEnvironmentInfo(): string {
  if (typeof navigator === "undefined") return "";
  const lines = [
    `User-Agent: ${navigator.userAgent || "(unknown)"}`,
    `Language: ${navigator.language || "(unknown)"}`,
    `Platform: ${navigator.platform || "(unknown)"}`,
  ];
  if (typeof screen !== "undefined") {
    lines.push(`Screen: ${screen.width}×${screen.height}`);
  }
  return lines.join("\n");
}

function buildMailto(subject: string, body: string): string {
  const normalized = body.replace(/\r?\n/g, "\r\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(normalized)}`;
}

export default function ContactContent() {
  const { t } = useI18n();
  const { contentClassName } = useLayout();
  const copy = t.contact;
  const appOptions = useListedAppOptions(t.tools);

  const [category, setCategory] = useState<ContactCategory>("general");
  const [appId, setAppId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError(copy.messageRequired);
      return;
    }
    setError("");

    const labels = copy.bodyLabels;
    const categoryLabel = copy.categories[category];
    const appTitle =
      appId === ""
        ? labels.notProvided
        : (appOptions.find((a) => a.id === appId)?.title ?? appId);
    const nameValue = name.trim() || labels.notProvided;
    const emailValue = email.trim() || labels.notProvided;

    const body = [
      `【${labels.category}】`,
      categoryLabel,
      "",
      `【${labels.app}】`,
      appTitle,
      "",
      `【${labels.name}】`,
      nameValue,
      "",
      `【${labels.email}】`,
      emailValue,
      "",
      `【${labels.message}】`,
      trimmed,
      "",
      "--------------------",
      `【${labels.environment}】`,
      collectEnvironmentInfo(),
      "",
    ].join("\n");

    const subject = `${copy.subjectPrefix}（${categoryLabel}）`;
    window.location.href = buildMailto(subject, body);
  };

  return (
    <main className="w-full flex-1 py-12 sm:py-16">
      <div className={contentClassName}>
        <header className="border-b border-zinc-200 pb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
            {copy.lead}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="content-card mt-8 max-w-xl space-y-5"
        >
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">
              {copy.categoryLabel}
            </span>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ContactCategory)
              }
              className="input-field w-full"
            >
              {CATEGORY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {copy.categories[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">
              {copy.appLabel}
              <span className="ml-1.5 font-normal text-zinc-400">
                ({copy.appPlaceholder})
              </span>
            </span>
            <select
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="input-field w-full"
            >
              <option value="">{copy.appNone}</option>
              {appOptions.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">
              {copy.nameLabel}
              <span className="ml-1.5 font-normal text-zinc-400">
                ({copy.namePlaceholder})
              </span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="input-field w-full"
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">
              {copy.emailLabel}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
              className="input-field w-full"
            />
            <span className="mt-1 block text-[11px] text-zinc-400">
              {copy.emailHint}
            </span>
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">
              {copy.messageLabel}
              <span className="ml-1 text-red-600" aria-hidden>
                *
              </span>
            </span>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError("");
              }}
              required
              rows={7}
              placeholder={copy.messagePlaceholder}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "contact-message-error" : undefined}
              className={`input-field w-full resize-y ${
                error ? "border-red-300 focus:border-red-400" : ""
              }`}
            />
            {error ? (
              <span
                id="contact-message-error"
                className="mt-1.5 block text-[12px] text-red-600"
                role="alert"
              >
                {error}
              </span>
            ) : null}
          </label>

          <div className="border-t border-zinc-100 pt-4">
            <button
              type="submit"
              disabled={!message.trim()}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {copy.submit}
            </button>
            <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-400">
              {copy.mailtoHint}
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
