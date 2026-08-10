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
2. Type C（独立 PWA）化が必要か（※インストールボタンはランチ貯金以外付けない）
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
  isPwa                 // Type C なら（インストールボタンは付けない）
  dataManager={...}     // 永続データがあるなら
  actions={/* 機能ボタンのみ・1行コンパクト */}
>
```

- `actions` に言語・バックアップ・インストールを入れない
- インストールボタンはランチ貯金以外に付けない

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
| 長文・多いリスト | `.app-nested-scroll`（`max-h-[60vh]` + `overflow-y-auto` + `overscroll-auto`）。画面を埋め尽くさない |
| 長文 | `break-words` |
| リスト操作 | ピン／編集等をスマホでも常時表示 + `active:` |
| モーダル | `items-end`（スマホ）/ `sm:items-center`、閉じる・保存は `min-h-11` 可 |

`fillViewport` 時: AppShell 作業領域は `overflow-y-auto overscroll-auto`。内部スクロールは端で親へチェーン（`overscroll-contain` 禁止）。

## Step 5: PWA（Type C・依頼時のみ）

参照: `lunch-savings`（独立 PWA の型）。**インストールボタンはランチ貯金以外に付けない。**

1. `pwaManifest.ts`（**`manifest.ts` という名前は使わない**）
2. `manifest.webmanifest/route.ts` → `@/app/.../pwaManifest` を import
3. `layout.tsx` + `<PwaRuntime basePath classPrefix />`
4. `public/.../sw.js` + icons
5. `SiteChrome.tsx` の `STANDALONE_APP_PATHS` にパス追加
6. `InstallAppButton` は渡さない（サイト方針）

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

- 「バッジ（isMobileSupported）も付ける」
- 「ヘッダー周りだけでよい／本体レイアウトまで」
（※ インストールボタンはランチ貯金以外付けない）

## やらないこと

- AppShell / Header / DataManager の配置ルールをアプリ独自に崩す
- サイト Header があるのに LanguageToggle を AppShell に置く
- 依頼されていないアプリまで一括改修する
