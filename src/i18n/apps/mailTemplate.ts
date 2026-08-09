/** メールテンプレアプリ用辞書 */
export type MailTemplateDefaults = {
  variables: { key: string; label: string }[];
  tags: {
    name: string;
    color:
      | "red"
      | "orange"
      | "amber"
      | "green"
      | "emerald"
      | "cyan"
      | "blue"
      | "indigo"
      | "purple"
      | "pink";
  }[];
  templates: {
    title: string;
    subject: string;
    body: string;
    variableKeys: string[];
    tagIndices: number[];
  }[];
};

export type MailTemplateDict = {
  shell: { title: string; description: string };
  defaults: MailTemplateDefaults;
  combinedText: {
    subjectOnly: string;
    both: string;
  };
  colorLabels: {
    red: string;
    orange: string;
    amber: string;
    green: string;
    emerald: string;
    cyan: string;
    blue: string;
    indigo: string;
    purple: string;
    pink: string;
  };
  actions: {
    tagMaster: string;
    variableMaster: string;
    newTemplate: string;
    /** 狭い画面向けの短いラベル（1行に収める用） */
    tagMasterShort: string;
    variableMasterShort: string;
    newTemplateShort: string;
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
    listSeparator: string;
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
  install: {
    button: string;
    buttonShort: string;
    /** バックアップボタン横に並べる極短ラベル */
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
};

export const mailTemplateJa: MailTemplateDict = {
  shell: {
    title: "スマートメールテンプレ管理",
    description: "変数・ラベルで返信を即作成。データはブラウザ内に保存。",
  },
  combinedText: {
    subjectOnly: "件名：{subject}",
    both: "件名：{subject}\n\n本文：\n{body}",
  },
  colorLabels: {
    red: "レッド",
    orange: "オレンジ",
    amber: "アンバー",
    green: "グリーン",
    emerald: "エメラルド",
    cyan: "シアン",
    blue: "ブルー",
    indigo: "インディゴ",
    purple: "パープル",
    pink: "ピンク",
  },
  defaults: {
    variables: [
      { key: "company", label: "会社名" },
      { key: "name", label: "担当者名" },
      { key: "ourCompany", label: "自社名" },
      { key: "sender", label: "送信者名" },
      { key: "slot1", label: "候補日時①" },
      { key: "slot2", label: "候補日時②" },
      { key: "slot3", label: "候補日時③" },
      { key: "project", label: "案件名" },
      { key: "deadline", label: "有効期限" },
      { key: "product", label: "商品・サービス名" },
      { key: "deliverable", label: "納品物" },
      { key: "supportUntil", label: "サポート期限" },
      { key: "subject_code", label: "受付番号" },
      { key: "due_date", label: "担当日" },
    ],
    tags: [
      { name: "重要", color: "red" },
      { name: "サポート", color: "blue" },
      { name: "営業", color: "emerald" },
      { name: "社内", color: "indigo" },
      { name: "フォロー", color: "amber" },
    ],
    templates: [
      {
        title: "お問い合わせへの初回返信",
        subject: "【ご連絡】{{company}}様 お問い合わせの件",
        body: `{{name}} 様

お世話になっております。
この度はお問い合わせいただき、誠にありがとうございます。

ご質問の件、担当より改めてご連絡いたします。
恐れ入りますが、今しばらくお待ちくださいませ。

何かご不明点がございましたら、本メールへご返信ください。

よろしくお願いいたします。`,
        variableKeys: ["company", "name"],
        tagIndices: [1],
      },
      {
        title: "打ち合わせ日程調整",
        subject: "【日程調整】{{company}}様 × {{ourCompany}}",
        body: `{{name}} 様

お世話になっております。{{ourCompany}}の{{sender}}です。

先日はお打ち合わせの機会をいただきありがとうございました。
下記候補日程にてご都合はいかがでしょうか。

・候補①：{{slot1}}
・候補②：{{slot2}}
・候補③：{{slot3}}

ご都合の良い日時をご返信いただけますと幸いです。

何卒よろしくお願いいたします。`,
        variableKeys: [
          "company",
          "ourCompany",
          "name",
          "sender",
          "slot1",
          "slot2",
          "slot3",
        ],
        tagIndices: [2, 3],
      },
      {
        title: "見積書送付のご案内",
        subject: "【お見積】{{company}}様 {{project}}のご案内",
        body: `{{name}} 様

お世話になっております。{{ourCompany}}の{{sender}}です。

ご依頼いただきました「{{project}}」の見積書を送付いたします。
内容をご確認のうえ、ご不明点がございましたらお気軽にお申し付けください。

有効期限：{{deadline}}

ご検討のほど、よろしくお願いいたします。`,
        variableKeys: [
          "company",
          "name",
          "ourCompany",
          "sender",
          "project",
          "deadline",
        ],
        tagIndices: [2, 0],
      },
      {
        title: "フォローアップ（営業）",
        subject: "【ご確認】{{company}}様 {{product}}のご提案について",
        body: `{{name}} 様

お世話になっております。{{ourCompany}}の{{sender}}です。

先日ご提案いたしました「{{product}}」について、その後ご検討状況はいかがでしょうか。

追加資料やデモのご案内も可能ですので、ご希望がございましたらお知らせください。

お忙しいところ恐れ入りますが、ご確認のほどよろしくお願いいたします。`,
        variableKeys: ["company", "name", "ourCompany", "sender", "product"],
        tagIndices: [2, 4],
      },
      {
        title: "納品完了のご連絡",
        subject: "【納品完了】{{company}}様 {{deliverable}}",
        body: `{{name}} 様

お世話になっております。{{ourCompany}}の{{sender}}です。

「{{deliverable}}」の納品が完了いたしましたのでご連絡いたします。

納品内容に問題がございませんでしたら、ご確認の旨ご返信いただけますと幸いです。
不具合や修正のご要望がございましたら、{{supportUntil}}までにお知らせください。

引き続きよろしくお願いいたします。`,
        variableKeys: [
          "company",
          "name",
          "ourCompany",
          "sender",
          "deliverable",
          "supportUntil",
        ],
        tagIndices: [1],
      },
    ],
  },
  actions: {
    tagMaster: "ラベル管理",
    variableMaster: "変数マスタ",
    newTemplate: "＋ 新規テンプレート追加",
    tagMasterShort: "ラベル",
    variableMasterShort: "変数",
    newTemplateShort: "＋ 新規",
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
    listSeparator: "、",
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
  install: {
    button: "このアプリをインストール",
    buttonShort: "インストール",
    buttonTiny: "インストール",
    buttonAria: "メールテンプレをインストールして、個別アプリとして使う",
    modalTitle: "アプリをインストール",
    modalLead:
      "対応ブラウザからインストールすると、メールテンプレだけを個別アプリとしてすぐ開けます。",
    step1Title: "共有をタップ",
    step1Body: "画面下（または上）の共有アイコン［↑］をタップします。",
    step2Title: "「ホーム画面に追加」",
    step2Body: "メニューを下にスクロールし、「ホーム画面に追加」を選びます。",
    desktopTitle: "アプリとしてインストール",
    desktopLead:
      "Chrome / Edge なら、アドレスバーやメニューからメールテンプレを独立アプリとして追加できます。",
    desktopStep1Title: "ブラウザのメニューを開く",
    desktopStep1Body:
      "画面右上の「︙」またはアドレスバー横のインストールアイコンを探します。",
    desktopStep2Title: "「アプリをインストール」",
    desktopStep2Body:
      "「メールテンプレをインストール」や「アプリをインストール」を選ぶとホーム／デスクトップに追加されます。",
    modalClose: "わかった",
  },
};

export const mailTemplateEn: MailTemplateDict = {
  shell: {
    title: "Smart Mail Template Manager",
    description:
      "Craft replies instantly with variables and labels. Data stays in your browser.",
  },
  combinedText: {
    subjectOnly: "Subject: {subject}",
    both: "Subject: {subject}\n\nBody:\n{body}",
  },
  colorLabels: {
    red: "Red",
    orange: "Orange",
    amber: "Amber",
    green: "Green",
    emerald: "Emerald",
    cyan: "Cyan",
    blue: "Blue",
    indigo: "Indigo",
    purple: "Purple",
    pink: "Pink",
  },
  defaults: {
    variables: [
      { key: "company", label: "Company name" },
      { key: "name", label: "Contact name" },
      { key: "ourCompany", label: "Our company" },
      { key: "sender", label: "Sender name" },
      { key: "slot1", label: "Option 1 (date/time)" },
      { key: "slot2", label: "Option 2 (date/time)" },
      { key: "slot3", label: "Option 3 (date/time)" },
      { key: "project", label: "Project name" },
      { key: "deadline", label: "Valid until" },
      { key: "product", label: "Product / service" },
      { key: "deliverable", label: "Deliverable" },
      { key: "supportUntil", label: "Support until" },
      { key: "subject_code", label: "Ticket ID" },
      { key: "due_date", label: "Due date" },
    ],
    tags: [
      { name: "Important", color: "red" },
      { name: "Support", color: "blue" },
      { name: "Sales", color: "emerald" },
      { name: "Internal", color: "indigo" },
      { name: "Follow-up", color: "amber" },
    ],
    templates: [
      {
        title: "First reply to an inquiry",
        subject: "Re: Your inquiry — {{company}}",
        body: `Dear {{name}},

Thank you for contacting us.

We have received your message and will get back to you shortly.
If you have any urgent questions, please reply to this email.

Best regards,`,
        variableKeys: ["company", "name"],
        tagIndices: [1],
      },
      {
        title: "Schedule a meeting",
        subject: "Meeting times — {{company}} × {{ourCompany}}",
        body: `Dear {{name}},

This is {{sender}} from {{ourCompany}}. Thank you for your time recently.

Would any of the following times work for you?

· Option 1: {{slot1}}
· Option 2: {{slot2}}
· Option 3: {{slot3}}

Please let us know your preference.

Best regards,`,
        variableKeys: [
          "company",
          "ourCompany",
          "name",
          "sender",
          "slot1",
          "slot2",
          "slot3",
        ],
        tagIndices: [2, 3],
      },
      {
        title: "Send a quote",
        subject: "Quote for {{project}} — {{company}}",
        body: `Dear {{name}},

This is {{sender}} from {{ourCompany}}.

Please find attached our quote for "{{project}}".
If you have any questions, feel free to reach out.

Valid until: {{deadline}}

We look forward to hearing from you.`,
        variableKeys: [
          "company",
          "name",
          "ourCompany",
          "sender",
          "project",
          "deadline",
        ],
        tagIndices: [2, 0],
      },
      {
        title: "Sales follow-up",
        subject: "Following up — {{product}} for {{company}}",
        body: `Dear {{name}},

This is {{sender}} from {{ourCompany}}.

I wanted to follow up on our proposal for "{{product}}".
Happy to share more materials or arrange a demo if helpful.

Thank you for your time.`,
        variableKeys: ["company", "name", "ourCompany", "sender", "product"],
        tagIndices: [2, 4],
      },
      {
        title: "Delivery complete",
        subject: "Delivered: {{deliverable}} — {{company}}",
        body: `Dear {{name}},

This is {{sender}} from {{ourCompany}}.

We have completed delivery of "{{deliverable}}".
Please confirm receipt when convenient.

If you notice any issues, let us know by {{supportUntil}}.

Thank you,`,
        variableKeys: [
          "company",
          "name",
          "ourCompany",
          "sender",
          "deliverable",
          "supportUntil",
        ],
        tagIndices: [1],
      },
    ],
  },
  actions: {
    tagMaster: "Manage labels",
    variableMaster: "Variable master",
    newTemplate: "+ New template",
    tagMasterShort: "Labels",
    variableMasterShort: "Vars",
    newTemplateShort: "+ New",
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
    listSeparator: ", ",
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
  install: {
    button: "Install this app",
    buttonShort: "Install",
    buttonTiny: "Install",
    buttonAria: "Install Mail Templates as a standalone app",
    modalTitle: "Install app",
    modalLead:
      "Install Mail Templates from Safari to open it as its own app — not the portal.",
    step1Title: "Tap Share",
    step1Body: "Tap the Share icon [↑] at the bottom (or top) of Safari.",
    step2Title: "Add to Home Screen",
    step2Body: "Scroll the menu and choose “Add to Home Screen”.",
    desktopTitle: "Install as an app",
    desktopLead:
      "In Chrome or Edge, install Mail Templates as its own app from the address bar or browser menu.",
    desktopStep1Title: "Open the browser menu",
    desktopStep1Body:
      "Look for the ⋮ menu or the install icon near the address bar.",
    desktopStep2Title: "Install app",
    desktopStep2Body:
      "Choose “Install Mail Templates” / “Install app” to add it to your home screen or desktop.",
    modalClose: "Got it",
  },
};
