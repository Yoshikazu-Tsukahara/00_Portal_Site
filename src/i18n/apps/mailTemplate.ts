/** メールテンプレアプリ用辞書 */
export type MailTemplateDict = {
  shell: { title: string; description: string };
  actions: {
    tagMaster: string;
    variableMaster: string;
    newTemplate: string;
  };
  loading: string;
  list: {
    heading: string;
    emptyFilter: string;
    empty: string;
    noSubject: string;
    selectPrompt: string;
  };
  search: { placeholder: string; aria: string };
  tags: { filterAria: string; all: string };
  pin: {
    pin: string;
    unpin: string;
    pinAria: string;
    unpinAria: string;
  };
  row: {
    edit: string;
    delete: string;
    editAria: string;
    deleteAria: string;
  };
  confirm: { deleteTemplate: string };
  variables: {
    heading: string;
    empty: string;
    removeHistory: string;
    removeHistoryAria: string;
  };
  preview: {
    heading: string;
    subject: string;
    body: string;
    emptySubject: string;
    emptyBody: string;
  };
  copy: {
    button: string;
    done: string;
    both: string;
    bothHint: string;
    bodyOnly: string;
    bodyHint: string;
    subjectOnly: string;
    subjectHint: string;
    confirmEmpty: string;
    confirmMore: string;
  };
  editor: {
    createTitle: string;
    editTitle: string;
    close: string;
    fieldTitle: string;
    fieldSubject: string;
    fieldBody: string;
    titlePlaceholder: string;
    subjectPlaceholder: string;
    bodyHint: string;
    bodyPlaceholder: string;
    labels: string;
    labelsMulti: string;
    labelsEmpty: string;
    variables: string;
    variablesHint: string;
    variablesEmpty: string;
    cancel: string;
    save: string;
  };
  tagMaster: {
    title: string;
    close: string;
    editHeading: string;
    addHeading: string;
    namePlaceholder: string;
    colorLabel: string;
    update: string;
    add: string;
    cancel: string;
    empty: string;
    edit: string;
    delete: string;
    errorEmpty: string;
    errorDuplicate: string;
    confirmDelete: string;
  };
  variableMaster: {
    title: string;
    close: string;
    editHeading: string;
    addHeading: string;
    keyPlaceholder: string;
    labelPlaceholder: string;
    update: string;
    add: string;
    cancel: string;
    empty: string;
    edit: string;
    delete: string;
    errorEmptyKey: string;
    errorKeyFormat: string;
    errorDuplicate: string;
    confirmDelete: string;
  };
};

export const mailTemplateJa: MailTemplateDict = {
  shell: {
    title: "スマートメールテンプレ管理",
    description: "変数・ラベルで返信を即作成。データはブラウザ内に保存。",
  },
  actions: {
    tagMaster: "ラベル管理",
    variableMaster: "変数マスタ",
    newTemplate: "＋ 新規テンプレート追加",
  },
  loading: "読込中…",
  list: {
    heading: "テンプレート一覧",
    emptyFilter: "一致するテンプレートが見つかりません",
    empty: "テンプレートなし",
    noSubject: "件名なし",
    selectPrompt: "テンプレートを選択",
  },
  search: {
    placeholder: "テンプレートを検索...",
    aria: "テンプレートを検索",
  },
  tags: {
    filterAria: "ラベルで絞り込み",
    all: "すべて",
  },
  pin: {
    pin: "ピン留め",
    unpin: "ピン留め解除",
    pinAria: "{title} をピン留め",
    unpinAria: "{title} のピン留めを解除",
  },
  row: {
    edit: "編集",
    delete: "削除",
    editAria: "{title} を編集",
    deleteAria: "{title} を削除",
  },
  confirm: {
    deleteTemplate: "「{title}」を削除しますか？",
  },
  variables: {
    heading: "変数入力",
    empty: "有効な変数なし · 編集でマスタから選択",
    removeHistory: "履歴から削除",
    removeHistoryAria: "「{value}」を履歴から削除",
  },
  preview: {
    heading: "プレビュー",
    subject: "件名",
    body: "本文",
    emptySubject: "（件名なし）",
    emptyBody: "（本文なし）",
  },
  copy: {
    button: "コピー",
    done: "コピー完了！",
    both: "件名と本文をまとめてコピー",
    bothHint: "件名・本文を結合",
    bodyOnly: "本文のみコピー",
    bodyHint: "本文だけ",
    subjectOnly: "件名のみコピー",
    subjectHint: "件名だけ",
    confirmEmpty:
      "未入力の変数がありますが、このままコピーしますか？\n（{names}{more}）",
    confirmMore: " ほか{count}件",
  },
  editor: {
    createTitle: "新規テンプレート",
    editTitle: "テンプレート編集",
    close: "閉じる",
    fieldTitle: "タイトル",
    fieldSubject: "件名",
    fieldBody: "本文",
    titlePlaceholder: "例: お問い合わせへの初回返信",
    subjectPlaceholder: "例: 【ご連絡】{{company}}様",
    bodyHint: "{{キー}} で差し込み",
    bodyPlaceholder: "{{name}} 様\n\nお世話になっております。",
    labels: "ラベル",
    labelsMulti: "複数選択可",
    labelsEmpty: "ラベルが空です。先に「ラベル管理」で追加してください。",
    variables: "使用する変数",
    variablesHint: "マスタから選択",
    variablesEmpty: "変数マスタが空です。先にマスタへ追加してください。",
    cancel: "キャンセル",
    save: "保存",
  },
  tagMaster: {
    title: "ラベル管理",
    close: "閉じる",
    editHeading: "ラベルを編集",
    addHeading: "ラベルを追加",
    namePlaceholder: "ラベル名（例: 重要）",
    colorLabel: "カラー（10色）",
    update: "更新",
    add: "追加",
    cancel: "取消",
    empty: "ラベルなし",
    edit: "編集",
    delete: "削除",
    errorEmpty: "ラベル名を入力",
    errorDuplicate: "同じラベル名が既に存在",
    confirmDelete: "ラベル「{name}」を削除しますか？",
  },
  variableMaster: {
    title: "変数マスタ",
    close: "閉じる",
    editHeading: "変数を編集",
    addHeading: "変数を追加",
    keyPlaceholder: "キー（例: company）",
    labelPlaceholder: "ラベル（例: 会社名）",
    update: "更新",
    add: "追加",
    cancel: "取消",
    empty: "変数なし",
    edit: "編集",
    delete: "削除",
    errorEmptyKey: "キーを入力",
    errorKeyFormat: "英数字と _ のみ（先頭は英字）",
    errorDuplicate: "同じキーが既に存在",
    confirmDelete: "変数「{label}」を削除しますか？",
  },
};

