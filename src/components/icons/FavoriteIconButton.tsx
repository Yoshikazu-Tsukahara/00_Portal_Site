"use client";

import { Star, type LucideProps } from "lucide-react";
import type { ButtonHTMLAttributes, ComponentType } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** ピン留め済みか */
  active?: boolean;
  /** アイコン差し替え用（既定: Lucide Star） */
  icon?: ComponentType<LucideProps>;
  label?: string;
};

/**
 * 共通「お気に入り／ホームに追加」ボタン。
 * 後日オリジナル画像に差し替えやすいよう、アイコン呼び出しをここに閉じる。
 */
export default function FavoriteIconButton({
  active = false,
  icon: Icon = Star,
  label,
  className = "",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-2 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_40%,white)] text-zinc-900"
          : "border-zinc-200 bg-[var(--background)] text-zinc-700 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_28%,white)]"
      } ${className}`.trim()}
      {...rest}
    >
      <Icon
        className="size-4 shrink-0"
        strokeWidth={2}
        fill={active ? "currentColor" : "none"}
        aria-hidden
      />
      {label ? <span className="text-sm font-medium">{label}</span> : null}
    </button>
  );
}
