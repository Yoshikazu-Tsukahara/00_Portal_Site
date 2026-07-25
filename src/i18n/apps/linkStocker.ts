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
    memoPlaceholder: string;
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
    badge: string;
  };
  help: {
    button: string;
    buttonAria: string;
    modalTitle: string;
    close: string;
  };
  bookmarklet: {
    title: string;
    hint: string;
    dragLabel: string;
  };
  share: {
    hint: string;
  };
  tagEditor: {
    title: string;
    newName: string;
    create: string;
    customColor: string;
    apply: string;
  };
};

export const linkStockerJa: LinkStockerDict = {
  shell: {
    title: "とりあえずキープ",
    description: "ブックマークするほどではない URL を、サムネ付きでサッと残す",
  },
  form: {
    placeholder: "https:// をペースト",
    submit: "キープ",
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
    hint: "上の欄に URL を貼って「キープ」を押すだけ。",
  },
  card: {
    open: "開く",
    delete: "削除",
    deleteConfirm: "このキープを削除しますか？",
    noImage: "NO IMAGE",
    memoPlaceholder: "📝 メモを追加...",
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
    badge: "{n}件",
  },
  help: {
    button: "💡 簡単登録",
    buttonAria: "簡単登録の使い方を開く",
    modalTitle: "簡単登録の使い方",
    close: "とじる",
  },
  bookmarklet: {
    title: "💻 PC用：ブックマークバーにドラッグ",
    hint: "下のボタンをブックマークバーへドラッグして追加。他サイトで押すと、既存のキープ用タブへ移動して自動登録します（タブが増え続けません）。",
    dragLabel: "キープに送る",
  },
  share: {
    hint: "ホーム画面に追加後、ブラウザの「共有」からこのアプリを選ぶと自動キープできます。",
  },
  tagEditor: {
    title: "タグを編集",
    newName: "新しいタグ名",
    create: "タグを作成して付ける",
    customColor: "カスタム色",
    apply: "適用",
  },
};

export const linkStockerEn: LinkStockerDict = {
  shell: {
    title: "Link Stocker",
    description: "Park “maybe later” URLs as visual cards with OGP thumbs",
  },
  form: {
    placeholder: "Paste https://",
    submit: "Keep",
    loading: "…",
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
    memoPlaceholder: "📝 Add a memo...",
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
    badge: "{n}",
  },
  help: {
    button: "💡 Tips",
    buttonAria: "Open quick-keep tips",
    modalTitle: "Quick keep tips",
    close: "Close",
  },
  bookmarklet: {
    title: "💻 Desktop: drag to bookmarks bar",
    hint: "Drag the button onto your bookmarks bar. On any site, it focuses the existing Keep tab and auto-saves (won’t spawn endless tabs).",
    dragLabel: "Send to Keep",
  },
  share: {
    hint: "Install to Home Screen, then use Share → this app to auto-keep links.",
  },
  tagEditor: {
    title: "Edit tags",
    newName: "New tag name",
    create: "Create & attach",
    customColor: "Custom color",
    apply: "Apply",
  },
};
