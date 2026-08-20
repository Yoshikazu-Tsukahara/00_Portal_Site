# Blank Note — エージェント向けガイド

個人開発ツールをまとめた Next.js ポータル。**ブラウザ内完結**（LocalStorage、ファイル処理はクライアント側）。  
見た目は「上質な文房具」テイストのデスクトップ型ランチャー。

**アプリ追加・分類の正本 → [`RULEBOOK.md`](./RULEBOOK.md)**  
デザインの正本 → [`design-rules.md`](./design-rules.md)  
AI への定型指示 → `RULEBOOK.md` §8（①参照ルール：… の箇条書き。コロンより右を変える）

## 技術スタック

- Next.js 16 / React 19 / TypeScript / Tailwind CSS 4
- パスエイリアス: `@/*` → `src/*`
- 多言語: `src/i18n/`（10言語、`ja` 定義を正・未訳は `en` フォールバック）
- フォント: タイトル・ロゴ = Space Mono、本文 = Noto Sans JP

## 新規アプリは先にこれを決める

1. **ジャンル**（ライブラリの棚）: business / creators / utilities / minigames
2. **実装タイプ**: B / C-shell / C-install / D
3. **3フラグ**: バックアップ / スマホ / 画面の埋め方

`/tools/*` だから Type B、ではない。詳細とチェックリストは RULEBOOK。

## 主要ディレクトリ

```
src/
├── app/           # 各ツールの page / layout（/ = ホーム、/library = ライブラリ）
├── components/    # AppShell, SiteChrome, icons など共通 UI
├── data/tools.ts  # ジャンルと掲載一覧
├── i18n/          # 共通辞書 + apps/*
└── lib/           # localData, layout, pwa, seo
```

## 全体で揃えること

- 言語スイッチ: サイト Header のみ（standalone 時は AppShell が代行）
- バックアップ: `AppShell` の `dataManager`
- **PWA インストール: ランチ貯金のみ**（他アプリに 📱 を付けない）
- スマホ対応完了後: `tools.ts` で `isMobileSupported: true` または `false`
- ホームピン留め: LocalStorage `blank-note:home-pins`
- UI の短いタイトルと SEO 用 title は別（`src/lib/seo.ts`）

## 作業時の優先参照

1. `RULEBOOK.md`（分類・ジャンル・追加）
2. `design-rules.md`（見た目）
3. 触っているファイルの近傍コード
4. `.cursor/rules/`（UI は `ui-ux.mdc`、追加は `new-app.mdc`）
5. 新規ツール → `.cursor/skills/add-new-tool/SKILL.md`
6. 既存のスマホ対応 → `.cursor/skills/mobile-responsive/SKILL.md`

## やらないこと

- サーバー API・DB 追加（例外は RULEBOOK に書いたものだけ）
- ユーザー未依頼の git commit / push
- 依頼範囲外の大規模リファクタ
- 依頼されていない例外の「ついで解消」
- ユーザー向け説明・コメント以外の英語混在（UI の en 辞書は除く）

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
