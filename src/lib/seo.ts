import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/localeMeta";
import {
  fromUrlLocale,
  localizedHref,
  toHrefLang,
} from "@/i18n/localePath";
import { resolveDictionary } from "@/i18n/resolveDictionary";
import type { Locale } from "@/i18n/types";

/** サイト名（OGP siteName / タブ末尾） */
export const SITE_NAME = "Blank Note";

/**
 * 絶対 URL のオリジン。
 * 本番は NEXT_PUBLIC_SITE_URL → Vercel 本番ドメイン → プレビュー URL の順。
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/** SNS シェア用の共通画像（public/og.png） */
export const OG_IMAGE = {
  url: "/og.png",
  width: 1024,
  height: 703,
  alt: SITE_NAME,
} as const;

/** Open Graph の locale（アンダースコア形式） */
const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  ja: "ja_JP",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  ko: "ko_KR",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  pt: "pt_BR",
  id: "id_ID",
};

export type PageSeo = {
  title: string;
  description: string;
};

/** URL セグメント `lang` → Locale（不正時は DEFAULT） */
export function localeFromLangParam(lang: string | undefined | null): Locale {
  if (!lang) return DEFAULT_LOCALE;
  return fromUrlLocale(lang) ?? DEFAULT_LOCALE;
}

/**
 * hreflang 用の言語 → 絶対 URL マップ。
 * `path` は言語プレフィックス無し（例: `/tools/excel-merger`）。
 * `x-default` は DEFAULT_LOCALE（en）。
 */
export function hreflangLanguages(path: string = "/"): Record<string, string> {
  const origin = getSiteOrigin();
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[toHrefLang(locale)] = `${origin}${localizedHref(locale, path)}`;
  }
  languages["x-default"] =
    `${origin}${localizedHref(DEFAULT_LOCALE, path)}`;
  return languages;
}

/**
 * title / description / openGraph / twitter / hreflang を揃えた Metadata。
 * `path` は言語無し。canonical と alternates は `locale` 付きで付与する。
 */
export function pageMetadata({
  locale,
  title,
  description,
  path = "/",
  extra,
}: PageSeo & {
  locale: Locale;
  path?: string;
  extra?: Metadata;
}): Metadata {
  const localizedPath = localizedHref(locale, path);
  const absoluteUrl = `${getSiteOrigin()}${localizedPath}`;

  return {
    ...extra,
    title,
    description,
    alternates: {
      canonical: localizedPath,
      languages: hreflangLanguages(path),
      ...extra?.alternates,
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      siteName: SITE_NAME,
      title,
      description,
      images: [OG_IMAGE],
      url: absoluteUrl,
      ...extra?.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
      ...extra?.twitter,
    },
  };
}

/** サイト固定ページの種別 */
export type SitePageKey =
  | "home"
  | "library"
  | "contact"
  | "terms"
  | "privacy";

const SITE_PAGE_PATH: Record<SitePageKey, string> = {
  home: "/",
  library: "/library",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",
};

/** トップページ（ja 向け検索最適化文面。他言語は辞書から組み立て） */
export const HOME_SEO: PageSeo = {
  title:
    "【無料・登録不要】業務ハックツール箱 | Free Local-first Online Tools | Blank Note",
  description:
    "日々の「めんどくさい」から脱却。請求書作成・PDF編集・テキスト整形など、登録不要・完全無料の業務ツールをブラウザ完結で。サーバーへのデータ送信なし（100% Local-first）。Free online toolbox, no sign-up.",
};

/** ライブラリ一覧 */
export const LIBRARY_SEO: PageSeo = {
  title:
    "【無料】アプリ一覧・業務ツールライブラリ | Free Online Tools Library | Blank Note",
  description:
    "登録不要・完全無料の業務ハックツール一覧。請求書作成、PDF編集、フォルダ一括生成、テキスト整形など。すべてブラウザ完結・データ送信なし。Browse free local-first tools, no login.",
};

export const CONTACT_SEO: PageSeo = {
  title: "お問い合わせ / Contact | Blank Note",
  description:
    "Blank Note へのお問い合わせ。登録不要の無料ツールに関するご要望・不具合報告をメールで送れます。Free local-first tools — contact the developer.",
};

export const TERMS_SEO: PageSeo = {
  title: "利用規約 / Terms of Use | Blank Note",
  description:
    "Blank Note の利用規約。登録不要・完全無料の個人開発ツールとしての免責と、端末内データの取り扱いを定めています。",
};

export const PRIVACY_SEO: PageSeo = {
  title: "プライバシーポリシー / Privacy Policy | Blank Note",
  description:
    "Blank Note のプライバシーポリシー。入力・ファイルは原則端末内で処理し、サーバーへ送信しません（100% Local-first）。Cookie による個人追跡は行いません。",
};

/**
 * 各ツールの検索向け title / description（主に ja）。
 * 画面上の短い UI タイトルとは別に、タブ・SNS・検索結果用。
 */
