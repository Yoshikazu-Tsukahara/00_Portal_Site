import type { AppShellCopy } from "./otherApps";

export type BookVisualizerDict = {
  shell: AppShellCopy;
  loading: string;
  layout: {
    label: string;
    japanese: string;
    western: string;
    photo: string;
    japaneseHint: string;
    westernHint: string;
    photoHint: string;
  };
  paper: {
    bunko: string;
    shinsho: string;
    shiroku: string;
    a5: string;
    b5: string;
    a4: string;
    massMarket: string;
    trade: string;
    square: string;
    phone: string;
  };
  home: {
    lead: string;
    createTitle: string;
    createLead: string;
    createButton: string;
    createConfirm: string;
    resumeNote: string;
    resumeButton: string;
    samplesHeading: string;
    samplesLead: string;
    sampleConfirm: string;
    samples: {
      novel: { title: string; lead: string };
      western: { title: string; lead: string };
      photo: { title: string; lead: string };
    };
    readTitle: string;
    readLead: string;
    readButton: string;
    dropActive: string;
    error: string;
  };
  edit: {
    backHome: string;
    backHomeShort: string;
    exportButton: string;
    exportShort: string;
    exportEmpty: string;
    readButton: string;
    readShort: string;
    readEmpty: string;
    blockPlaceholder: string;
    freeTextPlaceholder: string;
    canvas: {
      emptyHint: string;
    };
    thumbnails: {
      title: string;
      pageLabel: string;
      empty: string;
      imageOnly: string;
      addPage: string;
      dragHint: string;
      removePage: string;
      /** 本文仮想ページ削除の確認 */
      confirmRemoveBodyPage: string;
    };
    toolbar: {
      prev: string;
      next: string;
      pageLabel: string;
      addPage: string;
      removePage: string;
      confirmRemovePage: string;
      addBlockGroup: string;
      addHeading: string;
      addText: string;
      addFreeText: string;
      addImage: string;
      viewSingle: string;
      viewSpread: string;
      viewModeLabel: string;
      zoomLabel: string;
      zoomIn: string;
      zoomOut: string;
      zoomFit: string;
      zoomFitHint: string;
      zoom100: string;
      undo: string;
      redo: string;
      undoHint: string;
      redoHint: string;
      pageBreak: string;
      pageBreakHint: string;
      /** 紙面上の細い目印用（短い文言） */
      pageBreakMark: string;
      /** 目印クリック後 Delete で削除、など */
      pageBreakMarkHint: string;
      togglePages: string;
      togglePagesHint: string;
      toggleSettings: string;
      toggleSettingsHint: string;
      /** 編集画面の表示領域（通常／ウィンドウ全画面／完全フルスクリーン） */
      chromeModeLabel: string;
      chromeNormal: string;
      chromeNormalHint: string;
      chromeImmersive: string;
      chromeImmersiveHint: string;
      chromeBrowser: string;
      chromeBrowserHint: string;
    };
    panel: {
      tabFormat: string;
      tabPage: string;
      tabBlock: string;
      tabPrompts: string;
      openLabel: string;
      closeLabel: string;
    };
    page: {
      /** 本文ページ選択中のページタブ説明 */
      bodyStreamHint: string;
      pageType: string;
      pageTypeStandard: string;
      pageTypeCover: string;
      pageTypeBackCover: string;
      pageTypeTitlePage: string;
      pageTypeToc: string;
      pageTypeHint: string;
      pageTypeUniqueHint: string;
      pageTypeTakenSuffix: string;
      pageTypeCoverEdgeOnly: string;
      pageTypeBackCoverEdgeOnly: string;
      chromeByType: string;
      chromeByTypeHint: string;
      chromeCount: string;
      chromeCountHint: string;
      chromeHeader: string;
      chromeFolio: string;
      chromeFolioNeedsCount: string;
      chromeNoTypes: string;
      chromeHeaderDisabledHint: string;
      chromeHeaderBodyOnly: string;
    };
    toc: {
      title: string;
      empty: string;
      hint: string;
      /** 目次専用の段数（本文の段組みとは独立） */
      columns: string;
      columnsOne: string;
      columnsTwo: string;
      columnsHint: string;
      depth: string;
      depthChapter: string;
      depthSection: string;
      depthHint: string;
    };
    format: {
      title: string;
      titlePlaceholder: string;
      author: string;
      authorPlaceholder: string;
      bookType: string;
      bindingHintRight: string;
      bindingHintLeft: string;
      layoutMode: string;
      charsPerLine: string;
      /** 縦書き時の行数ラベル（縦の列数） */
      linesPerPageVertical: string;
      linesPerPage: string;
      columns: string;
      columnsOne: string;
      columnsTwo: string;
      /** 縦書き 2 段（上下） */
      columnsTwoVertical: string;
      /** 横書き 2 段（左右） */
      columnsTwoHorizontal: string;
      /** 余白・行数が絶対で、文字数からサイズ・字間を自動調整する旨 */
      columnsHint: string;
      margins: string;
      marginTop: string;
      marginBottom: string;
      marginLeft: string;
      marginRight: string;
      marginsHint: string;
      marginLinkVertical: string;
      marginLinkHorizontal: string;
      marginWheelHint: string;
      headerMode: string;
      headerTitle: string;
      headerChapter: string;
      headerNone: string;
      headerHint: string;
      headerSpread: string;
      headerSpreadBoth: string;
      headerSpreadLeft: string;
      headerSpreadRight: string;
      headerSpreadHint: string;
      headerAlign: string;
      folioAlign: string;
      alignLeft: string;
      alignCenter: string;
      alignRight: string;
      sheetSize: string;
      fontFamily: string;
      fontFamilyH1: string;
      fontFamilyH2: string;
      fontFamilyP: string;
      fontFamilyHint: string;
      fontGroupJapanese: string;
      fontGroupLatin: string;
      computedFont: string;
      computedFontValue: string;
      capacity: string;
      capacityValue: string;
    };
    block: {
      none: string;
      kindText: string;
      kindImage: string;
      kindFreeText: string;
      freeTextDragHint: string;
      level: string;
      levelH1: string;
      levelH2: string;
      levelP: string;
      caption: string;
      captionPlaceholder: string;
      replaceImage: string;
      fullBleed: string;
      fullBleedHint: string;
      fontFamily: string;
      fontScale: string;
      writingMode: string;
      writingHorizontal: string;
      writingVertical: string;
      writingModeHint: string;
      layer: string;
      layerHint: string;
      layerFront: string;
      layerForward: string;
      layerBackward: string;
      layerBack: string;
      moveUp: string;
      moveDown: string;
      remove: string;
      confirmRemove: string;
    };
    palette: {
      heading: string;
      hint: string;
      placeholder: string;
      selectFirst: string;
    };
    image: {
      typeError: string;
      sizeError: string;
      readError: string;
    };
    prompts: {
      heading: string;
      lead: string;
      add: string;
      empty: string;
      titlePlaceholder: string;
      bodyPlaceholder: string;
      copy: string;
      copied: string;
      copyFailed: string;
      remove: string;
      confirmRemove: string;
    };
  };
  view: {
    close: string;
    prev: string;
    next: string;
    position: string;
    hint: string;
    /** 全画面表示の切り替え */
    fullscreen: string;
    exitFullscreen: string;
    untitled: string;
    empty: string;
    endHome: string;
    endRestart: string;
    endEdit: string;
    endEditConfirm: string;
  };
};

