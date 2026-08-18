---
name: add-new-tool
description: Blank Note Portal に新規ツールまたは独立 PWA を追加する手順。新規アプリ作成、/tools 配下の追加、ポータル掲載、i18n 辞書登録、AppShell 統合、PWA 設定の依頼時に使用する。
---

# 新規ツール追加ワークフロー

正本: ルートの `RULEBOOK.md`（ジャンル別ルール・例外・チェックリスト）。

## 事前確認（未指定なら聞く）

1. **ジャンル**: business / creators / utilities / minigames
2. **タイプ**: B / C-shell / C-install / D（C-install は原則ランチ貯金のみ）
3. バックアップが必要か
4. スマホ対応までやるか（`isMobileSupported` は true/false 必須）
5. ライブラリに掲載するか

## Step 1: コピー元

| 用途 | コピー元 |
|------|----------|
| B シンプル | `src/app/tools/text-cleaner/` |
| B ファイル処理 | `src/app/tools/media-metadata-editor/` |
| B キャンバス | `src/app/tools/character-relation-editor/` |
| C-shell（枠だけ standalone） | `src/app/palette-collector/` または `link-stocker/` |
| C-shell ファイル作業 | `src/app/tools/pdf-editor/` |
| C-shell ミニゲーム舞台 | `src/app/pixel-drop-puzzle/` |
| C-install | `src/app/lunch-savings/`（📱 はコピーしない） |
| D 没入 | `src/app/monster-driver/` |

メールテンプレはスマホ UI の完成例。タイプは C-shell。

## Step 2: ファイル

- `page.tsx`: `"use client"`, `AppShell`, `useI18n`, `ready` 待ち（D 以外）
- `layout.tsx`: `pageMetadata` + `TOOL_SEO`（C なら `PwaRuntime`）
- ロジックは `types.ts` / `storage.ts` / 機能別 `.tsx`
- import 順: React → `@/components` → `@/i18n` → `@/lib` → 相対

パス既定: business・creators は `/tools/<id>`、utilities・minigames は `/<id>`。

## Step 3: i18n

1. `src/i18n/apps/<camelCase>.ts` — 型, `*Ja`, `*En`, `shell`
2. `src/i18n/apps/index.ts`
3. `src/i18n/ja.ts` / `en.ts` の `tools.<kebab-id>`
4. 他言語は en フォールバック可

## Step 4: 掲載と SEO

- `src/data/tools.ts` のジャンルに追加。`isMobileSupported` を必ず付ける
- `src/lib/seo.ts` の `TOOL_SEO`（sitemap は tools.ts から自動）
- アイコン / カバーを置くなら `TOOLS_WITH_STATIC_*` にも追加

## Step 5: 共通 UI

- 言語: Header のみ
- バックアップ: `dataManager`
- インストール: 付けない
- 幅: `contentClassName` / 必要なら `fillViewport`（**SiteChrome 配列も同時更新**）
- C-shell: `isPwa` + `STANDALONE_APP_PATHS`
- スマホ: skill `mobile-responsive`

## Step 6: 検証

```bash
npm run lint
```

ポータルリンク、言語切替、バックアップ（あれば）、タブ title が SEO 用になっていること。

## 報告に含める

- 選んだジャンルとタイプ、その理由
- 追加したパス
- SiteChrome を更新した配列
- 手動確認してほしい項目

## ユーザーが貼る定型文

正本は `RULEBOOK.md` §8。コロンより右だけ変える。

```
①参照ルール：RULEBOOK.md
②デザイン：design-rules.md
③方針：新規
④ジャンル：業務効率化
⑤タイプ：B
⑥対象：
⑦名前：
⑧やること：
⑨バックアップ：必要
⑩スマホ：対応する
⑪画面：ページスクロール
⑫掲載：ライブラリに出す
⑬やらないこと：範囲外のリファクタ・例外のついで解消・commit。ランチ貯金以外にインストール UI を付けない
```
