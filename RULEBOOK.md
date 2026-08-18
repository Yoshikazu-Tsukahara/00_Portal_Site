# Blank Note ルールブック

新規アプリ追加・改修の**正本**。迷ったらこの順で読む。

1. この文書（分類・ジャンル・追加手順）
2. [`design-rules.md`](./design-rules.md)（見た目）
3. 触っているファイルの近傍コード
4. `.cursor/rules/`（作業中だけ効く短い規則）
5. `.cursor/skills/`（手順のチェックリスト）

デザインの色・余白・フォントは `design-rules.md` が正。ここは「何を・どの棚に・どの型で作るか」。

---

## 0. 最初に決めること（この順）

ユーザーが未指定なら、実装前に確認する。自分で決めない。

| 順 | 決めること | 選択肢 |
|----|------------|--------|
| 1 | **ジャンル** | `business` / `creators` / `utilities` / `minigames` |
| 2 | **実装タイプ** | B / C-shell / C-install / D |
| 3 | **3フラグ** | バックアップ / スマホ対応 / 画面の埋め方 |
| 4 | **掲載** | ライブラリに出すか（出さないなら理由を残す） |

ジャンルは「ライブラリの棚」。タイプは「サイト枠と PWA の作り方」。**直交する。ジャンルだけではタイプは決まらない。**

---

## 1. 全体共通（全ジャンル）

### 方針

- ブラウザ内完結。永続化は LocalStorage（`src/lib/localData/`）
- サーバー API・DB・外部送信は原則追加しない（例外はジャンル節と該当アプリに明記）
- UI 文言は i18n。`ja` が正、未訳は `en` フォールバック
- 言語スイッチはサイト Header のみ（standalone 時だけ AppShell が代行）
- **PWA インストール UI（📱）はランチ貯金だけ**。他アプリに付けない
- 未依頼の commit / push、依頼外リファクタはしない
- 説明・コメントは日本語

### 画面上の短い名前と、裏側の SEO は別物

- AppShell の `title` / カードタイトルは短いデザイン名のまま
- タブ・OGP は `src/lib/seo.ts` の長い検索向け文面
- UI 文言を SEO 用に伸ばさない

### AppShell（Type B / C）

```
コンパクト: タイトル | 💾 |（ランチ貯金のみ）📱 → 説明 → プライバシー案内 → 機能ボタン
PC:         タイトル | 💾 |（ランチ貯金のみ）📱 | 機能ボタン → 説明 → プライバシー案内
```

- `title` と `description` は必須（辞書の `shell`）
- 言語・バックアップ・インストールを `actions` に置かない
- バックアップは `dataManager` のみ
- 幅は `useLayout().contentClassName`（`wide` は使わない）
- 「ポータルに戻る」は出さない（Header のロゴで戻る）

### スマホ

- モバイルファースト。複数カラムは縦 → `md:` / `lg:` で横
- 対応完了後だけ `tools.ts` に `isMobileSupported: true`（未設定はバッジなし、`false` は PC推奨）
- 手順は `.cursor/skills/mobile-responsive/SKILL.md`

---

## 2. 実装タイプ

`/tools/*` だから Type B、とは限らない。パスはジャンル節を見る。

| タイプ | 意味 | AppShell | サイト枠 | PwaRuntime | Service Worker | インストール |
|--------|------|----------|----------|------------|----------------|--------------|
| **B** | ポータル内ツール | あり | 常時 Header / Footer | なし | なし | なし |
| **C-shell** | standalone 時だけ枠を外す | `isPwa` | ブラウザでは B と同じ。standalone だけ外す | あり（SW オフ） | なし | なし |
| **C-install** | 端末に置ける独立 PWA | `isPwa` | C-shell と同じ | あり（`enableServiceWorker`） | あり + manifest | **ランチ貯金のみ** |
| **D** | 没入型 | **なし** | 常時なし | なし | なし | なし |

