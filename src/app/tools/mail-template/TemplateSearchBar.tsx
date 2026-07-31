"use client";

import { useI18n } from "@/i18n";

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-zinc-400"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

/** テンプレート検索バー */
export default function TemplateSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  const mt = t.apps.mailTemplate;

  return (
    <div className="relative w-full max-w-full">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
        <SearchIcon />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={mt.search.placeholder}
        aria-label={mt.search.aria}
        className="input-field min-h-11 w-full max-w-full !py-2 !pl-8 !pr-2 !text-sm md:min-h-0 md:!py-1.5 md:!text-xs"
        autoComplete="off"
      />
    </div>
  );
}
