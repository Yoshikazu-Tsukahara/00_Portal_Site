"use client";

import { isValidElement, useEffect, useState, type ReactNode } from "react";

import DataManager from "@/components/DataManager";
import PrivacyNotice from "@/components/PrivacyNotice";
import type { DataManagerConfig } from "@/lib/localData";
import { LanguageToggle } from "@/i18n";
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
 *   3. page.tsx で `<AppShell isPwa ...>`（standalone 時は言語トグルをヘッダー右に出す）
 *   4. 永続データがあるなら `dataManager` を渡す
 *   5. インストール導線は `afterDataManager` に置く
 * - 例: ランチ貯金、とりあえずキープ、究極確率スロット。
 *
 * ## Type D: 没入型（フルスクリーンのゲームなど）
 * - **AppShell は使わない**。独自ヘッダー + iframe で完全に隔離する。
 * - `SiteChrome` の `ALWAYS_ISOLATE_PATHS` に登録し、常時 Header / Footer なし。
 * - 例: モンスタードライバー。
 *
 * ## モバイル／縦型プレビュー時のヘッダー（全アプリ共通）
 * 1. アプリ名（表示優先。長い場合は `titleShort`）＋ バックアップ ＋ インストール（**文字なし・アイコンのみ**）
 * 2. 説明文
 * 3. プライバシー案内（PrivacyNotice）
 * 4. アプリ機能ボタン（actions）
 *
 * 判定は viewport 幅だけでなく `layoutMode === "portrait"` も見る
 * （表示幅トグルで中身だけ狭いとき用）。
 */
