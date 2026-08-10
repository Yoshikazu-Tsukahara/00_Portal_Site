---
name: add-new-tool
description: Blank Note Portal に新規ツールまたは独立 PWA を追加する手順。新規アプリ作成、/tools 配下の追加、ポータル掲載、i18n 辞書登録、AppShell 統合、PWA 設定の依頼時に使用する。
---

# 新規ツール追加ワークフロー

## 事前確認

ユーザーに未指定なら確認:

1. タイプ B（/tools）/ C（PWA）/ D（没入型）のどれか
2. ポータル一覧に掲載するか
3. LocalStorage / バックアップが必要か

## 手順

### Step 1: 参照テンプレートを選ぶ

| タイプ | コピー元 |
|--------|----------|
| B: シンプルツール | `src/app/tools/text-cleaner/` |
| B: マスタデータ + モーダル | `src/app/tools/mail-template/` |
| B: ファイル処理 | `src/app/tools/pdf-editor/` または `media-metadata-editor/` |
| C: 独立 PWA | `src/app/lunch-savings/` |

### Step 2: ファイル作成

- `page.tsx`: `"use client"`, `AppShell`, `useI18n`, `ready` 待ち
- ロジックは `types.ts` / `storage.ts` / 機能別 `.tsx` に分割
- 既存 import 順: React → `@/components` → `@/i18n` → `@/lib` → 相対 import

### Step 3: i18n

1. `src/i18n/apps/<name>.ts` — 型, `*Ja`, `*En`, `shell`, UI 文案
2. `src/i18n/apps/index.ts` — 型と export に追加
3. `src/i18n/ja.ts` / `en.ts` — `tools.<kebab-id>` にカード文言

### Step 4: ポータル掲載（必要時）

`src/data/tools.ts` の適切な genre に `{ id, icon, href }` を追加。

### Step 5: 共通 UI 配置（`.cursor/rules/ui-ux.mdc`）

- 言語: **Header のみ**（AppShell に LanguageToggle を足さない）
- バックアップ: `dataManager`（タイトル横）
- PWA インストール: **付けない**（サイト方針でランチ貯金のみ表示）
- 幅: `useLayout().contentClassName` / `fillViewport`
- スマホ対応: skill `mobile-responsive`（完成例は `mail-template`）
- 対応済みなら `tools.ts` に `isMobileSupported: true`

### Step 6: PWA（Type C のみ）

- `layout.tsx` + `PwaRuntime`
- manifest + icons（`lunch-savings` を参照）
- `page.tsx` で `<AppShell isPwa ... />`（**InstallAppButton は付けない**）

### Step 7: 検証

```bash
npm run lint
npm run build
```

ブラウザで: ポータルリンク、言語切替、データ保存/復元（あれば）。

## 出力

作業完了報告に含める:

- 追加したパス一覧
- 選んだタイプと理由
- 手動確認してほしい項目
