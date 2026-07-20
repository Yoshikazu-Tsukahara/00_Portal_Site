import type { AppShellCopy } from "./otherApps";

export type CharacterRelationDict = {
  shell: AppShellCopy;
  loading: string;
  privacyBanner: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  close: string;
  confirmDeleteCharacter: string;
  sidebar: {
    tabsLabel: string;
    characters: string;
    relations: string;
    charactersHint: string;
    relationsHint: string;
    addCharacter: string;
    emptyCharacters: string;
    emptyRelations: string;
    link: string;
    linking: string;
    linkHint: string;
    noLabel: string;
  };
  tabs: {
    label: string;
    canvas: string;
    detail: string;
  };
  canvas: {
    empty: string;
    noNote: string;
    labelPlaceholder: string;
    pickTarget: string;
    doubleClickEdit: string;
    editLabelTitle: string;
    editLabelHint: string;
    editLabelAction: string;
  };
  placement: {
    label: string;
    snap: string;
    free: string;
    snapHint: string;
    freeHint: string;
  };
  lineStyles: {
    heading: string;
    solid: string;
    dashed: string;
    dotted: string;
  };
  arrowHead: {
    heading: string;
    none: string;
    end: string;
    start: string;
    both: string;
  };
  view: {
    zoomIn: string;
    zoomOut: string;
    memorize: string;
    reset: string;
    resetToFavorite: string;
    resetToDefault: string;
    favoriteHint: string;
    defaultHint: string;
  };
  fields: {
    name: string;
    namePlaceholder: string;
    avatar: string;
    avatarUpload: string;
    avatarClear: string;
    avatarHint: string;
    avatarPresets: string;
    note: string;
    notePlaceholder: string;
    accent: string;
  };
  avatarPresets: {
    man: string;
    woman: string;
    boy: string;
    girl: string;
    org: string;
    company: string;
    other: string;
  };
  detail: {
    selectPrompt: string;
    unnamed: string;
    hint: string;
    profileHeading: string;
    showOnCard: string;
    visibleCount: string;
    maxVisibleAlert: string;
    avatarError: string;
  };
  detailFields: {
    note: string;
    nickname: string;
    age: string;
    gender: string;
    appearance: string;
    goal: string;
    secret: string;
    relationMemo: string;
    backstory: string;
  };
  detailPlaceholders: {
    note: string;
    nickname: string;
    age: string;
    gender: string;
    appearance: string;
    goal: string;
    secret: string;
    relationMemo: string;
    backstory: string;
  };
  modal: {
    createTitle: string;
  };
};

