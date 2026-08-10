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
    buttonTiny: string;
    buttonAria: string;
    modalTitle: string;
    modalLead: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    desktopTitle: string;
    desktopLead: string;
    desktopStep1Title: string;
    desktopStep1Body: string;
    desktopStep2Title: string;
    desktopStep2Body: string;
    modalClose: string;
  };
  toast: {
    kept: string;
    /** タイトル／画像が取れずドメイン名だけ登録したとき */
    keptPartial: string;
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
  tagManager: {
    button: string;
    buttonAria: string;
    title: string;
    newName: string;
    create: string;
    customColor: string;
    deleteConfirm: string;
    empty: string;
    rename: string;
    renameDone: string;
    delete: string;
  };
  tagPicker: {
    title: string;
    empty: string;
  };
};

export const linkStockerJa: LinkStockerDict = {
  shell: {
    title: "とりあえずキープ",
    description:
      "ブックマークするほどではない URL を、サムネ付きでサッと残す（公開メタ取得のため URL のみサーバー経由の通信あり）",
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
    button: "このアプリをインストール",
    buttonShort: "インストール",
    buttonTiny: "インストール",
    buttonAria: "とりあえずキープをインストールして、個別アプリとして使う",
    modalTitle: "アプリをインストール",
    modalLead:
      "対応ブラウザからインストールすると、とりあえずキープだけを個別アプリとしてすぐ開けます。",
    step1Title: "共有をタップ",
    step1Body: "画面下（または上）の共有アイコン［↑］をタップします。",
    step2Title: "「ホーム画面に追加」",
    step2Body: "メニューを下にスクロールし、「ホーム画面に追加」を選びます。",
    desktopTitle: "アプリとしてインストール",
    desktopLead:
      "Chrome / Edge なら、アドレスバーやメニューからとりあえずキープを独立アプリとして追加できます。",
    desktopStep1Title: "ブラウザのメニューを開く",
    desktopStep1Body:
      "画面右上の「︙」またはアドレスバー横のインストールアイコンを探します。",
    desktopStep2Title: "「アプリをインストール」",
    desktopStep2Body:
      "「とりあえずキープをインストール」や「アプリをインストール」を選ぶとホーム／デスクトップに追加されます。",
    modalClose: "わかった",
  },
  toast: {
    kept: "キープしました",
    keptPartial:
      "キープしました（タイトル／画像は取得できませんでした。ブックマークレットからの登録がおすすめです）",
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
    hint: "下のボタンをブックマークバーへドラッグして追加（更新時は差し替え直してください）。他サイトで押すと、すでに開いているマイツールボックスのタブへ送って自動登録し、一時タブはすぐ閉じます。",
    dragLabel: "キープに送る",
  },
  share: {
    hint: "ホーム画面に追加後、ブラウザの「共有」からこのアプリを選ぶと自動キープできます。",
  },
  tagManager: {
    button: "タグ編集",
    buttonAria: "タグの追加・編集・削除を開く",
    title: "タグを編集",
    newName: "新しいタグ名",
    create: "タグを追加",
    customColor: "カスタム色",
    deleteConfirm: "このタグを削除しますか？付けているカードからも外れます。",
    empty: "まだタグがありません。下で追加できます。",
    rename: "改名",
    renameDone: "OK",
    delete: "削除",
  },
  tagPicker: {
    title: "タグを付ける",
    empty: "先に左上の「タグ編集」でタグを作ってください。",
  },
};

export const linkStockerEn: LinkStockerDict = {
  shell: {
    title: "Link Stocker",
    description:
      "Park “maybe later” URLs as visual cards with OGP thumbs (URLs may be fetched via the site server for public metadata)",
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
    button: "Install this app",
    buttonShort: "Install",
    buttonTiny: "Install",
    buttonAria: "Install Link Stocker as a standalone app",
    modalTitle: "Install app",
    modalLead:
      "Install Link Stocker from Safari to open it as its own app — not the portal.",
    step1Title: "Tap Share",
    step1Body: "Tap the Share icon [↑] at the bottom (or top) of Safari.",
    step2Title: "Add to Home Screen",
    step2Body: "Scroll the menu and choose “Add to Home Screen”.",
    desktopTitle: "Install as an app",
    desktopLead:
      "In Chrome or Edge, install Link Stocker as its own app from the address bar or browser menu.",
    desktopStep1Title: "Open the browser menu",
    desktopStep1Body:
      "Look for the ⋮ menu or the install icon near the address bar.",
    desktopStep2Title: "Install app",
    desktopStep2Body:
      "Choose “Install Link Stocker” / “Install app” to add it to your home screen or desktop.",
    modalClose: "Got it",
  },
  toast: {
    kept: "Kept",
    keptPartial:
      "Kept (title/image unavailable — try the bookmarklet for better results)",
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
    hint: "Drag the button onto your bookmarks bar (replace it after updates). It hands off to any open Blank Note tab and auto-saves; the helper tab closes right away.",
    dragLabel: "Send to Keep",
  },
  share: {
    hint: "Install to Home Screen, then use Share → this app to auto-keep links.",
  },
  tagManager: {
    button: "Edit tags",
    buttonAria: "Add, rename, recolor, or delete tags",
    title: "Edit tags",
    newName: "New tag name",
    create: "Add tag",
    customColor: "Custom color",
    deleteConfirm: "Delete this tag? It will be removed from all cards.",
    empty: "No tags yet. Create one below.",
    rename: "Rename",
    renameDone: "OK",
    delete: "Delete",
  },
  tagPicker: {
    title: "Attach tags",
    empty: "Create tags first via “Edit tags” on the left.",
  },
};