### Type B

- 例: テキスト掃除、フォルダ生成、小説相関図、紙面エディタ、メディアタグ
- `fillViewport` は「1画面に収めたい」ときだけ。長いフォームはページスクロール
- 参照: `src/app/tools/text-cleaner/`（シンプル）、`media-metadata-editor/`（ファイル）

### Type C-shell

- 例: メールテンプレ、PDF編集、画像圧縮、配色パレット、リンクキープ、ミニゲーム掲載4本
- 必須: `layout.tsx` の `<PwaRuntime basePath classPrefix />`（`enableServiceWorker` は付けない）
- 必須: `<AppShell isPwa>`
- 必須: `SiteChrome` の `STANDALONE_APP_PATHS` にパスを足す（`isPwa` だけだと枠が外れない）
- manifest / SW / インストールボタンは付けない
- 参照: `src/app/palette-collector/` または `src/app/link-stocker/`
- メールテンプレは UI の完成例だが、タイプは C-shell

### Type C-install

- **新規では原則作らない。** ユーザーが明示したときだけ
- 現行の唯一の対象: ランチ貯金
- `enableServiceWorker` + `public/<id>.webmanifest` + `InstallAppButton` を `afterDataManager` へ
- BIP（インストール催促）は `/lunch-savings` 以外で握らない
- 参照: `src/app/lunch-savings/`（インストール部分はコピーしない）

### Type D

- 例: モンスター運転
- `ALWAYS_ISOLATE_PATHS` に登録。独自ヘッダー + iframe
- ライブラリ非掲載でもルートは残してよい（現行のモンスター運転）

---

## 3. 画面の埋め方

page の `fillViewport` と `SiteChrome` の配列は**同じ判定**にする。片方だけ変えない。

| 埋め方 | page | SiteChrome |
|--------|------|------------|
| ページ全体が伸びる | `fillViewport` なし | `FILL_VIEWPORT_PATHS` に入れない。C-shell で長いページなら `PAGE_SCROLL_STANDALONE_PATHS` |
| Header+作業領域を 100dvh | `fillViewport` | `FILL_VIEWPORT_PATHS` |
| ミニゲーム舞台 | `fillViewport` + `minStageSize` | 上記 + `MIN_STAGE_PAGE_SCROLL_PATHS` |
| 没入 | AppShell なし | `ALWAYS_ISOLATE_PATHS` |

条件付き `fillViewport={!compact}` を使うなら、SiteChrome 側の扱いもコメントで残す。

---

## 4. ジャンル別ルール

定義: `src/data/tools.ts` の `genres`。文言: `src/i18n/*/genres`。

### 4.1 業務効率化（`business`）

**棚の意味**: 実務直結。請求・メール・PDF・画像・テキスト・フォルダなど「仕事の手間を減らす」。

| 項目 | 既定 |
|------|------|
| パス | `/tools/<kebab-id>` |
| タイプ | B または C-shell（インストールは付けない） |
| バックアップ | 入力・設定・ファイル成果を残すなら **必須** |
| スマホ | 完了後 `true`。PC 前提なら `false`（未設定のまま放置しない） |
| 画面 | 作業台（結合・キャンバス）は fill。長い設定フォームはページスクロール |
| SEO | 「作成 / 変換 / 整形 / 一括」＋ Free / No Sign-up / Local-first |
| サーバー | 禁止 |

コピー元: シンプル B → `text-cleaner`。ファイル作業の C-shell → `pdf-editor`。

### 4.2 クリエイター支援（`creators`）

**棚の意味**: 制作物を置いて編集する道具。相関図・紙面・配色・メディアタグ。