export const bookVisualizerJa: BookVisualizerDict = {
  shell: {
    title: "AI ブック・スタジオ",
    description:
      "AI 作品を本の紙面そのもので組む DTP エディター。用紙サイズと文字数・行数から文字サイズを自動計算し、縦書き／横書き／写真集で仕上げて .mybook で共有できます。",
  },
  loading: "読み込み中…",
  paper: {
    bunko: "文庫判（右開き）",
    shinsho: "新書判（右開き）",
    shiroku: "四六判・単行本（右開き）",
    a5: "A5判・同人誌（右開き）",
    b5: "B5判・雑誌（右開き）",
    a4: "A4判・資料（左開き）",
    massMarket: "マスマーケット判（左開き）",
    trade: "トレード判（左開き）",
    square: "スクエア・絵本（左開き）",
    phone: "スマホ縦型（左開き）",
  },
  layout: {
    label: "レイアウト",
    japanese: "縦書き",
    western: "横書き",
    photo: "写真集",
    japaneseHint:
      "明朝体・縦書き。用紙サイズと文字数・行数から文字サイズを自動計算します。",
    westernHint:
      "セリフ体・横書き。用紙サイズと文字数・行数から文字サイズを自動計算します。",
    photoHint: "余白なしのフルブリード表示。画像を主役にするモードです。",
  },
  home: {
    lead: "本を作るか、もらった本を読むか選んでください。",
    createTitle: "新しく本を作る",
    createLead:
      "紙面を直接クリックして書き込めるエディターです。データはこの端末の中だけに保存されます。",
    createButton: "白紙から始める",
    createConfirm:
      "制作中の下書きを破棄して、新しい本を作ります。よろしいですか？",
    resumeNote: "制作中の下書き：{title}",
    resumeButton: "続きから編集する",
    samplesHeading: "以下のサンプルから始める",
    samplesLead:
      "用紙サイズや組版の違いを、すぐ紙面で確かめられます。クリックすると編集画面が開きます。",
    sampleConfirm:
      "制作中の下書きをこのサンプルで置き換えます。よろしいですか？",
    samples: {
      novel: {
        title: "日本語小説",
        lead: "文庫・縦書き。四章＋節、章末区切り、柱と目次ノンブル連動の厚めサンプル。",
      },
      western: {
        title: "洋書風",
        lead: "トレード・横書き。三章＋コーダ、手動区切り付きの英語長文サンプル。",
      },
      photo: {
        title: "絵本・写真集",
        lead: "スクエア。五章の短文と写真ページ、扉・目次付きの構成サンプル。",
      },
    },
    readTitle: "持っている .mybook ファイルを読む",
    readLead:
      "ここにファイルをドロップすると、すぐに読書画面が開きます。クリックして選ぶこともできます。",
    readButton: "ファイルを選ぶ",
    dropActive: "ここで離すと開きます",
    error:
      "この形式のファイルは読み込めませんでした。.mybook ファイルを選んでください。",
  },
  edit: {
    backHome: "ホームに戻る",
    backHomeShort: "ホーム",
    exportButton: ".mybook で書き出す",
    exportShort: "書き出す",
    exportEmpty: "先に本文か画像を入れてください。",
    readButton: "全画面で読む",
    readShort: "読む",
    readEmpty: "読む中身がまだありません。",
    blockPlaceholder: "ここに文章を入力",
    freeTextPlaceholder: "テキストを入力",
    canvas: {
      emptyHint: "「＋本文」「＋テキストボックス」「＋画像」で書き始めてください",
    },
    thumbnails: {
      title: "ページ",
      pageLabel: "{n}",
      empty: "（空）",
      imageOnly: "画像",
      addPage: "＋次のページを追加",
      dragHint: "ドラッグで並べ替え",
      removePage: "このページを削除",
      confirmRemoveBodyPage:
        "この本文ページを削除します。直前に手動の区切りがあれば外し、なければこのページ上の文字を削除します。よろしいですか？",
    },
    toolbar: {
      prev: "前のページ",
      next: "次のページ",
      pageLabel: "{current} / {total} ページ",
      addPage: "＋次のページを追加",
      removePage: "ページ削除",
      confirmRemovePage: "このページを削除します。よろしいですか？",
      addBlockGroup: "ブロックを追加",
      addHeading: "＋見出し",
      addText: "＋本文",
      addFreeText: "＋テキストボックス",
      addImage: "＋画像",
      viewSingle: "単ページ",
      viewSpread: "見開き",
      viewModeLabel: "表示",
      zoomLabel: "拡大縮小",
      zoomIn: "拡大",
      zoomOut: "縮小",
      zoomFit: "適合",
      zoomFitHint: "画面に合わせる（Ctrl + ホイールでも拡大縮小）",
      zoom100: "100%",
      undo: "元に戻す",
      redo: "やり直し",
      undoHint: "Ctrl+Z",
      redoHint: "Ctrl+Y",
      pageBreak: "ページ区切り",
      pageBreakHint:
        "キャレット位置でページを分けます（Ctrl+Enter／本文ページのみ）",
      pageBreakMark: "区切り",
      pageBreakMarkHint:
        "この区切りを選択して Delete（または Backspace）で削除。次ページ先頭の Backspace でも可",
      togglePages: "ページ",
      togglePagesHint: "左のページ一覧を表示／非表示",
      toggleSettings: "設定",
      toggleSettingsHint: "右の設定パネルを表示／非表示",
      chromeModeLabel: "表示領域",
      chromeNormal: "通常",
      chromeNormalHint: "サイトのヘッダーが見える通常の編集画面",
      chromeImmersive: "全画面",
      chromeImmersiveHint:
        "サイトのヘッダーを隠し、ブラウザ枠の中いっぱいに表示（OS のタスクバーは残る）",
      chromeBrowser: "完全フルスクリーン",
      chromeBrowserHint:
        "ブラウザと OS の枠を隠して画面全体に表示（Esc で解除）",
    },
    panel: {
      tabFormat: "書式",
      tabPage: "ページ",
      tabBlock: "ブロック",
      tabPrompts: "AI",
      openLabel: "設定",
      closeLabel: "閉じる",
    },
    page: {
      bodyStreamHint:
        "いまは本文ページを表示中です。下で柱・ノンブル・余白を設定できます。表紙・目次などの種類変更は、左の固定ページを選んでください。",
      pageType: "ページタイプ",
      pageTypeStandard: "標準",
      pageTypeCover: "表紙",
      pageTypeBackCover: "裏表紙",
      pageTypeTitlePage: "扉絵",
      pageTypeToc: "目次",
      pageTypeHint:
        "このページの役割です。目次にすると本文の章・節とノンブルが自動表示されます。総ページ数・柱・ノンブルは下の表で設定します。",
      pageTypeUniqueHint:
        "表紙は先頭のページだけに設定できます。裏表紙にすると自動で本の最後へ移ります。どちらもなくても構いません（各1ページまで）。",
      pageTypeTakenSuffix: "（設定済み）",
      pageTypeCoverEdgeOnly: "（先頭のみ）",
      pageTypeBackCoverEdgeOnly: "（表紙以外）",
      chromeByType: "表示とカウント",
      chromeByTypeHint: "使用中のタイプのみ",
      chromeCount: "総数",
      chromeCountHint:
        "「総数」オフのタイプ（表紙など）はノンブル連番・総ページ数に入りません。",
      chromeHeader: "柱",
      chromeFolio: "ノンブル",
      chromeFolioNeedsCount: "総数に含めたタイプだけノンブルを出せます",
      chromeNoTypes: "ページがありません。",
      chromeHeaderDisabledHint:
        "柱の内容が「非表示」のため、タイプ別の柱チェックは無効です。",
      chromeHeaderBodyOnly:
        "柱は本文（標準）ページだけに出せます。表紙・目次・扉などには表示しません。",
    },
    toc: {
      title: "目次",
      empty: "章・節がまだありません。本文に「章」「節」を付けるとここに並びます。",
      hint: "本文の章・節から自動生成されます。書籍タイプに合わせて体裁が変わります。項目が多いときは目次ページが自動で増えます。",
      columns: "目次の段組み",
      columnsOne: "1 段",
      columnsTwo: "2 段",
      columnsHint:
        "本文の段組みとは別に設定できます。縦書き・横書きとも同じ考え方で、入りきらない分は次の目次ページへ送ります。",
      depth: "目次に載せる範囲",
      depthChapter: "章のみ",
      depthSection: "章＋節",
      depthHint: "節まで出すか、章だけにするかを選べます。",
    },
    format: {
      title: "タイトル",
      titlePlaceholder: "例）銀河を渡る図書館",
      author: "著者名",
      authorPlaceholder: "例）名無しの案内人",
      bookType: "書籍タイプ",
      bindingHintRight:
        "右開きです。見開きでは右が奇数（1,3…）、左が偶数（2,4…）で、右から読みます。",
      bindingHintLeft:
        "左開きです。見開きでは左が偶数（2,4…）、右が奇数（1,3…）で、左から読みます。",
      layoutMode: "組版レイアウト",
      charsPerLine: "1 行の文字数（本文）",
      linesPerPageVertical: "1 ページの行数／列数（本文）",
      linesPerPage: "1 ページの行数（本文）",
      columns: "段組み",
      columnsOne: "1 段",
      columnsTwo: "2 段",
      columnsTwoVertical: "上下 2 段",
      columnsTwoHorizontal: "左右 2 段",
      columnsHint:
        "2 段にすると、縦書きは上下・横書きは左右に版面を分けます。行数は 1 段あたりの値で、1 ページの分量は行数×段数です。章・節は大きな字のため 1 行の字数が減ります。",
      margins: "余白",
      marginTop: "上",
      marginBottom: "下",
      marginLeft: "左",
      marginRight: "右",
      marginsHint:
        "上下左右の余白は固定です。文字数を変えてもこの帯の幅は変わりません（単位: px）。",
      marginLinkVertical: "上下を同じにする",
      marginLinkHorizontal: "左右を同じにする",
      marginWheelHint: "ホイールで増減",
      headerMode: "柱（ヘッダー）",
      headerTitle: "作品タイトル",
      headerChapter: "章タイトル",
      headerNone: "非表示",
      headerHint:
        "各ページの上端に小さく表示されます。章タイトルは直近の章・節見出しを使います。",
      headerSpread: "見開きの柱",
      headerSpreadBoth: "両ページ",
      headerSpreadLeft: "左のみ",
      headerSpreadRight: "右のみ",
      headerSpreadHint:
        "見開き表示で、左右どちらの紙に柱を出すかです。単ページ表示でも同じ左右判定を使います。",
      headerAlign: "柱の位置",
      folioAlign: "ノンブルの位置",
      alignLeft: "左",
      alignCenter: "中央",
      alignRight: "右",
      sheetSize: "キャンバス",
      fontFamily: "フォント（書体）",
      fontFamilyH1: "章",
      fontFamilyH2: "節",
      fontFamilyP: "本文",
      fontFamilyHint:
        "章・節・本文それぞれに書体を選べます。変えると版面の再計算が走ります。",
      fontGroupJapanese: "日本語",
      fontGroupLatin: "欧文",
      computedFont: "自動計算の文字",
      computedFontValue:
        "{size}px / マス {cellInline}×{cellBlock}px",
      capacity: "1 ページの目安（本文）",
      capacityValue: "約 {chars} 字 / {lines} 行",
    },
    block: {
      none: "紙面のブロックを選ぶと、ここで設定できます。",
      kindText: "テキストブロック",
      kindImage: "画像ブロック",
      kindFreeText: "テキストボックス",
      freeTextDragHint:
        "枠をドラッグして移動。ダブルクリックまたは Enter で文字編集（Esc で終了）",
      level: "テキスト階層",
      levelH1: "章",
      levelH2: "節",
      levelP: "本文",
      caption: "キャプション",
      captionPlaceholder: "画像の説明（任意）",
      replaceImage: "画像を差し替える",
      fullBleed: "ページ全体に配置（フルブリード）",
      fullBleedHint: "余白ゼロで用紙いっぱいに広げ、背景のように使えます。",
      fontFamily: "フォント（書体）",
      fontScale: "文字の大きさ",
      writingMode: "書き方向",
      writingHorizontal: "横書き",
      writingVertical: "縦書き",
      writingModeHint: "本文の組版とは別に、この文字だけ縦／横を選べます。",
      layer: "レイヤー（重なり順）",
      layerHint:
        "押すとすぐ重なりが変わります。「背面へ」を繰り返すと本文の下にも回せます。",
      layerFront: "最前面へ",
      layerForward: "前面へ",
      layerBackward: "背面へ",
      layerBack: "最背面へ",
      moveUp: "前へ",
      moveDown: "後ろへ",
      remove: "削除",
      confirmRemove: "このブロックを削除します。よろしいですか？",
    },
    palette: {
      heading: "入力パレット（横書き）",
      hint: "縦書き紙面はカーソルが乱れやすいため、入力はここで行います",
      placeholder: "ここに入力すると、紙面へすぐ反映されます。",
      selectFirst: "紙面のテキストブロックを選んでください。",
    },
    image: {
      typeError: "画像ファイルを選んでください。",
      sizeError:
        "画像が大きすぎます（3MB まで）。圧縮してから追加してください。",
      readError: "画像の読み込みに失敗しました。",
    },
    prompts: {
      heading: "プロンプト・メモ",
      lead: "よく使う指示や設定資料をストックしておく場所です。共有ファイルには含まれません。",
      add: "＋ メモを追加",
      empty: "まだメモがありません。",
      titlePlaceholder: "メモの名前（例：文体の指定）",
      bodyPlaceholder: "AI に渡す指示や設定を書いておきます。",
      copy: "コピー",
      copied: "コピーしました",
      copyFailed: "コピーできませんでした。手動で選択してください。",
      remove: "このメモを削除",
      confirmRemove: "このメモを削除します。よろしいですか？",
    },
  },
  view: {
    close: "閉じる",
    prev: "前へ",
    next: "次へ",
    position: "{current} / {total}",
    hint: "ページの端をクリック、またはドラッグ／スワイプでめくれます",
    fullscreen: "全画面で読む",
    exitFullscreen: "全画面を終了",
    untitled: "無題の本",
    empty: "表示できるページがありません。",
    endHome: "ホームに戻る",
    endRestart: "最初から読む",
    endEdit: "この本を自分の下書きにする",
    endEditConfirm: "編集中の下書きをこの本で置き換えます。よろしいですか？",
  },
};

