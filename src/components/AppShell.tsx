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
 * タイプ分類の正本はルートの `RULEBOOK.md`。
 *
 * - B: AppShell。PwaRuntime なし
 * - C-shell: `isPwa` + layout の PwaRuntime（SW オフ）+ SiteChrome STANDALONE_APP_PATHS
 * - C-install: ランチ貯金のみ。SW + 📱（`afterDataManager`）
 * - D: AppShell を使わない。ALWAYS_ISOLATE_PATHS
 *
 * `/tools/*` でも C-shell がありうる。fillViewport を付けたら FILL_VIEWPORT_PATHS も更新。
 *
 * コンパクト時ヘッダー: タイトル + 💾 +（ランチ貯金のみ）📱 → 説明 → プライバシー案内 → actions
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
   * タイトル／バックアップの直後に置くコンパクトな操作。
   * PWA「ホーム画面に追加」はランチ貯金のみ渡す（他アプリでは未使用）。
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
  const { contentClassName } = useLayout();
  const [narrowViewport, setNarrowViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrowViewport(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /** 実機スマホ（狭い viewport） */
  const compact = narrowViewport;
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
            : // overflow-x: hidden は overflow-y を auto に変えて内部縦スクロールを誘発するため clip を使う
              "overflow-x-clip py-4"
      }`}
    >
      <header
        className={`app-shell-header shrink-0 ${
          compact
            ? "app-shell-header--compact"
            : "border-b border-zinc-200/70"
        } ${fillViewport ? "mb-2 pb-2" : compact ? "mb-3 pb-2" : "mb-4 pb-3"}`}
      >
        {/* 1行目: タイトル直後にバックアップ／インストール（全アプリ共通）。機能ボタンは右端 */}
        <div className="flex min-h-8 min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <h1
              className="app-shell-title min-w-0 shrink truncate text-base font-semibold tracking-tight text-zinc-900"
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