export const TOOL_SEO: Record<string, PageSeo> = {
  "text-cleaner": {
    title:
      "【登録不要】テキスト整形・改行/空白一括削除ツール | Free Online Text Cleaner | Blank Note",
    description:
      "ブラウザ上で完結する無料のテキストクレンジングツール。余計なHTMLタグや改行、URL、全角半角を一瞬で整形します。サーバー通信なし（100% Local-first）のため機密文章でも安心。Free & No Sign-up online text formatter.",
  },
  "folder-generator": {
    title:
      "【無料】エクセルから大量の空フォルダ・階層を一括作成 | Bulk Folder Generator | Blank Note",
    description:
      "面倒なフォルダ作成作業を一瞬で終わらせるブラウザ完結ツール。エクセルのリストから階層構造の空フォルダをZIPで一括ダウンロード。完全無料・登録不要・データ送信なし。Free batch folder creator from spreadsheet.",
  },
  "excel-merger": {
    title:
      "【無料】Excelシート抽出・結合。参照切れ警告つき | Free Excel Sheet Merger | Blank Note",
    description:
      "複数のExcelをドラッグで整理・結合。他シート参照を警告し、数式を値にして書き出せるブラウザ完結ツール。アップロード不要・登録不要。Free Excel sheet merger with #REF! safeguards, no upload.",
  },
  "invoice-maker": {
    title:
      "【登録不要】超シンプル無料請求書作成ツール | Free Simple Invoice Maker | Blank Note",
    description:
      "アカウント登録不要で1秒で発行できるシンプルな請求書作成ツール。海外取引（Invoice）にも対応。入力データは端末内のみに保存され外部に送信されません。100% Private & Free Invoice Generator.",
  },
  "mail-template": {
    title:
      "【登録不要】メールテンプレ管理・変数置換で返信を時短 | Free Email Template Manager | Blank Note",
    description:
      "よく使うメール文面をテンプレート化。変数置換ですぐ返信できる無料ツール。登録不要、データは端末内のみ保存。Free & No Sign-up email template formatter.",
  },
  "pdf-editor": {
    title:
      "【無料】PDF結合・並び替え・回転・ページ削除 | Free Online PDF Editor | Blank Note",
    description:
      "ブラウザ完結の無料PDF編集ツール。結合・並び替え・回転・白紙挿入を一瞬で。アップロード不要・登録不要。100% Local-first PDF converter & editor.",
  },
  "image-compressor": {
    title:
      "【登録不要】画像一括圧縮・リサイズツール | Free Image Compressor | Blank Note",
    description:
      "複数画像をブラウザ内で一括リサイズ・圧縮してZIP保存。完全無料・登録不要・サーバー送信なし。Free online image compressor, no upload.",
  },
  "media-metadata-editor": {
    title:
      "【無料】音楽・動画のタグ編集・カバー差し替え | Free Media Tag Editor | Blank Note",
    description:
      "MP3や動画のタイトル・アーティスト・カバーをブラウザ内で編集。登録不要、ファイルは端末外へ送りません。100% Private media metadata editor.",
  },
  "frame-extractor": {
    title:
      "【無料】動画の1フレーム精密コマ送り・画像切り出し | Free Video Frame Extractor | Blank Note",
    description:
      "MP4 / WebM / MOV を1コマ単位で送り、決定的な瞬間を PNG / JPEG / WebP で保存。完全無料・登録不要・サーバー送信なし。Free local-first video frame grabber.",
  },
  "character-relation-editor": {
    title:
      "【登録不要】小説・脚本の登場人物相関図作成 | Free Character Relationship Map | Blank Note",
    description:
      "キャラクターカードと関係線で物語の相関図を視覚化。完全無料・登録不要・データは端末内保存。Free online character map maker, no login.",
  },
  "book-visualizer": {
    title:
      "【無料】同人誌・冊子の紙面編集・プレビュー | Free Book Layout Editor | Blank Note",
    description:
      "用紙サイズに合わせて紙面を直接編集。縦書き対応、.mybookで共有。登録不要・ブラウザ完結。Free local-first book formatter.",
  },
  "palette-collector": {
    title:
      "【登録不要】画像から配色抽出・カラーパレット作成 | Free Color Palette Extractor | Blank Note",
    description:
      "画像から色をスポイト／自動抽出。HEX・CSS変数コピー、コントラスト判定付き。完全無料・データ送信なし。Free online palette generator.",
  },
  "lunch-savings": {
    title:
      "【無料】ランチ代の差額記録・節約計算アプリ | Free Lunch Savings Tracker | Blank Note",
    description:
      "今日のランチ代と予算の差額をタップで記録。登録不要、データは端末内のみ。Free local-first savings calculator, no sign-up.",
  },
  "link-stocker": {
    title:
      "【登録不要】あとで読むURLをカードで一時保存 | Free Link Stocker | Blank Note",
    description:
      "ブックマークほどではないURLをOGP付きカードでキープ。完全無料・登録不要。公開メタ取得時のみURL通信あり。Free visual bookmark tool.",
  },
  "url-cleaner": {
    title:
      "【無料】URLクリーナー&QR生成・長いURLの整形 | Free URL Cleaner & QR | Blank Note",
    description:
      "utm など付きの長い URL を短く整形し、QR コードもその場で生成。完全ローカル・登録不要・外部送信なし。Free local URL cleaner with QR code, no sign-up.",
  },
  "ultimate-probability-slot": {
    title:
      "【無料】自作確率スロット・当たるまで計算 | Free Probability Slot Game | Blank Note",
    description:
      "リール数と絵柄で低確率スロットを自作。登録不要のブラウザ完結ミニゲーム。Free online probability calculator game, no login.",
  },
  "pixel-drop-puzzle": {
    title:
      "【無料】ピクセル精度の隙間落としパズル | Free Pixel Drop Puzzle | Blank Note",
    description:
      "写真の隙間に落とす高精度タイミングパズル。登録不要・ブラウザ完結。Free online precision puzzle, no sign-up.",
  },
  "robot-freethrow": {
    title:
      "【無料】角度・推力で狙う投射フリースロー | Free Projectile Freethrow Game | Blank Note",
    description:
      "角度・初速・スピンを指定してリングを狙う投射運動ミニゲーム。登録不要・完全無料。Free physics mini-game, no login.",
  },
  "crypto-message": {
    title:
      "【登録不要】合言葉で暗号化・シーザー暗号解読 | Free Secret Message Encryptor | Blank Note",
    description:
      "パスフレーズで文章を暗号化・復号。シーザー解読チャレンジ付き。完全ローカル完結・登録不要。100% Private cipher tool.",
  },
  "monster-driver": {
    title:
      "【無料】信号とウィンカー記憶の運転アクション | Free Reaction Driving Game | Blank Note",
    description:
      "赤で止まり青で飛び出す一人称アクション。登録不要のブラウザ完結ミニゲーム。Free online reaction game, no sign-up.",
  },
};