export const characterRelationJa: CharacterRelationDict = {
  shell: {
    title: "小説相関図エディター",
    description:
      "登場人物の立ち位置と関係性を、カードと線で直感的に整理する相関図ツール。",
  },
  loading: "読込中…",
  privacyBanner:
    "🔒 相関図データはすべてお使いのブラウザ内（ローカル）のみに保存され、サーバーへ送信されることは一切ありません。",
  edit: "編集",
  delete: "削除",
  save: "保存",
  cancel: "キャンセル",
  close: "閉じる",
  confirmDeleteCharacter: "「{name}」を削除しますか？関連する線も消えます。",
  sidebar: {
    tabsLabel: "サイドバーの表示切り替え",
    characters: "キャラクター一覧",
    relations: "関係性一覧",
    charactersHint: "登場人物の管理",
    relationsHint: "線で結んだ関係の一覧",
    addCharacter: "＋ 追加",
    emptyCharacters: "まだキャラクターがありません",
    emptyRelations: "線で結ぶとここに表示されます",
    link: "結ぶ",
    linking: "選択中",
    linkHint: "キャンバス上のもう一人をクリックして関係線を作成します",
    noLabel: "（ラベル未設定）",
  },
  tabs: {
    label: "メイン表示の切り替え",
    canvas: "相関図キャンバス",
    detail: "詳細エディタ",
  },
  canvas: {
    empty: "左の「追加」からキャラクターを配置してください",
    noNote: "カード表示なし",
    labelPlaceholder: "関係性（例: ライバル）",
    pickTarget: "相手をクリック…",
    doubleClickEdit: "ダブルクリックで関係テキストを編集",
    editLabelTitle: "関係性テキスト",
    editLabelHint: "Enter で確定 / Esc でキャンセル",
    editLabelAction: "テキストを編集…",
  },
  placement: {
    label: "カード配置モード",
    snap: "グリッドスナップ",
    free: "完全自由",
    snapHint: "ドラッグ中は自由移動、離した瞬間にマス目へ吸着します",
    freeHint: "ピクセル単位で自由に置けます",
  },
  lineStyles: {
    heading: "線のスタイル",
    solid: "実線",
    dashed: "点線",
    dotted: "破線",
  },
  arrowHead: {
    heading: "矢印の方向",
    none: "なし",
    end: "終点",
    start: "始点",
    both: "両端",
  },
  view: {
    zoomIn: "拡大",
    zoomOut: "縮小",
    memorize: "今の表示を記憶",
    reset: "表示をリセット",
    resetToFavorite: "記憶した表示位置へ戻す",
    resetToDefault: "初期表示（100%・左上）へ戻す",
    favoriteHint: "リセットで記憶したズーム・位置へ戻ります",
    defaultHint: "Ctrl＋ホイールでもズームできます",
  },
  fields: {
    name: "名前",
    namePlaceholder: "例: 主人公・蒼",
    avatar: "アイコン",
    avatarUpload: "画像を選ぶ",
    avatarClear: "アイコンを外す",
    avatarHint:
      "プリセットをワンクリックで選ぶか、イラスト／写真をアップロードできます。",
    avatarPresets: "デフォルトアイコン",
    note: "短い説明・立ち位置",
    notePlaceholder: "例: 寡黙な剣士／物語の語り手",
    accent: "アクセントカラー",
  },
  avatarPresets: {
    man: "男性",
    woman: "女性",
    boy: "男の子",
    girl: "女の子",
    org: "組織",
    company: "会社",
    other: "その他",
  },
  detail: {
    selectPrompt:
      "左の一覧からキャラクターを選ぶか、キャンバス上のカードをダブルクリックしてください。",
    unnamed: "（無名）",
    hint: "チェックを入れた項目だけがキャンバスのカードに表示されます（最大3項目）。",
    profileHeading: "小説設定",
    showOnCard: "カードに表示",
    visibleCount: "カード表示 {count}/{max}",
    maxVisibleAlert:
      "カードに同時表示できるのは最大 {max} 項目です。ほかのチェックを外してから選んでください。",
    avatarError: "画像を読み込めませんでした。別のファイルをお試しください。",
  },
  detailFields: {
    note: "短い説明・立ち位置",
    nickname: "二つ名",
    age: "年齢",
    gender: "性別",
    appearance: "外見特徴",
    goal: "目的・動機",
    secret: "秘密",
    relationMemo: "関係性のメモ",
    backstory: "バックストーリー",
  },
  detailPlaceholders: {
    note: "例: 寡黙な剣士／物語の語り手",
    nickname: "例: 蒼き影",
    age: "例: 17 / 不詳",
    gender: "例: 男 / 女 / その他",
    appearance: "髪・瞳・服装など、見た目のポイント",
    goal: "何を望み、何のために動くか",
    secret: "本人や周囲が知らない事実",
    relationMemo: "他キャラとの関係で覚えておきたいこと",
    backstory: "生い立ちや過去の出来事",
  },
  modal: {
    createTitle: "キャラクターを追加",
  },
};

