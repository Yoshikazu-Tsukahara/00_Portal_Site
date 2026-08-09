# Blank Note — デザイン原則（正本）

今後の UI 開発・AI 生成はこの文書を優先する。  
実装への落とし込みは `.cursor/rules/ui-ux.mdc` と `src/app/globals.css` を参照。

---

## ブランド

- **ブランド名**: Blank Note
- **世界観**: 上質な文房具（ノート・定規・インク）のようなデスクトップ型ランチャー（OS 風ツールボックス）
- **避けるもの**: AI 量産型のリンク集、紫グラデ、フワフワした多層シャドウ、絵文字だらけのダッシュボード

---

## カラー

| 役割 | 値 | 備考 |
|------|-----|------|
| 背景 | `#f8f8ff` | 真っ白を避けた、青みがかった上品な白 |
| アクセント | `#ccd5ff` | 淡く知的なペールブルー。**アクセントは原則この1色のみ** |
| 文字（本文） | `#2a2a2e`（優しい墨色）/ 補助 `zinc-500` | 真っ黒は避け、読みやすさは維持 |
| 境界線 | `zinc-200` またはアクセントを薄めた線 | 1px シャープ |

CSS 変数（`globals.css`）:

- `--background: #f8f8ff`
- `--accent: #ccd5ff`
- `--border` / `--foreground` など既存トークンと併用

---

## タイポグラフィ

| 用途 | フォント | CSS 変数 |
|------|----------|----------|
| タイトル・ロゴ・アプリアイコン名 | Space Mono（インダストリアルな等幅） | `--font-display` / `font-display` |
| 本文・説明 | Noto Sans JP | `--font-sans` |

メリハリを優先し、ロゴやホームのアプ名に display を使う。長文は本文フォント。

---

## 余白・境界・影

- padding / margin は通常より広めに取り、窮屈にしない
- **フワフワした shadow は極力廃止**
- 区切りは **1px のシャープなボーダー**（文房具の罫線感）
- 角丸は控えめ（過度な `rounded-2xl` / `rounded-full` の装飾チップを避ける）

---

## モーション

- ホバー等の変化は **`transition-all duration-150`**（約 0.15 秒）で統一
- 長いバウンス・過度なフェードアップは使わない

---

## ランチャー構成（ホーム）

1. **ホーム（`/`）** … ピン留めしたアプリのみ表示するデスクトップ風ランチャー  
2. **ライブラリ（`/library`）** … 全アプリ一覧。⭐ でホームに追加／解除  
3. ピン留めは LocalStorage（`blank-note:home-pins`）に保存  

---

## 共通 UI パーツ

差し替えやすい独立コンポーネントとして置く（当面 Lucide 仮置き）:

- `src/components/icons/BackIconButton.tsx`
- `src/components/icons/SettingsIconButton.tsx`
- `src/components/icons/FavoriteIconButton.tsx`
- `src/components/LocalOnlyBadge.tsx` … 「外部送信ゼロ・完全ローカル動作」安心バッジ

---

## スコープ注意

- サイト枠（Header / Footer / ホーム / ライブラリ / AppShell 外周）はこの原則に従う
- ゲーム等の没入型アプリ内部は独自ビジュアルを維持してよい（サイト枠は共通）