/** ツール ID の SEO。未登録はライブラリ用の汎用文面（後方互換） */
export function toolSeo(toolId: string): PageSeo {
  return (
    TOOL_SEO[toolId] ?? {
      title: `${toolId} | Free Online Tool | ${SITE_NAME}`,
      description: LIBRARY_SEO.description,
    }
  );
}

/**
 * 言語付きのツール SEO。
 * ja は検索向けの `TOOL_SEO` を優先。他言語は i18n 辞書の title / description。
 */
export function toolSeoForLocale(locale: Locale, toolId: string): PageSeo {
  const rich = TOOL_SEO[toolId];
  if (locale === "ja" && rich) return rich;

  const dict = resolveDictionary(locale);
  const copy = dict.tools[toolId];
  if (copy?.title) {
    return {
      title: `${copy.title} | ${SITE_NAME}`,
      description: copy.description?.trim() || rich?.description || LIBRARY_SEO.description,
    };
  }
  return toolSeo(toolId);
}

/**
 * 言語付きの固定ページ SEO。
 * ja は既存の検索最適化文面。他言語は辞書から組み立てる。
 */
export function sitePageSeo(locale: Locale, page: SitePageKey): PageSeo {
  if (locale === "ja") {
    switch (page) {
      case "home":
        return HOME_SEO;
      case "library":
        return LIBRARY_SEO;
      case "contact":
        return CONTACT_SEO;
      case "terms":
        return TERMS_SEO;
      case "privacy":
        return PRIVACY_SEO;
    }
  }

  const t = resolveDictionary(locale);
  switch (page) {
    case "home":
      return {
        title: `${t.home.heroTitleLine1} ${t.home.heroTitleLine2} | ${SITE_NAME}`,
        description: `${t.home.heroLead1} ${t.home.heroLead2}`,
      };
    case "library":
      return {
        title: `${t.library.title} | ${SITE_NAME}`,
        description: t.library.lead,
      };
    case "contact":
      return {
        title: `${t.footer.contact} | ${SITE_NAME}`,
        description: CONTACT_SEO.description,
      };
    case "terms":
      return {
        title: `${t.footer.terms} | ${SITE_NAME}`,
        description: TERMS_SEO.description,
      };
    case "privacy":
      return {
        title: `${t.footer.privacy} | ${SITE_NAME}`,
        description: PRIVACY_SEO.description,
      };
  }
}

/** 固定ページ用 Metadata を一発生成 */
export function sitePageMetadata(
  locale: Locale,
  page: SitePageKey,
  extra?: Metadata,
): Metadata {
  return pageMetadata({
    locale,
    ...sitePageSeo(locale, page),
    path: SITE_PAGE_PATH[page],
    extra,
  });
}

/** ツールアプリ用 Metadata を一発生成（`path` は言語無し） */
export function toolPageMetadata(
  locale: Locale,
  toolId: string,
  path: string,
  extra?: Metadata,
): Metadata {
  return pageMetadata({
    locale,
    ...toolSeoForLocale(locale, toolId),
    path,
    extra,
  });
}
