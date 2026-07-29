"use client";

import Link from "next/link";
import { isValidElement, type ReactNode } from "react";

import DataManager from "@/components/DataManager";
import type { DataManagerConfig } from "@/lib/localData";
import { LanguageToggle, useI18n } from "@/i18n";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/**
 * アプリのタイプ分類と、AppShell の使い方ルール。
 *
 * ポータル内のページは次の 3 タイプに分かれる。新規アプリはまずどれかを決める。
 *
 * ## Type B: 通常ツール（`/tools/*` など）
 * - AppShell を使う。
 * - サイト共通の Header と **Footer は必ず表示する**。
 * - 1 画面に収めたい場合も `fillViewport` を使うだけで、Footer は隠さない。
 * - LocalStorage を使うなら `dataManager` を渡す。
 * - 例: メールテンプレ管理、PDF編集、テキスト整形。
 *
 * ## Type C: 独立 PWA（ホーム画面から単体起動できるアプリ）
 * - AppShell を `isPwa` 付きで使う。
 * - ブラウザで開いている間は Type B と同じ見た目（Header / Footer あり）。
 * - **PWA として standalone 起動した時だけ** Header / Footer が消える
 *   （非表示の判定は `SiteChrome` 側、シェル内の出し分けは `isPwa` が担当）。
 * - お作法セット:
 *   1. layout.tsx で manifest / themeColor などのメタを宣言
 *   2. layout.tsx に `<PwaRuntime basePath classPrefix />`（SW 登録・活性クラス・履歴ロック）
 *   3. page.tsx で `<AppShell isPwa ...>`（standalone 時は戻るリンクを隠し、言語トグルを出す）
 *   4. 永続データがあるなら `dataManager` を渡す
 *   5. インストール導線は `afterDataManager` に置く
 * - 例: ランチ貯金、とりあえずキープ、究極確率スロット。
 *
 * ## Type D: 没入型（フルスクリーンのゲームなど）
 * - **AppShell は使わない**。独自ヘッダー + iframe で完全に隔離する。
 * - `SiteChrome` の `ALWAYS_ISOLATE_PATHS` に登録し、常時 Header / Footer なし。
 * - 例: モンスタードライバー、投射フリースロー。
 */
type AppShellProps = {
  /** アプリ名（ヘッダー1行目に表示） */
  title: string;
  /**
   * 短い説明（タイトル下に1行で表示）。
   * どのアプリでも出す前提なので必須。
   */
  description: string;
  /** タイトル直後のコンパクト表示（件数バッジなど） */
  titleAddon?: ReactNode;
  /**
   * ヘッダー右端のアクション（例: ZIP生成ボタン）。
   * `isPwa` の standalone 時は、ここに言語トグルが自動で並ぶ。
   */
  actions?: ReactNode;
  /**
   * データ管理（バックアップ）。タイトル右隣に共通配置。
   * - 設定オブジェクトを渡すと共通 DataManager を組み立てる（通常はこちら）
   * - 独自 UI を差し込みたい場合は ReactNode をそのまま渡せる
   */
  dataManager?: DataManagerConfig | ReactNode;
  /**
   * タイトル／バックアップの直後に置くコンパクトな操作
   * （PWA の「ホーム画面に追加」など）
   */
  afterDataManager?: ReactNode;
  /**
   * true のとき、作業領域をほぼ1画面の高さに固定し、
   * 内側のスクロールで完結させる（ページ全体は伸ばさない）。
   * **Footer は隠さない**。画面下までスクロールすれば共通 Footer に到達できる。
   */
  fillViewport?: boolean;
  /**
   * @deprecated 表示幅は Header の LayoutToggle（layoutMode）が一元管理する。
   * 互換のため受け取っても幅には影響しない。
   */
  wide?: boolean;
  /**
   * Type C（独立 PWA）として振る舞う。
   * standalone 起動中は「ポータルに戻る」を隠し、言語トグルをヘッダー右に出す。
   */
  isPwa?: boolean;
  children: ReactNode;
};

/** 設定オブジェクトとして渡されたか（React 要素と区別する） */
function isDataManagerConfig(
  value: DataManagerConfig | ReactNode,
): value is DataManagerConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    !isValidElement(value) &&
    typeof (value as DataManagerConfig).appId === "string"
  );
}

/**
 * Type B / Type C 共通のアプリシェル。
 * 「戻る」とタイトルを1行に収め、余白を最小化した高密度レイアウト。
 *
 * タイプごとの使い分けは上部の JSDoc を参照。
 */
export default function AppShell({
  title,
  description,
  titleAddon,
  actions,
  dataManager,
  afterDataManager,
  fillViewport = false,
  isPwa = false,
  children,
}: AppShellProps) {
  // wide は deprecated（幅は LayoutToggle が管理）。受け取っても無視する。
  const { t } = useI18n();
  const { isStandalone } = useStandaloneDisplay();

  // standalone 起動中はサイト Header が消えるため、シェル側で代替する
  const isStandaloneApp = isPwa && isStandalone;

  const dataManagerNode = dataManager ? (
    isDataManagerConfig(dataManager) ? (
      <DataManager {...dataManager} />
    ) : (
      dataManager
    )
  ) : null;

  // 幅・横 padding は SiteChrome の共通コンテナが担当（ここでは付けない）
  return (
    <main
      className={`flex w-full flex-1 flex-col ${
        fillViewport
          ? // 4.5rem = サイト共通 Header の高さ。作業領域を1画面分だけ確保し、
            // Footer は隠さずその下に続かせる
            "overflow-hidden py-2 min-h-[calc(100dvh-4.5rem)]"
          : "py-4"
      }`}
    >
      <header
        className={`shrink-0 border-b border-zinc-200/70 ${
          fillViewport ? "mb-2 pb-2" : "mb-4 pb-3"
        }`}
      >
        <div className="flex min-h-8 items-center gap-3">
          {!isStandaloneApp ? (
            <>
              <Link
                href="/"
                className="shrink-0 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
              >
                {t.common.backToPortal}
              </Link>
              <span aria-hidden className="h-4 w-px shrink-0 bg-zinc-200" />
            </>
          ) : null}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h1 className="min-w-0 truncate text-base font-semibold tracking-tight text-zinc-900">
              {title}
            </h1>
            {titleAddon ? <div className="shrink-0">{titleAddon}</div> : null}
            {dataManagerNode ? (
              <div className="shrink-0">{dataManagerNode}</div>
            ) : null}
            {afterDataManager ? (
              <div className="shrink-0">{afterDataManager}</div>
            ) : null}
          </div>
          {actions || isStandaloneApp ? (
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {actions}
              {isStandaloneApp ? <LanguageToggle /> : null}
            </div>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          {description}
        </p>
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
