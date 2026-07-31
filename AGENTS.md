# My Tool Box Portal — エージェント向けガイド

個人開発ツールをまとめた Next.js ポータルサイト。**ブラウザ内完結**（LocalStorage、ファイル処理はクライアント側）が基本方針。

## 技術スタック

- Next.js 16 / React 19 / TypeScript / Tailwind CSS 4
- パスエイリアス: `@/*` → `src/*`
- 多言語: `src/i18n/`（ja / en、日本語定義を正とする）

## アプリの分類（新規追加時は最初に決める）

| タイプ | パス例 | AppShell | 備考 |
|--------|--------|----------|------|
| **B: 通常ツール** | `/tools/*` | あり（Footer 表示） | 業務・クリエイター向けツール |
| **C: 独立 PWA** | `/lunch-savings` 等 | `isPwa` 付き | layout + PwaRuntime + manifest |
| **D: 没入型** | `/monster-driver` 等 | なし | `SiteChrome.ALWAYS_ISOLATE_PATHS` に登録 |

詳細ルールは `src/components/AppShell.tsx` 先頭コメントを参照。

## 主要ディレクトリ

```
src/
├── app/           # 各ツールの page / layout / ロジック
├── components/    # AppShell, SiteChrome, DataManager など共通 UI
├── data/tools.ts  # ポータル掲載一覧（id / icon / href）
├── i18n/          # 共通辞書 + apps/*（ツール別 UI 文言）
└── lib/           # localData, layout, pwa など共通基盤
```

## UI/UX の統一（全アプリ共通）

- デザイン基調: zinc ミニマル（`globals.css` の `btn-primary` 等）
- 表示幅: Header の LayoutToggle + `useLayout().contentClassName`
- **言語スイッチ**: サイト Header のみ（PWA standalone 時は AppShell が代行）
- **バックアップ**: `AppShell` の `dataManager`（タイトル横 💾）
- **PWA インストール**: `AppShell` の `afterDataManager`（バックアップ右隣 📱）
- **スマホ AppShell**: 1行目=タイトル+💾+📱／2行目=機能ボタン。「ポータルに戻る」はスマホ非表示
- **スマホ対応完了アプリ**: `src/data/tools.ts` で `isMobileSupported: true`

詳細 → `.cursor/rules/ui-ux.mdc`  
既存アプリへの適用手順 → `.cursor/skills/mobile-responsive/SKILL.md`

## 作業時の優先参照

1. 触っているファイルの近傍コード（既存パターンに合わせる）
2. `.cursor/rules/` の該当ルール（UI 変更時は `ui-ux.mdc`）
3. 新規ツール追加時 → `.cursor/skills/add-new-tool/SKILL.md`
4. 既存アプリのスマホ対応 → `.cursor/skills/mobile-responsive/SKILL.md`

## やらないこと

- サーバー API・DB 追加（このプロジェクトの範囲外）
- ユーザー未依頼の git commit / push
- 依頼範囲外の大規模リファクタ
- ユーザー向け説明・コメント以外の英語混在（UI 文言の en 辞書は除く）

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
