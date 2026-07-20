import type { AppsDictionary } from "./apps";

/** 対応言語 */
export type Locale = "ja" | "en";

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
    preparing: string;
    langToggleAria: string;
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
  };
  footer: {
    tagline: string;
    navAria: string;
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
  /** 各ツールアプリ内 UI */
  apps: AppsDictionary;
};