export const mailTemplateEn: MailTemplateDict = {
  shell: {
    title: "Smart Mail Template Manager",
    description:
      "Craft replies instantly with variables and labels. Data stays in your browser.",
  },
  actions: {
    tagMaster: "Manage labels",
    variableMaster: "Variable master",
    newTemplate: "+ New template",
  },
  loading: "Loading…",
  list: {
    heading: "Templates",
    emptyFilter: "No matching templates",
    empty: "No templates",
    noSubject: "No subject",
    selectPrompt: "Select a template",
  },
  search: {
    placeholder: "Search templates...",
    aria: "Search templates",
  },
  tags: {
    filterAria: "Filter by label",
    all: "All",
  },
  pin: {
    pin: "Pin",
    unpin: "Unpin",
    pinAria: "Pin {title}",
    unpinAria: "Unpin {title}",
  },
  row: {
    edit: "Edit",
    delete: "Delete",
    editAria: "Edit {title}",
    deleteAria: "Delete {title}",
  },
  confirm: {
    deleteTemplate: "Delete “{title}”?",
  },
  variables: {
    heading: "Variables",
    empty: "No variables enabled · Choose from master in Edit",
    removeHistory: "Remove from history",
    removeHistoryAria: "Remove “{value}” from history",
  },
  preview: {
    heading: "Preview",
    subject: "Subject",
    body: "Body",
    emptySubject: "(No subject)",
    emptyBody: "(No body)",
  },
  copy: {
    button: "Copy",
    done: "Copied!",
    both: "Copy subject and body",
    bothHint: "Combined subject + body",
    bodyOnly: "Copy body only",
    bodyHint: "Body only",
    subjectOnly: "Copy subject only",
    subjectHint: "Subject only",
    confirmEmpty:
      "Some variables are empty. Copy anyway?\n({names}{more})",
    confirmMore: " +{count} more",
  },
  editor: {
    createTitle: "New template",
    editTitle: "Edit template",
    close: "Close",
    fieldTitle: "Title",
    fieldSubject: "Subject",
    fieldBody: "Body",
    titlePlaceholder: "e.g. First reply to an inquiry",
    subjectPlaceholder: "e.g. Re: Inquiry from {{company}}",
    bodyHint: "Insert with {{key}}",
    bodyPlaceholder: "Dear {{name}},\n\nThank you for your message.",
    labels: "Labels",
    labelsMulti: "Multi-select",
    labelsEmpty: "No labels yet. Add some in “Manage labels” first.",
    variables: "Variables to use",
    variablesHint: "Select from master",
    variablesEmpty: "Variable master is empty. Add variables first.",
    cancel: "Cancel",
    save: "Save",
  },
  tagMaster: {
    title: "Manage labels",
    close: "Close",
    editHeading: "Edit label",
    addHeading: "Add label",
    namePlaceholder: "Label name (e.g. Important)",
    colorLabel: "Color (10 options)",
    update: "Update",
    add: "Add",
    cancel: "Cancel",
    empty: "No labels",
    edit: "Edit",
    delete: "Delete",
    errorEmpty: "Enter a label name",
    errorDuplicate: "That label already exists",
    confirmDelete: "Delete label “{name}”?",
  },
  variableMaster: {
    title: "Variable master",
    close: "Close",
    editHeading: "Edit variable",
    addHeading: "Add variable",
    keyPlaceholder: "Key (e.g. company)",
    labelPlaceholder: "Label (e.g. Company name)",
    update: "Update",
    add: "Add",
    cancel: "Cancel",
    empty: "No variables",
    edit: "Edit",
    delete: "Delete",
    errorEmptyKey: "Enter a key",
    errorKeyFormat: "Letters, numbers, and _ only (must start with a letter)",
    errorDuplicate: "That key already exists",
    confirmDelete: "Delete variable “{label}”?",
  },
};
