# Blank Note — エージェント向けガイド

個人開発ツールをまとめた Next.js ポータルサイト。**ブラウザ内完結**（LocalStorage、ファイル処理はクライアント側）が基本方針。  
見た目は「上質な文房具」テイストのデスクトップ型ランチャー（OS 風ツールボックス）。

デザイン原則の正本 → [`design-rules.md`](./design-rules.md)

## 技術スタック

- Next.js 16 / React 19 / TypeScript / Tailwind CSS 4
- パスエイリアス: `@/*` → `src/*`
- 多言語: `src/i18n/`（9言語、`ja` 定義を正・未訳は `en` フォールバック）
- フォント: タイトル・ロゴ = Space Mono、本文 = Noto Sans JP

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
├── app/           # 各ツールの page / layout / ロジック（/ = ホーム、/library = ライブラリ）
├── components/    # AppShell, SiteChrome, icons, LocalOnlyBadge など共通 UI
├── data/tools.ts  # ポータル掲載一覧（id / icon / href）
├── i18n/          # 共通辞書 + apps/*（ツール別 UI 文言）
└── lib/           # localData, layout, pwa など共通基盤
```

## UI/UX の統一（全アプリ共通）

- デザイン基調: Blank Note（背景 `#f8f8ff`、アクセント `#ccd5ff`、シャープな 1px ボーダー）
- 表示幅: Header の LayoutToggle + `useLayout().contentClassName`
- **言語スイッチ**: サイト Header のみ（PWA standalone 時は AppShell が代行）
- **バックアップ**: `AppShell` の `dataManager`（タイトル横 💾）
- **PWA インストール**: `AppShell` の `afterDataManager`（バックアップ右隣 📱）
- **スマホ／縦型 AppShell**: 1行目=タイトル+💾+📱（アイコンのみ）→ 説明 → プライバシー案内 → 機能ボタン。ポータルへ戻るのはサイト Header のロゴ
- **スマホ対応完了アプリ**: `src/data/tools.ts` で `isMobileSupported: true`
- **ホームピン留め**: LocalStorage `blank-note:home-pins`

詳細 → `.cursor/rules/ui-ux.mdc`  
既存アプリへの適用手順 → `.cursor/skills/mobile-responsive/SKILL.md`

## 作業時の優先参照

1. `design-rules.md`（デザインの正本）
2. 触っているファイルの近傍コード（既存パターンに合わせる）
3. `.cursor/rules/` の該当ルール（UI 変更時は `ui-ux.mdc`）
4. 新規ツール追加時 → `.cursor/skills/add-new-tool/SKILL.md`
5. 既存アプリのスマホ対応 → `.cursor/skills/mobile-responsive/SKILL.md`

## やらないこと

- サーバー API・DB 追加（このプロジェクトの範囲外）
- ユーザー未依頼の git commit / push
- 依頼範囲外の大規模リファクタ
- ユーザー向け説明・コメント以外の英語混在（UI 文言の en 辞書は除く）

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