export const characterRelationEn: CharacterRelationDict = {
  shell: {
    title: "Character Relation Editor",
    description:
      "Map characters and their relationships with draggable cards and labeled links.",
  },
  loading: "Loading…",
  privacyBanner:
    "🔒 Relation map data stays only in your browser (locally) and is never sent to a server.",
  edit: "Edit",
  delete: "Delete",
  save: "Save",
  cancel: "Cancel",
  close: "Close",
  confirmDeleteCharacter:
    "Delete “{name}”? Related links will be removed too.",
  sidebar: {
    tabsLabel: "Sidebar view",
    characters: "Characters",
    relations: "Relations",
    charactersHint: "Manage cast members",
    relationsHint: "Links between characters",
    addCharacter: "+ Add",
    emptyCharacters: "No characters yet",
    emptyRelations: "Links will appear here",
    link: "Link",
    linking: "Picking",
    linkHint: "Click another character on the canvas to create a relation",
    noLabel: "(No label)",
  },
  tabs: {
    label: "Main view",
    canvas: "Relation canvas",
    detail: "Detail editor",
  },
  canvas: {
    empty: "Add a character from the sidebar to begin",
    noNote: "Nothing on card",
    labelPlaceholder: "Relation (e.g. Rival)",
    pickTarget: "Click a target…",
    doubleClickEdit: "Double-click to edit relation text",
    editLabelTitle: "Relation text",
    editLabelHint: "Enter to save / Esc to cancel",
    editLabelAction: "Edit text…",
  },
  placement: {
    label: "Card placement",
    snap: "Grid snap",
    free: "Free",
    snapHint: "Move freely while dragging; snaps to grid on release",
    freeHint: "Place cards freely by the pixel",
  },
  lineStyles: {
    heading: "Line style",
    solid: "Solid",
    dashed: "Dashed",
    dotted: "Dotted",
  },
  arrowHead: {
    heading: "Arrow direction",
    none: "None",
    end: "End",
    start: "Start",
    both: "Both",
  },
  view: {
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    memorize: "Remember view",
    reset: "Reset view",
    resetToFavorite: "Restore remembered zoom and position",
    resetToDefault: "Reset to default (100%, top-left)",
    favoriteHint: "Reset restores your remembered zoom and scroll",
    defaultHint: "Ctrl + wheel also zooms",
  },
  fields: {
    name: "Name",
    namePlaceholder: "e.g. Protagonist Aoi",
    avatar: "Icon",
    avatarUpload: "Choose image",
    avatarClear: "Clear icon",
    avatarHint: "Pick a preset in one click, or upload an illustration/photo.",
    avatarPresets: "Default icons",
    note: "Short note / role",
    notePlaceholder: "e.g. Quiet swordsman / Narrator",
    accent: "Accent color",
  },
  avatarPresets: {
    man: "Man",
    woman: "Woman",
    boy: "Boy",
    girl: "Girl",
    org: "Org",
    company: "Company",
    other: "Other",
  },
  detail: {
    selectPrompt:
      "Select a character in the sidebar, or double-click a card on the canvas.",
    unnamed: "(Unnamed)",
    hint: "Checked fields appear on the canvas card (up to 3).",
    profileHeading: "Story profile",
    showOnCard: "Show on card",
    visibleCount: "On card {count}/{max}",
    maxVisibleAlert:
      "You can show up to {max} fields on a card. Uncheck another first.",
    avatarError: "Could not load that image. Try another file.",
  },
  detailFields: {
    note: "Short note / role",
    nickname: "Epithet",
    age: "Age",
    gender: "Gender",
    appearance: "Appearance",
    goal: "Goal / motive",
    secret: "Secret",
    relationMemo: "Relation notes",
    backstory: "Backstory",
  },
  detailPlaceholders: {
    note: "e.g. Quiet swordsman / Narrator",
    nickname: "e.g. Azure Shadow",
    age: "e.g. 17 / Unknown",
    gender: "e.g. Male / Female / Other",
    appearance: "Hair, eyes, clothing, and other visual notes",
    goal: "What they want and why they act",
    secret: "Facts they or others don’t know",
    relationMemo: "Notes about ties to other characters",
    backstory: "Origins and past events",
  },
  modal: {
    createTitle: "Add character",
  },
};