export const bookVisualizerEn: BookVisualizerDict = {
  shell: {
    title: "AI Book Studio",
    description:
      "A DTP editor that lays out AI work on the page itself. Pick a paper size, set characters and lines, and the font size is computed for you—then finish in vertical, horizontal, or photo style and share as a .mybook file.",
  },
  loading: "Loading…",
  paper: {
    bunko: "Bunko (right-bound)",
    shinsho: "Shinsho (right-bound)",
    shiroku: "Shiroku / hardcover (right-bound)",
    a5: "A5 / zine (right-bound)",
    b5: "B5 / magazine (right-bound)",
    a4: "A4 / document (left-bound)",
    massMarket: "Mass-market paperback (left-bound)",
    trade: "Trade paperback (left-bound)",
    square: "Square / picture book (left-bound)",
    phone: "Phone portrait (left-bound)",
  },
  layout: {
    label: "Layout",
    japanese: "Vertical",
    western: "Horizontal",
    photo: "Photo book",
    japaneseHint:
      "Serif vertical text. Font size is derived from paper size, characters per line, and lines per page.",
    westernHint:
      "Serif horizontal text. Font size is derived from paper size, characters per line, and lines per page.",
    photoHint: "Full-bleed images with no margins—best for visual work.",
  },
  home: {
    lead: "Make a book, or read one someone sent you.",
    createTitle: "Create a new book",
    createLead:
      "Type straight onto the page in the editor. Everything stays on this device.",
    createButton: "Start from a blank page",
    createConfirm: "This discards the draft in progress. Start a new book?",
    resumeNote: "Draft in progress: {title}",
    resumeButton: "Continue editing",
    samplesHeading: "Start from a sample",
    samplesLead:
      "Open a ready-made layout to see paper size and typesetting in action.",
    sampleConfirm: "Replace your current draft with this sample?",
    samples: {
      novel: {
        title: "Japanese novel",
        lead: "Bunko · vertical. Four chapters with sections, breaks, live TOC folios.",
      },
      western: {
        title: "Western paperback",
        lead: "Trade · horizontal. Three chapters plus coda, with manual page breaks.",
      },
      photo: {
        title: "Picture / photo book",
        lead: "Square. Five short chapters, photo plates, title page and TOC.",
      },
    },
    readTitle: "Read a .mybook file",
    readLead:
      "Drop a file here to open the reader right away, or click to choose one.",
    readButton: "Choose a file",
    dropActive: "Release to open",
    error: "That file could not be read. Please choose a .mybook file.",
  },
  edit: {
    backHome: "Back to home",
    backHomeShort: "Home",
    exportButton: "Export .mybook",
    exportShort: "Export",
    exportEmpty: "Add some text or an image first.",
    readButton: "Read full screen",
    readShort: "Read",
    readEmpty: "There is nothing to read yet.",
    blockPlaceholder: "Type here",
    freeTextPlaceholder: "Enter text",
    canvas: {
      emptyHint: "Start with + Text, + Text box, or + Image",
    },
    thumbnails: {
      title: "Pages",
      pageLabel: "{n}",
      empty: "(empty)",
      imageOnly: "Image",
      addPage: "+ Add next page",
      dragHint: "Drag to reorder",
      removePage: "Delete this page",
      confirmRemoveBodyPage:
        "Delete this body page? If there is a manual break before it, the break is removed; otherwise the text on this page is deleted.",
    },
    toolbar: {
      prev: "Previous page",
      next: "Next page",
      pageLabel: "Page {current} / {total}",
      addPage: "+ Add next page",
      removePage: "Delete page",
      confirmRemovePage: "Delete this page?",
      addBlockGroup: "Add block",
      addHeading: "+ Heading",
      addText: "+ Text",
      addFreeText: "+ Text box",
      addImage: "+ Image",
      viewSingle: "Single",
      viewSpread: "Spread",
      viewModeLabel: "View",
      zoomLabel: "Zoom",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      zoomFit: "Fit",
      zoomFitHint: "Fit to screen (Ctrl + scroll to zoom)",
      zoom100: "100%",
      undo: "Undo",
      redo: "Redo",
      undoHint: "Ctrl+Z",
      redoHint: "Ctrl+Y",
      pageBreak: "Page break",
      pageBreakHint:
        "Insert a page break at the caret (Ctrl+Enter; body pages only)",
      pageBreakMark: "Break",
      pageBreakMarkHint:
        "Select this break, then press Delete or Backspace to remove it. Backspace at the start of the next page also works.",
      togglePages: "Pages",
      togglePagesHint: "Show or hide the page list",
      toggleSettings: "Settings",
      toggleSettingsHint: "Show or hide the settings panel",
      chromeModeLabel: "Workspace size",
      chromeNormal: "Normal",
      chromeNormalHint: "Edit with the site header visible",
      chromeImmersive: "Fill window",
      chromeImmersiveHint:
        "Hide the site header and fill the browser window (OS taskbar stays)",
      chromeBrowser: "Full screen",
      chromeBrowserHint:
        "Hide browser and OS chrome for a true full-screen view (Esc to exit)",
    },
    panel: {
      tabFormat: "Format",
      tabPage: "Page",
      tabBlock: "Block",
      tabPrompts: "AI",
      openLabel: "Settings",
      closeLabel: "Close",
    },
    page: {
      bodyStreamHint:
        "You are viewing a body page. Configure header, folio, and margins below. To change page type, select a fixed page in the left rail.",
      pageType: "Page type",
      pageTypeStandard: "Standard",
      pageTypeCover: "Cover",
      pageTypeBackCover: "Back cover",
      pageTypeTitlePage: "Title page",
      pageTypeToc: "Contents",
      pageTypeHint:
        "Role of this page. Contents pages auto-list chapters and sections with folios. Total count, header, and folio are set by type below.",
      pageTypeUniqueHint:
        "Cover can only be set on the first page. Back cover moves to the end of the book. Both are optional (one each).",
      pageTypeTakenSuffix: " (in use)",
      pageTypeCoverEdgeOnly: " (first only)",
      pageTypeBackCoverEdgeOnly: " (not on cover)",
      chromeByType: "Display & count",
      chromeByTypeHint: "Used types only",
      chromeCount: "Count",
      chromeCountHint:
        "Types with Count off (e.g. cover) are excluded from folio numbering and total pages.",
      chromeHeader: "Hdr",
      chromeFolio: "Folio",
      chromeFolioNeedsCount: "Folio is available only for counted types",
      chromeNoTypes: "No pages yet.",
      chromeHeaderDisabledHint:
        "Header content is Hidden, so per-type header checks are disabled.",
      chromeHeaderBodyOnly:
        "Headers appear on standard body pages only—not on cover, contents, or title pages.",
    },
    toc: {
      title: "Contents",
      empty: "No chapters or sections yet. Mark text as Chapter or Section to list them here.",
      hint: "Generated from chapters and sections. Style follows the book type. Extra contents pages are added automatically when needed.",
      columns: "Contents columns",
      columnsOne: "1 column",
      columnsTwo: "2 columns",
      columnsHint:
        "Independent from body columns. Vertical and horizontal layouts use the same split; overflow continues on the next contents page.",
      depth: "Contents depth",
      depthChapter: "Chapters only",
      depthSection: "Chapters + sections",
      depthHint: "Choose whether sections appear under chapters.",
    },
    format: {
      title: "Title",
      titlePlaceholder: "e.g. The Library Across the Galaxy",
      author: "Author",
      authorPlaceholder: "e.g. The Nameless Guide",
      bookType: "Book type",
      bindingHintRight:
        "Right-bound. Odd pages (1, 3…) sit on the right; even pages (2, 4…) on the left. Read right to left.",
      bindingHintLeft:
        "Left-bound. Even pages (2, 4…) sit on the left; odd pages (1, 3…) on the right. Read left to right.",
      layoutMode: "Typesetting layout",
      charsPerLine: "Characters per line (body)",
      linesPerPageVertical: "Lines / columns per page (body)",
      linesPerPage: "Lines per page (body)",
      columns: "Columns",
      columnsOne: "1 column",
      columnsTwo: "2 columns",
      columnsTwoVertical: "2 tiers (top–bottom)",
      columnsTwoHorizontal: "2 columns (left–right)",
      columnsHint:
        "With 2 columns, vertical layout splits top–bottom and horizontal layout splits left–right. Lines per page is per column; page capacity is lines × columns. Headings wrap sooner because they are larger.",
      margins: "Margins",
      marginTop: "Top",
      marginBottom: "Bottom",
      marginLeft: "Left",
      marginRight: "Right",
      marginsHint:
        "Margins are fixed. Changing character count does not change these bands (px).",
      marginLinkVertical: "Link top & bottom",
      marginLinkHorizontal: "Link left & right",
      marginWheelHint: "Scroll to adjust",
      headerMode: "Running header",
      headerTitle: "Book title",
      headerChapter: "Chapter",
      headerNone: "Hidden",
      headerHint:
        "Shown small at the top of each page. Chapter uses the nearest heading.",
      headerSpread: "Spread header",
      headerSpreadBoth: "Both",
      headerSpreadLeft: "Left only",
      headerSpreadRight: "Right only",
      headerSpreadHint:
        "Which side of a spread shows the running header. Single-page view uses the same left/right rule.",
      headerAlign: "Header position",
      folioAlign: "Folio position",
      alignLeft: "Left",
      alignCenter: "Center",
      alignRight: "Right",
      sheetSize: "Canvas",
      fontFamily: "Font family",
      fontFamilyH1: "Chapter",
      fontFamilyH2: "Section",
      fontFamilyP: "Body",
      fontFamilyHint:
        "Choose fonts for chapter, section, and body. Changing a font recalculates the page layout.",
      fontGroupJapanese: "Japanese",
      fontGroupLatin: "Latin",
      computedFont: "Computed type",
      computedFontValue: "{size}px / cell {cellInline}×{cellBlock}px",
      capacity: "Page guide (body)",
      capacityValue: "~{chars} chars / {lines} lines",
    },
    block: {
      none: "Select a block on the page to edit its settings.",
      kindText: "Text block",
      kindImage: "Image block",
      kindFreeText: "Text box",
      freeTextDragHint:
        "Drag the box to move. Double-click or press Enter to edit text (Esc to finish)",
      level: "Text level",
      levelH1: "Chapter",
      levelH2: "Section",
      levelP: "Body",
      caption: "Caption",
      captionPlaceholder: "Describe the image (optional)",
      replaceImage: "Replace image",
      fullBleed: "Place full page (full bleed)",
      fullBleedHint: "Expand to the full sheet with zero margin for a background look.",
      fontFamily: "Font family",
      fontScale: "Text size",
      writingMode: "Writing direction",
      writingHorizontal: "Horizontal",
      writingVertical: "Vertical",
      writingModeHint: "Set vertical/horizontal independently from the body text.",
      layer: "Layer order",
      layerHint:
        "Changes apply immediately. Keep sending backward to place it under the body text.",
      layerFront: "Bring to front",
      layerForward: "Bring forward",
      layerBackward: "Send backward",
      layerBack: "Send to back",
      moveUp: "Earlier",
      moveDown: "Later",
      remove: "Delete",
      confirmRemove: "Delete this block?",
    },
    palette: {
      heading: "Input palette (horizontal)",
      hint: "Vertical pages have unreliable carets, so typing happens here",
      placeholder: "Type here and the page updates instantly.",
      selectFirst: "Select a text block on the page.",
    },
    image: {
      typeError: "Please choose an image file.",
      sizeError: "That image is too large (3MB max). Compress it first.",
      readError: "Could not read the image.",
    },
    prompts: {
      heading: "Prompt notes",
      lead: "Keep your go-to instructions and reference notes here. They are never included in shared files.",
      add: "+ Add note",
      empty: "No notes yet.",
      titlePlaceholder: "Note name (e.g. Tone of voice)",
      bodyPlaceholder: "Write the instructions you hand to the AI.",
      copy: "Copy",
      copied: "Copied",
      copyFailed: "Could not copy. Please select the text manually.",
      remove: "Delete this note",
      confirmRemove: "Delete this note?",
    },
  },
  view: {
    close: "Close",
    prev: "Previous",
    next: "Next",
    position: "{current} / {total}",
    hint: "Click a page edge, or drag / swipe to turn the page",
    fullscreen: "Full screen",
    exitFullscreen: "Exit full screen",
    untitled: "Untitled book",
    empty: "There are no pages to show.",
    endHome: "Back to home",
    endRestart: "Read again",
    endEdit: "Make this my draft",
    endEditConfirm: "This replaces the draft you are editing. Continue?",
  },
};
