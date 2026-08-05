"use client";

import Link from "next/link";
import { isValidElement, type ReactNode } from "react";

import DataManager from "@/components/DataManager";
import type { DataManagerConfig } from "@/lib/localData";
import { LanguageToggle, useI18n } from "@/i18n";
import { useLayout } from "@/lib/layout";
import type { MinStageSize } from "@/lib/minigameStage";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/**
 * アプリのタイプ分類と、AppShell の使い方ルール。
 *
 * ポータル内のページは次の 3 タイプに分かれる。新規アプリはまずどれかを決める。
 *
 * ## Type B: 通常ツール（`/tools/*` など）
 * - AppShell を使う。
 * - サイト共通の Header と **Footer は必ず表示する**。
 * - 1 画面に収めたい場合も `fillViewport` を使う（Footer は画面外のすぐ下に続く）。
 * - ミニゲームは `fillViewport` + `minStageSize` で、広いときはぴったり埋め、
 *   狭いときは最低サイズを保ったままスクロールする。
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
 * - 例: モンスタードライバー。
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
   * 機能アクション（例: ラベル管理、ZIP生成）。
   * スマホではタイトル行の下に折り返し、md 以上ではタイトル行右端に並ぶ。
   * `isPwa` の standalone 時は、ここに言語トグルが自動で並ぶ。
   */
  actions?: ReactNode;
  /**
   * データ管理（バックアップ）。タイトル右隣に共通配置。
   * - 設定オブジェクトを渡すと共通 DataManager を組み立てる（通常はこちら）
   * - 独自 UI を差し込みたい場合は ReactNode をそのまま渡える
   */
  dataManager?: DataManagerConfig | ReactNode;
  /**
   * タイトル／バックアップの直後に置くコンパクトな操作
   * （PWA の「ホーム画面に追加」など）
   */
  afterDataManager?: ReactNode;
  /**
   * true のとき、作業領域を親の残り高さ（Header 直下〜画面下端）いっぱいにする。
   * SiteChrome が Footer をその外に置くため、初期表示ではフッターが見えない。
   */
  fillViewport?: boolean;
  /**
   * ミニゲーム向け：作業領域の最低サイズ（px）。
   * - ウィンドウがこれより大きい → 残り領域いっぱいにきっちり表示
   * - これより小さい → 無理に縮小せず、スクロールで最低サイズを確保
   * `fillViewport` と併用するのが基本。
   */
  minStageSize?: MinStageSize;
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
 *
 * スマホ:
 * 1行目 = タイトル + バックアップ + インストール
 * 2行目 = その他アクション（ある場合）
 * 「ポータルに戻る」は出さない（サイト Header のロゴで戻れる）
 *
 * PC（md+）:
 * 戻るリンク + タイトル行にアクションを横並び
 */
export default function AppShell({
  title,
  description,
  titleAddon,
  actions,
  dataManager,
  afterDataManager,
  fillViewport = false,
  minStageSize,
  isPwa = false,
  children,
}: AppShellProps) {
  // wide は deprecated（幅は LayoutToggle が管理）。受け取っても無視する。
  const { t } = useI18n();
  const { isStandalone } = useStandaloneDisplay();
  const { contentClassName } = useLayout();

  // standalone 起動中はサイト Header が消えるため、シェル側で代替する
  const isStandaloneApp = isPwa && isStandalone;

  const dataManagerNode = dataManager ? (
    isDataManagerConfig(dataManager) ? (
      <DataManager {...dataManager} />
    ) : (
      dataManager
    )
  ) : null;

  // 背景はフル幅のまま、中身の列だけ layoutMode の幅に揃える
  // fillViewport: SiteChrome が確保した「Header 直下〜画面下端」を埋める
  // minStageSize あり: 横は必要ならスクロール（overflow-x-auto）
  return (
    <main
      className={`flex w-full flex-1 flex-col ${contentClassName} ${
        fillViewport
          ? `h-full min-h-0 max-h-full overflow-y-hidden py-2 ${
              minStageSize ? "overflow-x-auto" : "overflow-x-hidden"
            }`
          : "overflow-x-hidden py-4"
      }`}
    >
      <header
        className={`shrink-0 border-b border-zinc-200/70 ${
          fillViewport ? "mb-2 pb-2" : "mb-4 pb-3"
        }`}
      >
        {/* 1行目: タイトル + バックアップ + インストール（＋ PC 時は戻る／actions） */}
        <div className="flex min-h-8 min-w-0 items-center gap-2 sm:gap-3">
          {!isStandaloneApp ? (
            <>
              <Link
                href="/"
                className="hidden shrink-0 text-sm text-zinc-500 transition-colors hover:text-zinc-900 md:inline"
              >
                {t.common.backToPortal}
              </Link>
              <span
                aria-hidden
                className="hidden h-4 w-px shrink-0 bg-zinc-200 md:block"
              />
            </>
          ) : null}
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            {/* flex-1 を付けない：バックアップ／インストールをタイトル直後に置く */}
            <h1 className="min-w-0 shrink truncate text-base font-semibold tracking-tight text-zinc-900">
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
          {/* PC: 機能ボタンはタイトル行の右端 */}
          {actions ? (
            <div className="ml-auto hidden min-w-0 shrink-0 items-center gap-2 md:flex">
              {actions}
            </div>
          ) : null}
          {isStandaloneApp ? (
            <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-2">
              <LanguageToggle />
            </div>
          ) : null}
        </div>

        {/* 2行目（スマホのみ）: ラベル管理など機能アクション */}
        {actions ? (
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5 md:hidden">
            {actions}
          </div>
        ) : null}

        <p className="mt-1 break-words text-xs leading-relaxed text-zinc-500">
          {description}
        </p>
      </header>
      {minStageSize ? (
        // スクロール親：短いウィンドウでもシェル見出しは固定し、作業領域だけスクロール
        <div
          className={
            fillViewport
              ? "min-h-0 flex-1 overflow-auto"
              : "overflow-x-auto"
          }
        >
          <div
            className={
              fillViewport
                ? "box-border flex w-full flex-col"
                : "box-border w-full"
            }
            style={{
              minWidth: minStageSize.width,
              // 大きい窓: 親いっぱいに広げる / 小さい窓: 最低高を確保してスクロール
              ...(fillViewport
                ? { height: `max(100%, ${minStageSize.height}px)` }
                : {}),
            }}
          >
            {children}
          </div>
        </div>
      ) : (
        <div
          className={
            fillViewport
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : undefined
          }
        >
          {children}
        </div>
      )}
    </main>
  );
}
