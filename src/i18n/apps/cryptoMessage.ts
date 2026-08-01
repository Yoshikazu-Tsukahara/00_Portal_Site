import type { AppShellCopy } from "./otherApps";

/** ひみつメッセージアプリの UI 文言 */
export type CryptoMessageDict = {
  shell: AppShellCopy;
  modes: {
    create: string;
    /** 狭い画面向け */
    createShort: string;
    decode: string;
    /** 狭い画面向け */
    decodeShort: string;
  };
  decodeSubs: {
    password: string;
    passwordShort: string;
    caesar: string;
    caesarShort: string;
  };
  themes: {
    aria: string;
    cyber: { description: string };
    fantasy: { description: string };
    spy: { description: string };
  };
  create: {
    messageLabel: string;
    messagePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    passwordHint: string;
    themeLabel: string;
    encrypt: string;
    encrypting: string;
    encryptError: string;
    cipherLabel: string;
    copy: string;
    copied: string;
    copyFail: string;
    shareLine: string;
    shareLineShort: string;
    shareX: string;
    shareXShort: string;
    shareIntro: string;
    shareOutro: string;
  };
  decrypt: {
    cipherLabel: string;
    cipherPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    start: string;
    analyzing: string;
    skip: string;
    muteOn: string;
    muteOff: string;
    formatError: string;
    wrongPassword: string;
    decryptError: string;
    resultPlaceholder: string;
    done: string;
  };
  caesar: {
    createTitle: string;
    createHint: string;
    createPlaceholder: string;
    generate: string;
    tryYourself: string;
    spoilerSummary: string;
    spoilerShift: string;
    cipherLabel: string;
    cipherPlaceholder: string;
    shiftLabel: string;
    shiftAria: string;
    previewEmpty: string;
    freqLabel: string;
    freqEmpty: string;
    shareIntro: string;
    shareHint: string;
    copy: string;
    copied: string;
    copyFail: string;
    shareLine: string;
    shareLineShort: string;
    shareX: string;
    shareXShort: string;
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
};

export const cryptoMessageJa: CryptoMessageDict = {
  shell: {
    title: "ひみつメッセージ",
    description:
      "合言葉で暗号化・復号する『ひみつメッセージ』と、シーザー暗号を解き明かす『解読チャレンジ』。すべてこの端末内だけで完結します。",
  },
  modes: {
    create: "🔏 ひみつ作成",
    createShort: "🔏 作成",
    decode: "🕵️ 解読・チャレンジ",
    decodeShort: "🕵️ 解読",
  },
  decodeSubs: {
    password: "🔑 合言葉で解読",
    passwordShort: "🔑 合言葉",
    caesar: "🧩 シーザー暗号チャレンジ",
    caesarShort: "🧩 シーザー",
  },
  themes: {
    aria: "暗号テーマ",
    cyber: { description: "16進数（HEX）で表示するハッカー風の見た目" },
    fantasy: {
      description: "ルーン文字にマッピングしたファンタジー風の見た目",
    },
    spy: { description: "モールス信号で表示するスパイ風の見た目" },
  },
  create: {
    messageLabel: "メッセージ",
    messagePlaceholder: "友達にだけ伝えたい、秘密のメッセージを入力…",
    passwordLabel: "合言葉（パスワード）",
    passwordPlaceholder: "2人だけの合言葉",
    showPassword: "表示",
    hidePassword: "隠す",
    passwordHint:
      "合言葉はどこにも保存・送信されません。相手には別の手段（口頭・電話・別チャットなど）で伝えてください。",
    themeLabel: "暗号テーマ（見た目）",
    encrypt: "🔒 暗号化する",
    encrypting: "暗号化中…",
    encryptError:
      "暗号化に失敗しました。ブラウザが Web Crypto API に対応しているかご確認ください。",
    cipherLabel: "暗号文",
    copy: "コピー",
    copied: "✓ コピー済み",
    copyFail: "コピーに失敗しました。手動で選択してコピーしてください。",
    shareLine: "LINEでシェア",
    shareLineShort: "LINE",
    shareX: "Xでシェア",
    shareXShort: "X",
    shareIntro: "🔐 ひみつメッセージが届いたよ！",
    shareOutro:
      "合言葉を知ってる人だけ「My Tool Box」の暗号アプリで解読してね👇",
  },
  decrypt: {
    cipherLabel: "暗号文（貼り付け）",
    cipherPlaceholder: "友達から届いた暗号文をここに貼り付け…",
    passwordLabel: "合言葉",
    passwordPlaceholder: "教えてもらった合言葉",
    start: "🔓 解読を開始",
    analyzing: "解析中…",
    skip: "スキップ",
    muteOn: "音あり",
    muteOff: "ミュート",
    formatError:
      "暗号文の形式を認識できませんでした。コピペした内容に不足や余計な文字がないか確認してください。",
    wrongPassword: "合言葉が違うか、暗号文が壊れています。",
    decryptError: "復号に失敗しました。もう一度お試しください。",
    resultPlaceholder: "解読を開始すると、ここに結果が浮かび上がります…",
    done: "✅ 解読完了！",
  },
  caesar: {
    createTitle: "🎯 出題を作る（友達に送る暗号を作成）",
    createHint:
      "ひらがな・カタカナ・英字が対象です（漢字・記号・数字はずれません）。合言葉は不要で、シフト量そのものが「解くべき謎」になります。",
    createPlaceholder: "例：おつかれさま　きょうもいちにちがんばったね",
    generate: "🎲 ランダムな暗号を作る",
    tryYourself: "自分で解読してみる ↓",
    spoilerSummary: "（出題者用）正解のシフト量を見る",
    spoilerShift: "シフト量",
    cipherLabel: "暗号文（貼り付け）",
    cipherPlaceholder: "解読したい暗号文をここに貼り付け…",
    shiftLabel: "シフト量スライダー",
    shiftAria: "シフト量",
    previewEmpty: "暗号文を貼り付けると、ここにリアルタイムでプレビューが出ます…",
    freqLabel: "文字の出現頻度グラフ",
    freqEmpty: "暗号文を入力すると、文字の出現頻度がここに表示されます。",
    shareIntro: "🧩 解読チャレンジだよ！",
    shareHint:
      "シフト量スライダー（-13〜+13）を動かして、元の文章を当ててみて。",
    copy: "コピー",
    copied: "✓ コピー済み",
    copyFail: "コピーに失敗しました。手動で選択してコピーしてください。",
    shareLine: "LINEでシェア",
    shareLineShort: "LINE",
    shareX: "Xでシェア",
    shareXShort: "X",
  },
  install: {
    button: "このアプリをホーム画面に追加",
    buttonShort: "ホームに追加",
    buttonTiny: "追加",
    buttonAria: "ひみつメッセージをホーム画面に追加してアプリとして使う",
    modalTitle: "ホーム画面に追加",
    modalLead:
      "Safari からホーム画面に追加すると、ひみつメッセージだけを独立アプリとしてすぐ開けます。",
    step1Title: "共有をタップ",
    step1Body: "画面下（または上）の共有アイコン［↑］をタップします。",
    step2Title: "「ホーム画面に追加」",
    step2Body: "メニューを下にスクロールし、「ホーム画面に追加」を選びます。",
    desktopTitle: "アプリとしてインストール",
    desktopLead:
      "Chrome / Edge なら、アドレスバーやメニューからひみつメッセージを独立アプリとして追加できます。",
    desktopStep1Title: "ブラウザのメニューを開く",
    desktopStep1Body:
      "画面右上の「︙」またはアドレスバー横のインストールアイコンを探します。",
    desktopStep2Title: "「アプリをインストール」",
    desktopStep2Body:
      "「ひみつメッセージをインストール」や「アプリをインストール」を選ぶとホーム／デスクトップに追加されます。",
    modalClose: "わかった",
  },
};

export const cryptoMessageEn: CryptoMessageDict = {
  shell: {
    title: "Secret Message",
    description:
      "Encrypt notes with a shared passphrase, or crack a Caesar cipher in the decoding challenge — all local, no server.",
  },
  modes: {
    create: "🔏 Create secret",
    createShort: "🔏 Create",
    decode: "🕵️ Decode / Challenge",
    decodeShort: "🕵️ Decode",
  },
  decodeSubs: {
    password: "🔑 Decode with passphrase",
    passwordShort: "🔑 Passphrase",
    caesar: "🧩 Caesar cipher challenge",
    caesarShort: "🧩 Caesar",
  },
  themes: {
    aria: "Cipher theme",
    cyber: { description: "Hacker-style hex (HEX) display" },
    fantasy: { description: "Fantasy look mapped to rune characters" },
    spy: { description: "Spy-style Morse code display" },
  },
  create: {
    messageLabel: "Message",
    messagePlaceholder: "Type a secret message only your friend should read…",
    passwordLabel: "Passphrase",
    passwordPlaceholder: "A phrase only you two know",
    showPassword: "Show",
    hidePassword: "Hide",
    passwordHint:
      "The passphrase is never stored or uploaded. Tell it separately (voice, call, another chat).",
    themeLabel: "Cipher theme (look)",
    encrypt: "🔒 Encrypt",
    encrypting: "Encrypting…",
    encryptError:
      "Encryption failed. Make sure your browser supports the Web Crypto API.",
    cipherLabel: "Ciphertext",
    copy: "Copy",
    copied: "✓ Copied",
    copyFail: "Couldn’t copy. Select and copy manually.",
    shareLine: "Share on LINE",
    shareLineShort: "LINE",
    shareX: "Share on X",
    shareXShort: "X",
    shareIntro: "🔐 You’ve got a secret message!",
    shareOutro:
      "Only people with the passphrase can decode it in My Tool Box’s cipher app 👇",
  },
  decrypt: {
    cipherLabel: "Ciphertext (paste)",
    cipherPlaceholder: "Paste the ciphertext your friend sent…",
    passwordLabel: "Passphrase",
    passwordPlaceholder: "The passphrase they told you",
    start: "🔓 Start decrypt",
    analyzing: "Analyzing…",
    skip: "Skip",
    muteOn: "Sound on",
    muteOff: "Muted",
    formatError:
      "Couldn’t recognize the ciphertext format. Check for missing or extra characters.",
    wrongPassword: "Wrong passphrase, or the ciphertext is damaged.",
    decryptError: "Decryption failed. Please try again.",
    resultPlaceholder: "Start decrypting and the result will appear here…",
    done: "✅ Decrypted!",
  },
  caesar: {
    createTitle: "🎯 Make a puzzle (share with a friend)",
    createHint:
      "Hiragana, katakana, and letters shift; kanji, digits, and symbols stay put. No passphrase — the shift amount is the puzzle.",
    createPlaceholder: "e.g. thanks for today — you did great",
    generate: "🎲 Make a random cipher",
    tryYourself: "Try decoding yourself ↓",
    spoilerSummary: "(For the puzzle maker) Reveal the shift",
    spoilerShift: "Shift",
    cipherLabel: "Ciphertext (paste)",
    cipherPlaceholder: "Paste the cipher you want to crack…",
    shiftLabel: "Shift slider",
    shiftAria: "Shift amount",
    previewEmpty: "Paste ciphertext to preview the shift in real time…",
    freqLabel: "Letter frequency chart",
    freqEmpty: "Enter ciphertext to see letter frequencies here.",
    shareIntro: "🧩 Cipher challenge!",
    shareHint: "Move the shift slider (−13 to +13) and find the real message.",
    copy: "Copy",
    copied: "✓ Copied",
    copyFail: "Couldn’t copy. Select and copy manually.",
    shareLine: "Share on LINE",
    shareLineShort: "LINE",
    shareX: "Share on X",
    shareXShort: "X",
  },
  install: {
    button: "Add this app to Home Screen",
    buttonShort: "Add to Home",
    buttonTiny: "Add",
    buttonAria: "Add Secret Message to your home screen as a standalone app",
    modalTitle: "Add to Home Screen",
    modalLead:
      "Add Secret Message from Safari to open it as its own app — not the portal.",
    step1Title: "Tap Share",
    step1Body: "Tap the Share icon [↑] at the bottom (or top) of Safari.",
    step2Title: "Add to Home Screen",
    step2Body: "Scroll the menu and choose “Add to Home Screen”.",
    desktopTitle: "Install as an app",
    desktopLead:
      "In Chrome or Edge, install Secret Message as its own app from the address bar or browser menu.",
    desktopStep1Title: "Open the browser menu",
    desktopStep1Body:
      "Look for the ⋮ menu or the install icon near the address bar.",
    desktopStep2Title: "Install app",
    desktopStep2Body:
      "Choose “Install Secret Message” / “Install app” to add it to your home screen or desktop.",
    modalClose: "Got it",
  },
};
