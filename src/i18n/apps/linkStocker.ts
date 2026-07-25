export type LinkStockerDict = {
  shell: {
    title: string;
    description: string;
  };
  form: {
    placeholder: string;
    submit: string;
    loading: string;
    tagLabel: string;
    noTag: string;
  };
  filter: {
    all: string;
    label: string;
  };
  empty: {
    title: string;
    hint: string;
  };
  card: {
    open: string;
    delete: string;
    deleteConfirm: string;
    noImage: string;
  };
  errors: {
    emptyUrl: string;
    invalidUrl: string;
    duplicate: string;
    fetchFailed: string;
  };
  install: {
    button: string;
    buttonShort: string;
    buttonAria: string;
    iosHint: string;
  };
  toast: {
    kept: string;
    deleted: string;
  };
  stats: {
    keptCount: string;
    keptCountUnit: string;
  };
};

export const linkStockerJa: LinkStockerDict = {
  shell: {
    title: "とりあえずキープ",
    description: "ブックマークするほどではない URL を、サムネ付きでサッと残す",
  },
  form: {
    placeholder: "https:// をペーストしてキープ",
    submit: "キープする",
    loading: "取得中…",
    tagLabel: "タグ",
    noTag: "なし",
  },
  filter: {
    all: "すべて",
    label: "絞り込み",
  },
  empty: {
    title: "まだキープなし",
    hint: "上の欄に URL を貼って「キープする」を押すだけ。",
  },
  card: {
    open: "開く",
    delete: "削除",
    deleteConfirm: "このキープを削除しますか？",
    noImage: "NO IMAGE",
  },
  errors: {
    emptyUrl: "URL を入力してください",
    invalidUrl: "正しい http(s) URL を入力してください",
    duplicate: "すでにキープ済みの URL です",
    fetchFailed: "サイト情報の取得に失敗しました",
  },
  install: {
    button: "このアプリをホーム画面に追加",
    buttonShort: "ホームに追加",
    buttonAria: "とりあえずキープをホーム画面に追加してアプリとして使う",
    iosHint:
      "Safari の共有ボタン →「ホーム画面に追加」でインストールできます。",
  },
  toast: {
    kept: "キープしました",
    deleted: "削除しました",
  },
  stats: {
    keptCount: "キープ数",
    keptCountUnit: "件",
  },
};

export const linkStockerEn: LinkStockerDict = {
  shell: {
    title: "Link Stocker",
    description: "Park “maybe later” URLs as visual cards with OGP thumbs",
  },
  form: {
    placeholder: "Paste https:// to keep",
    submit: "Keep",
    loading: "Fetching…",
    tagLabel: "Tag",
    noTag: "None",
  },
  filter: {
    all: "All",
    label: "Filter",
  },
  empty: {
    title: "Nothing kept yet",
    hint: "Paste a URL above and hit Keep.",
  },
  card: {
    open: "Open",
    delete: "Delete",
    deleteConfirm: "Delete this keep?",
    noImage: "NO IMAGE",
  },
  errors: {
    emptyUrl: "Enter a URL",
    invalidUrl: "Enter a valid http(s) URL",
    duplicate: "This URL is already kept",
    fetchFailed: "Failed to fetch site info",
  },
  install: {
    button: "Add this app to Home Screen",
    buttonShort: "Add to Home",
    buttonAria: "Add Link Stocker to your home screen as a standalone app",
    iosHint: 'In Safari, tap Share → “Add to Home Screen”.',
  },
  toast: {
    kept: "Kept",
    deleted: "Deleted",
  },
  stats: {
    keptCount: "Kept",
    keptCountUnit: "",
  },
};