| 項目 | 既定 |
|------|------|
| パス | `/tools/<kebab-id>`（単体起動したいときだけルート。現行例外: 配色パレット） |
| タイプ | 原則 B。standalone が必要なら C-shell |
| バックアップ | 作品・プロジェクトを残すなら必須。読み捨て編集だけならなし可 |
| スマホ | 精密キャンバスは `false`（PC推奨）を許容 |
| 画面 | キャンバス系は fill。作業領域の独自フォントは可（紙面エディタ） |
| SEO | 「作成 / 編集 / 抽出」系 |
| サーバー | 禁止 |

コピー元: キャンバス B → `character-relation-editor`。ルート C-shell → `palette-collector`。

### 4.3 日常の便利ツール（`utilities`）

**棚の意味**: 日常の単機能。家計の記録、URL の一時置きなど。

| 項目 | 既定 |
|------|------|
| パス | `/<kebab-id>`（`/tools` に置かない） |
| タイプ | C-shell。C-install は明示依頼＋既存方針の確認が必要 |
| バックアップ | 記録・リストがあるなら必須 |
| スマホ | **優先して対応**し `true` |
| 画面 | 1画面なら fill。カード一覧が長いならページスクロール |
| SEO | 「記録 / 計算 / 保存」系 |
| サーバー | 原則禁止。公開メタ取得など最小例外はアプリ内コメントとライブラリ説明に書く |

コピー元: C-shell → `link-stocker`。C-install → `lunch-savings`（📱 はコピーしない）。

現行例外: リンクキープは OGP 用に URL だけサーバー経由。

### 4.4 ミニゲーム（`minigames`）

**棚の意味**: 息抜き。確率・反射・暗号遊び。本格ツールの代替ではない。

| 項目 | 既定 |
|------|------|
| パス | `/<kebab-id>` |
| タイプ | 原則 C-shell。完全隔離が必要なら D |
| バックアップ | 進行・設定を残すなら付ける。残さないなら `omitLocalDataNote: true` |
| スマホ | 操作が指向けなら `true`、精密操作は `false` |
| 画面 | アクションは fill + `minStageSize`。サイト枠は共通、**作業領域だけ**独自見た目可（`slot-*` / `pxd-*` / `cm-*`） |
| SEO | Free / No Login のゲーム向け。業務ワードを無理に盛らない |
| サーバー | 禁止 |

コピー元: 舞台つき C-shell → `pixel-drop-puzzle`。D → `monster-driver`。

現行例外: モンスター運転は Type D かつライブラリ非掲載。ひみつメッセージはゲーム棚だが暗号ツールなのでローカルデータ注記あり。

---

## 5. 新規アプリのチェックリスト

掲載するなら、次を一度に揃える。

### 必須

- [ ] ジャンルを `src/data/tools.ts` の該当 `genres[].tools` に追加（`id` / `icon` / `href`）
- [ ] `isMobileSupported` を `true` / `false` のどちらかにする（未設定で放置しない）
- [ ] ユーザーデータを扱わないミニゲームなら `omitLocalDataNote: true`
- [ ] `src/i18n/apps/<camelCase>.ts`（`shell.title` / `shell.description` 必須）
- [ ] `src/i18n/apps/index.ts` に登録
- [ ] `src/i18n/ja.ts` / `en.ts` の `tools.<id>`（title / description / detail）
- [ ] 他言語は未訳なら en フォールバック可
- [ ] `page.tsx` は `"use client"` + AppShell（Type D 以外）
- [ ] `src/lib/seo.ts` の `TOOL_SEO`（sitemap の URL は `tools.ts` から自動）
- [ ] `layout.tsx` で SEO metadata（`pageMetadata` + `TOOL_SEO`）

### タイプに応じて

