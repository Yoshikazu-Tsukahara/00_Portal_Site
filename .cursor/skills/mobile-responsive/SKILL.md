---
name: mobile-responsive
description: >-
  既存アプリをモバイルファーストでレスポンシブ化する手順。スマホ対応、縦長画面、
  AppShell ヘッダー整理、タップ領域、横スクロール防止、isMobileSupported バッジ、
  「メールテンプレと同じスマホ対応を〇〇に」などの依頼時に使用する。
---

# 既存アプリのスマホ対応ワークフロー

分類の正本: `RULEBOOK.md`  
UI 細部: `.cursor/rules/ui-ux.mdc`  
完成例（コピー元）: `src/app/tools/mail-template/`（タイプは C-shell）

## ユーザーへの確認（未指定時）

1. 対象アプリ（パス）
2. Type C-shell 化が必要か（インストールボタンはランチ貯金以外付けない）
3. `isMobileSupported` を true にするか false のままにするか（未設定で放置しない）

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
  isPwa                 // C-shell / C-install なら（インストールボタンは付けない）
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

## Step 5: PWA（C-shell・依頼時のみ）

**インストールボタンはランチ貯金以外に付けない。** SW / manifest も C-install 以外は付けない。

1. `layout.tsx` + `<PwaRuntime basePath classPrefix />`（`enableServiceWorker` なし）
2. `page.tsx` で `<AppShell isPwa>`
3. `SiteChrome.tsx` の `STANDALONE_APP_PATHS` にパス追加

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

正本は `RULEBOOK.md` §8。コロンより右だけ変える。

```
①参照ルール：RULEBOOK.md
②デザイン：design-rules.md
③方針：スマホ対応
⑥対象：/tools/mail-template
⑧やること：メールテンプレと同じ方針でモバイルファーストにする
⑩スマホ：対応する
⑬やらないこと：インストール UI を付けない。依頼範囲外は触らない
```

## やらないこと

- AppShell / Header / DataManager の配置ルールをアプリ独自に崩す
- サイト Header があるのに LanguageToggle を AppShell に置く
- 依頼されていないアプリまで一括改修する
