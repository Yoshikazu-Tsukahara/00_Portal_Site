import type { AppsDictionary } from "./apps";

/**
 * 対応言語（主要市場向け 9 言語）。
 * LocalStorage / URL でもこのコードを使う。
 */
export type Locale =
  | "en"
  | "ja"
  | "zh-CN"
  | "zh-TW"
  | "ko"
  | "es"
  | "fr"
  | "de"
  | "pt";

/** LocalStorage に保存するキー */
export const LOCALE_STORAGE_KEY = "my-tool-box-locale";

/** 法的文書の1ブロック */
export type LegalBlock =
  | { type: "p"; text: string; callout?: boolean }
  | {
      type: "callout";
      /** 強調を挟んだテキスト片 */
      parts: { text: string; strong?: boolean }[];
    }
  | { type: "ul"; items: string[] };

export type LegalSectionContent = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  title: string;
  updatedAt: string;
  sections: LegalSectionContent[];
};

/** 辞書の型（日本語定義を正とする） */
export type Dictionary = {
  brand: string;
  common: {
    backToPortal: string;
    loading: string;
    close: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    clear: string;
  };
  header: {
    support: string;
    supportShort: string;
    supportAria: string;
    supportTitle: string;
    langToggleAria: string;
    /** PC 向け表示幅切替（lg 以上で表示） */
    layoutToggle: {
      aria: string;
      /** トグル上の小さな見出し */
      caption: string;
      /** ボタン上の短いラベル */
      defaultShort: string;
      wideShort: string;
      fullShort: string;
      /** title / aria-label 用の説明 */
      default: string;
      wide: string;
      full: string;
    };
  };
  home: {
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroLead1: string;
    heroLead2: string;
  };
  genres: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;
  tools: Record<
    string,
    {
      title: string;
      description: string;
    }
  >;
  card: {
    open: string;
    comingSoon: string;
    comingSoonHint: string;
    /** スマホ対応バッジの短いラベル */
    mobileSupported: string;
    /** スマホ対応バッジの title / aria */
    mobileSupportedHint: string;
    /** PC推奨バッジの短いラベル */
    pcRecommended: string;
    /** PC推奨バッジの title / aria */
    pcRecommendedHint: string;
  };
  footer: {
    tagline: string;
    navAria: string;
    contact: string;
    terms: string;
    privacy: string;
    environmentLabel: string;
    noticeLabel: string;
    localOnly: string;
  };
  messages: {
    environment: string;
    persistence: string;
    safety: string;
    safetyShort: string;
    /** データ系ツール上部の共通プライバシー案内（穏やかな一文） */
    privacyBanner: string;
  };
  dataManager: {
    buttonTitle: string;
    buttonAria: string;
    buttonLabel: string;
    buttonLabelShort: string;
    dialogTitle: string;
    close: string;
    safetyHeading: string;
    backupReasonHeading: string;
    export: string;
    import: string;
    noData: string;
    exportOk: string;
    exportFail: string;
    importOk: string;
    importFail: string;
    importInvalid: string;
    importConfirm: string;
  };
  legal: {
    back: string;
    updatedPrefix: string;
    terms: LegalDoc;
    privacy: LegalDoc;
  };
  /** お問い合わせページ（mailto のみ・サーバー送信なし） */
  contact: {
    title: string;
    lead: string;
    /** 送信ボタン付近の注記 */
    mailtoHint: string;
    submit: string;
    messageRequired: string;
    categoryLabel: string;
    categories: {
      general: string;
      feature: string;
      bug: string;
      other: string;
    };
    appLabel: string;
    appPlaceholder: string;
    /** 対象アプリ未指定 */
    appNone: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailHint: string;
    messageLabel: string;
    messagePlaceholder: string;
    /** mailto 件名の接頭辞（種類を括弧で付ける） */
    subjectPrefix: string;
    bodyLabels: {
      category: string;
      app: string;
      name: string;
      email: string;
      message: string;
      environment: string;
      notProvided: string;
    };
  };
  /** 各ツールアプリ内 UI */
  apps: AppsDictionary;
};