- [ ] **C-shell / C-install**: `PwaRuntime` + `isPwa` + `STANDALONE_APP_PATHS`
- [ ] **C-install のみ**: manifest + SW + `enableServiceWorker` + インストールボタン
- [ ] **fill する**: page と `FILL_VIEWPORT_PATHS` を同時更新
- [ ] **ミニゲーム舞台**: `minStageSize` + `MIN_STAGE_PAGE_SCROLL_PATHS`
- [ ] **D**: `ALWAYS_ISOLATE_PATHS`。AppShell を使わない
- [ ] バックアップする: `dataManager`（`appId` は tool id と一致）
- [ ] 静的アイコン / カバー: `public/icons/<id>-512.png` と `public/covers/<id>.png`、`TOOLS_WITH_STATIC_*` に追加

### やらないこと

- ランチ貯金以外に 📱 を置く
- Type C-shell に SW / manifest を足して「インストールできる状態」にする
- `isPwa` だけ付けて `STANDALONE_APP_PATHS` を忘れる
- ジャンルを変えずにパス規則を破る（破るなら RULEBOOK の例外に追記）

---

## 6. 現行の例外・負債

ルールを変えるとき以外は、例外を黙って解消しない（依頼されたら直す）。

| アプリ | 内容 |
|--------|------|
| 帳票メーカー | `isPwa` だが `STANDALONE_APP_PATHS` 漏れ（C-shell 未完成） |
| ランチ貯金 | page は `fillViewport` だが `FILL_VIEWPORT_PATHS` 漏れ |
| メディアタグ | `fillViewport={!compact}` で SiteChrome 配列と不一致 |
| フォルダ生成 / 配色パレット / リンクキープ | `isMobileSupported` 未設定 |
| 配色パレット | creators なのにルートパス |
| リンクキープ | OGP 用サーバー通信 |
| モンスター運転 | Type D・ライブラリ非掲載 |
| ひみつメッセージ | ミニゲーム棚の暗号ツール |

---

## 7. 文書の役割

| 文書 | 役割 |
|------|------|
| **この RULEBOOK.md** | 分類・ジャンル・追加手順の正本 |
| `design-rules.md` | 色・フォント・余白の正本 |
| `AGENTS.md` | 短い入口（ここへ誘導） |
| `.cursor/rules/core.mdc` | 常時の作業方針 |
| `.cursor/rules/app-taxonomy.mdc` | 決め順とタイプの要約 |
| `.cursor/rules/ui-ux.mdc` | Header / スマホの細部 |
| `.cursor/rules/new-app.mdc` | 追加時の短いチェック |
| `.cursor/rules/i18n.mdc` | 辞書 |
| `.cursor/skills/add-new-tool` | 手を動かす手順 |
| `.cursor/skills/mobile-responsive` | 既存アプリのスマホ対応 |

---

## 8. AI への定型指示（冒頭に貼る）

チャットの**最初**に下を貼り、**コロン（：）より右だけ**変える。  
空の項目は AI が勝手に決めず、先に確認する。

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

### コロン以降の書き方

| 番号 | 項目 | 右に書く例 |
|------|------|------------|
| ③ | 方針 | `新規` / `改修` / `スマホ対応` |
| ④ | ジャンル | `業務効率化` / `クリエイター支援` / `日常の便利ツール` / `ミニゲーム` |
| ⑤ | タイプ | `B` / `C-shell` / `C-install` / `D` |
| ⑥ | 対象 | 改修ならパス（`/tools/pdf-editor`）。新規なら空 |
| ⑦ | 名前 | 新規の短い UI 名。改修なら空でよい |
| ⑧ | やること | 1文または箇条書き |
| ⑨ | バックアップ | `必要` / `不要` / `現状維持` |
| ⑩ | スマホ | `対応する` / `PC推奨` / `現状維持` |
| ⑪ | 画面 | `ページスクロール` / `fillViewport` / `fill+minStageSize` / `没入` / `現状維持` |
| ⑫ | 掲載 | `ライブラリに出す` / `出さない` / `現状維持` |
| ⑬ | やらないこと | 追加の禁止があればここへ。原則はそのまま |

改修でジャンル・タイプを変えないときは、④⑤⑨⑩⑪⑫を `現状維持` にする。