type AppShellProps = {
  /** アプリ名（ヘッダー1行目に表示） */
  title: string;
  /**
   * コンパクト時の短いアプリ名（長い正式名の省略用）。
   * 未指定時は `title` をそのまま使う。
   */
  titleShort?: string;
  /**
   * 短い説明（タイトル下に表示）。
   * どのアプリでも出す前提なので必須。
   */
  description: string;
  /** タイトル直後のコンパクト表示（件数バッジなど） */
  titleAddon?: ReactNode;
  /**
   * 機能アクション（例: 保存、ラベル管理、ZIP生成）。
   * コンパクト時は説明・プライバシー案内の下。PC ではタイトル行右端。
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
   * ヘッダー内のプライバシー案内。
   * - true / 省略: 標準帯を表示（ページ側で PrivacyNotice を置かない）
   * - "plain": 暗いテーマ向け
   * - false: 非表示（ページ独自の案内を出す場合）
   */
  privacyNotice?: boolean | "plain";
  /**
   * true のとき、作業領域を親の残り高さ（Header 直下〜画面下端）いっぱいにする。
   * SiteChrome が Footer をその外に置くため、初期表示ではフッターが見えない。
   */
  fillViewport?: boolean;
  /**
   * ミニゲーム向け：作業領域の最低サイズ（px）。
   * - ウィンドウがこれより大きい → 残り領域いっぱいにきっちり表示
   * - これより小さい → 無理に縮小せず、Header〜Footer を含むページ全体が伸びてスクロール
   * （アプリ枠内だけのスクロールにはしない。`fillViewport` と併用）
   * - スマホ／縦型（compact）では minWidth を適用しない（横スクロール防止）
   */
  minStageSize?: MinStageSize;
  /**
   * @deprecated 表示幅は Header の LayoutToggle（layoutMode）が一元管理する。
   * 互換のため受け取っても幅には影響しない。
   */
  wide?: boolean;
  /**
   * Type C（独立 PWA）として振る舞う。
   * standalone 起動中は言語トグルをヘッダー右に出す。
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
 * ポータルへの戻りはサイト Header の「Blank Note」ロゴで行う。
 */
export default function AppShell({
  title,
  titleShort,
  description,
  titleAddon,
  actions,
  dataManager,
  afterDataManager,
  privacyNotice = true,
  fillViewport = false,
  minStageSize,
  isPwa = false,
  children,
}: AppShellProps) {
  // wide は deprecated（幅は LayoutToggle が管理）。受け取っても無視する。
  const { isStandalone } = useStandaloneDisplay();
  const { contentClassName, layoutMode } = useLayout();
  const [narrowViewport, setNarrowViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrowViewport(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /** 実機スマホ、または表示幅「縦型」 */
  const compact = narrowViewport || layoutMode === "portrait";
  const displayTitle =
    compact && titleShort?.trim() ? titleShort.trim() : title;

  // standalone 起動中はサイト Header が消えるため、シェル側で代替する
  const isStandaloneApp = isPwa && isStandalone;

  const dataManagerNode = dataManager ? (
    isDataManagerConfig(dataManager) ? (
      <DataManager {...dataManager} />
    ) : (
      dataManager
    )
  ) : null;

  const privacyVariant =
    privacyNotice === "plain"
      ? "plain"
      : privacyNotice
        ? "default"
        : null;

  // 背景はフル幅のまま、中身の列だけ layoutMode の幅に揃える
  const fillWithMinStage = Boolean(fillViewport && minStageSize);
  /**
   * 最低ステージ幅は PC 向け。スマホ／縦型では minWidth を付けない
   * （900px 固定だと横スクロールが発生する）
   */
  const enforceMinStage = Boolean(minStageSize) && !compact;

  return (
    <main
      className={`flex w-full max-w-full flex-1 flex-col ${contentClassName} ${
        fillWithMinStage && enforceMinStage
          ? "min-h-full overflow-x-auto py-2"
          : fillViewport
            ? "h-full min-h-0 max-h-full overflow-x-hidden overflow-hidden py-2"
            : "overflow-x-hidden py-4"
      }`}
    >
      <header
        className={`app-shell-header shrink-0 ${
          compact
            ? "app-shell-header--compact"
            : "border-b border-zinc-200/70"
        } ${fillViewport ? "mb-2 pb-2" : compact ? "mb-3 pb-2" : "mb-4 pb-3"}`}
      >
        {/* 1行目: アプリ名 ＋ バックアップ ＋ インストール（コンパクト時はアイコンのみ） */}
        <div className="flex min-h-8 min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <h1
              className="app-shell-title min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-zinc-900"
              title={title}
            >
              {displayTitle}
            </h1>
            {titleAddon ? <div className="shrink-0">{titleAddon}</div> : null}
            {dataManagerNode ? (
              <div className="app-shell-chrome shrink-0">{dataManagerNode}</div>
            ) : null}
            {afterDataManager ? (
              <div className="app-shell-chrome shrink-0">
                {afterDataManager}
              </div>
            ) : null}
          </div>
          {/* PC: 機能ボタンはタイトル行の右端 */}
          {!compact && actions ? (
            <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
              {actions}
            </div>
          ) : null}
          {isStandaloneApp ? (
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <LanguageToggle />
            </div>
          ) : null}
        </div>

        {/* 2行目: 説明文 */}
        <p className="mt-2 break-words text-xs leading-relaxed text-zinc-500">
          {description}
        </p>

        {/* 3行目: プライバシー案内（共通） */}
        {privacyVariant ? (
          <PrivacyNotice
            variant={privacyVariant}
            compact={compact}
            className="mt-2"
          />
        ) : null}

        {/* 4行目（コンパクト時のみ）: アプリ機能ボタン */}
        {compact && actions ? (
          <div className="app-shell-actions mt-2 flex min-w-0 flex-nowrap items-center gap-1.5">
            {actions}
          </div>
        ) : null}
      </header>
      {minStageSize && enforceMinStage ? (
        <div
          className={
            fillViewport
              ? "box-border flex min-h-0 w-full flex-1 flex-col"
              : "box-border w-full"
          }
          style={{
            minWidth: minStageSize.width,
            minHeight: minStageSize.height,
          }}
        >
          {children}
        </div>
      ) : (
        <div
          className={
            fillViewport
              ? // ヘッダー直下の作業領域。子が伸びる場合はここでスクロール、
                // 子が flex-1+内部スクロールなら高さを渡す（min-h-0 が重要）
                "flex min-h-0 w-full max-w-full flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-auto [touch-action:pan-y]"
              : undefined
          }
        >
          {children}
        </div>
      )}
    </main>
  );
}
