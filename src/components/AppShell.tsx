"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import DataManager from "@/components/DataManager";
import type { DataManagerConfig } from "@/lib/localData";
import { useI18n } from "@/i18n";

type AppShellProps = {
  /** アプリ名（ヘッダー1行目に表示） */
  title: string;
  /** 短い説明（タイトル下に1行で表示。省略可） */
  description?: string;
  /** ヘッダー右端のアクション（例: ZIP生成ボタン） */
  actions?: ReactNode;
  /**
   * データ管理（バックアップ）設定。
   * タイトル右隣に共通配置。LocalStorage 連携アプリは getData / onImport を渡す。
   */
  dataManager?: DataManagerConfig;
  /**
   * true のとき親の残り高さいっぱいに収め、
   * 子を縦方向に伸縮できるレイアウトにする（1画面完結アプリ向け）
   */
  fillViewport?: boolean;
  /** 相関図など広めのキャンバス向け */
  wide?: boolean;
  children: ReactNode;
};

/**
 * 全ツールアプリ共通のシェル。
 * 「戻る」とタイトルを1行に収め、余白を最小化した高密度レイアウト。
 */
export default function AppShell({
  title,
  description,
  actions,
  dataManager,
  fillViewport = false,
  wide = false,
  children,
}: AppShellProps) {
  const { t } = useI18n();

  return (
    <main
      className={`mx-auto flex w-full flex-1 flex-col px-4 sm:px-6 ${
        wide ? "max-w-[min(100%,90rem)]" : "max-w-6xl"
      } ${fillViewport ? "min-h-0 overflow-hidden py-2" : "py-4"}`}
    >
      <header
        className={`shrink-0 border-b border-zinc-200/70 ${
          fillViewport ? "mb-2 pb-2" : "mb-4 pb-3"
        }`}
      >
        <div className="flex min-h-8 items-center gap-3">
          <Link
            href="/"
            className="shrink-0 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            {t.common.backToPortal}
          </Link>
          <span aria-hidden className="h-4 w-px shrink-0 bg-zinc-200" />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h1 className="min-w-0 truncate text-base font-semibold tracking-tight text-zinc-900">
              {title}
            </h1>
            {dataManager ? (
              <div className="shrink-0">
                <DataManager {...dataManager} />
              </div>
            ) : null}
          </div>
          {actions ? (
            <div className="ml-auto shrink-0">{actions}</div>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {description}
          </p>
        ) : null}
      </header>
      <div
        className={
          fillViewport
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : undefined
        }
      >
        {children}
      </div>
    </main>
  );
}
