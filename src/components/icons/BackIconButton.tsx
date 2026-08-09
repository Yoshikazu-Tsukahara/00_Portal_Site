"use client";

import { ArrowLeft, type LucideProps } from "lucide-react";
import type { ButtonHTMLAttributes, ComponentType } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** アイコン差し替え用（既定: Lucide ArrowLeft） */
  icon?: ComponentType<LucideProps>;
  label?: string;
};

/**
 * 共通「戻る」ボタン。
 * 後日オリジナル画像に差し替えやすいよう、アイコン呼び出しをここに閉じる。
 */
export default function BackIconButton({
  icon: Icon = ArrowLeft,
  label,
  className = "",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-[var(--background)] px-2.5 py-2 text-zinc-800 transition-all duration-150 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_28%,white)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
      {...rest}
    >
      <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
      {label ? <span className="text-sm font-medium">{label}</span> : null}
    </button>
  );
}
