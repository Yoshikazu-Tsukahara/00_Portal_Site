/**
 * 独立 PWA（AppShell の Type C）のお作法をまとめるための設定。
 * アプリごとに 1 か所（layout.tsx の PwaRuntime）だけで指定する。
 */
export type PwaAppConfig = {
  /**
   * アプリのルートパス（例: "/lunch-savings"）。
   * Service Worker は `${basePath}/sw.js` を `${basePath}/` スコープで登録する。
   */
  basePath: string;
  /**
   * html / body に付けるアプリ固有クラスの接頭辞（例: "lunch"）。
   * `${classPrefix}-app-active` と `${classPrefix}-pwa-standalone` が付く。
   * 共通の挙動は shared クラス側が担うので、ここはアプリ固有の微調整用。
   */
  classPrefix: string;
  /**
   * スクロールのバウンスをどこまで抑えるか。
   * - "soft": 端のバウンスだけ抑える（ツール系の既定）
   * - "hard": 縦横ともバウンスを止める（ゲーム系）
   */
  scrollLock?: PwaScrollLock;
};

export type PwaScrollLock = "soft" | "hard";
