---
name: mobile-responsive
description: >-
  既存アプリをモバイルファーストでレスポンシブ化する手順。スマホ対応、縦長画面、
  AppShell ヘッダー整理、タップ領域、横スクロール防止、isMobileSupported バッジ、
  「メールテンプレと同じスマホ対応を〇〇に」などの依頼時に使用する。
---

# 既存アプリのスマホ対応ワークフロー

共通ルールの正本: `.cursor/rules/ui-ux.mdc`  
完成例（コピー元）: `src/app/tools/mail-template/`

## ユーザーへの確認（未指定時）

1. 対象アプリ（パス）
2. PWA インストールボタンも付けるか（Type C 化が必要）
3. ポータルに `isMobileSupported: true` を付けるか（通常は対応完了後に Yes）

## Step 1: 現状把握

対象ディレクトリを読み、次を洗い出す:

- 複数カラム（`grid-cols-2` / `flex-row` 固定）
- AppShell の `actions` に LanguageToggle / 巨大ボタンがないか
- `wide` prop の残骸
- ホバー依存の操作ボタン
- 横はみ出ししそうな `truncate` 不足・固定幅

## Step 2: AppShell ヘッダー（共通実装済みの前提）

`AppShell` 自体はスマホ用2段レイアウト済み。**ページ側でやること:**

```tsx
<AppShell
  title={copy.shell.title}
  description={copy.shell.description}
  fillViewport          // 1画面ツールなら
  isPwa                 // インストールするなら
  dataManager={...}     // 永続データがあるなら
  afterDataManager={<InstallAppButton copy={copy.install} />}
  actions={/* 機能ボタンのみ・1行コンパクト */}
>
```

- `actions` に言語・バックアップ・インストールを入れない
- インストールを付けるなら Type C セット（下記 Step 5）

## Step 3: actions を1行コンパクトに

```tsx
actions={
  <div className="flex w-full max-w-full flex-nowrap items-center gap-1 sm:gap-2 md:w-auto md:justify-end">
    <button
      type="button"
      className="btn-secondary min-w-0 flex-1 !px-2 !py-1.5 text-[11px] leading-tight active:scale-[0.98] active:bg-zinc-100 sm:flex-none sm:!px-3 sm:text-sm"
    >
      <span className="sm:hidden">{copy.actions.fooShort}</span>
      <span className="hidden sm:inline">{copy.actions.foo}</span>
    </button>
    {/* 同様に他ボタン。primary も flex-1 / sm:flex-none */}
  </div>
}
```

i18n に Short ラベルを ja/en 両方追加する。

## Step 4: 本体レイアウトのレスポンシブ化

| パターン | 方針 |
|----------|------|
| 左右2カラム | `grid-cols-1 md:grid-cols-[…]`。スマホは縦スクロール可でも可 |
| 入力グリッド | `grid-cols-1 sm:grid-cols-2` |
| 余白 | `p-2 md:p-4` など段階付け |
| オーバーフロー | 親に `min-w-0 w-full max-w-full overflow-x-hidden` |
| 長文 | `break-words` |
| リスト操作 | ピン／編集等をスマホでも常時表示 + `active:` |
| モーダル | `items-end`（スマホ）/ `sm:items-center`、閉じる・保存は `min-h-11` 可 |

`fillViewport` 時: 外側 `overflow-y-auto md:overflow-hidden`、各パネルに `min-h-0`。

## Step 5: PWA インストール（依頼時のみ）

参照: `mail-template` または `lunch-savings`

1. `pwaManifest.ts`（**`manifest.ts` という名前は使わない**）
2. `manifest.webmanifest/route.ts` → `@/app/.../pwaManifest` を import
3. `layout.tsx` + `<PwaRuntime basePath classPrefix />`
4. `public/.../sw.js` + icons
5. `InstallAppButton` / `usePwaInstall` /（任意）`InstallGuideModal`
6. `SiteChrome.tsx` の `STANDALONE_APP_PATHS` にパス追加
7. 辞書に `install`（`buttonTiny` 含む）
8. Install ボタンは **DataManager と同じ高さ**（`min-h-11` を付けない）

## Step 6: ポータルバッジ

`src/data/tools.ts` の該当 tool に:

```ts
isMobileSupported: true,
```

## Step 7: 検証

- 狭い幅（〜375px）: タイトル行・actions 1行・横スクロールなし
- 💾 と 📱 の高さが揃う
- `md` 以上: 戻るリンク＋従来レイアウト
- `npm run lint`（対象ファイル）

## ユーザーへの指示例（コピペ用）

```
〇〇アプリを、メールテンプレと同じ方針でスマホ対応して。
ルールは .cursor/rules/ui-ux.mdc と skill mobile-responsive に従う。
```

オプション例:

- 「PWA インストールも付ける」
- 「バッジ（isMobileSupported）も付ける」
- 「ヘッダー周りだけでよい／本体レイアウトまで」

## やらないこと

- AppShell / Header / DataManager の配置ルールをアプリ独自に崩す
- サイト Header があるのに LanguageToggle を AppShell に置く
- 依頼されていないアプリまで一括改修する
