// 究極確率スロット: アプリ内 UI 辞書（JA / EN）

export type UltimateProbabilitySlotDict = {
  shell: { title: string; description: string };
  install: {
    button: string;
    buttonShort: string;
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
  mode: {
    heading: string;
    hitUntilWin: string;
    hitUntilWinHint: string;
    antiBingo: string;
    antiBingoHint: string;
    switchConfirm: string;
  };
  stopMode: {
    heading: string;
    individual: string;
    batch: string;
  };
  setup: {
    title: string;
    subtitle: string;
    reelsLabel: string;
    itemsLabel: string;
    sharedSymbolsHint: string;
    jackpotTag: string;
    typeLabel: string;
    typeText: string;
    typeNumber: string;
    typeEmoji: string;
    typeImage: string;
    valuePlaceholderText: string;
    valuePlaceholderEmoji: string;
    valuePlaceholderNumber: string;
    uploadButton: string;
    uploadHint: string;
    removeImage: string;
    save: string;
    cancel: string;
    startButton: string;
    oddsPreviewLabel: string;
  };
  dash: {
    attemptsLabel: string;
    singleProbLabel: string;
    cumulativeLabel: string;
    cumulativeLabelAntiBingo: string;
    fortuneLabel: string;
    spinButton: string;
    stopButton: string;
    spinningLabel: string;
    resetRunButton: string;
    resetRunConfirm: string;
    settingsButton: string;
    achievementsButton: string;
    lifetimeHeading: string;
    lifetimeAttempts: string;
    lifetimeWins: string;
    lifetimeMisses: string;
    bestWinAttempts: string;
    bestWinAttemptsEmpty: string;
    longestMissStreak: string;
    antiBingoFailCount: string;
    emptyTitle: string;
    emptyLead: string;
    emptyButton: string;
    oddsPrefix: string;
    spaceHint: string;
  };
  fortune: {
    superRare: { label: string; description: string };
    average: { label: string; description: string };
    deepHooked: { label: string; description: string };
    anomaly: { label: string; description: string };
  };
  fortuneAntiBingo: {
    superRare: { label: string; description: string };
    average: { label: string; description: string };
    deepHooked: { label: string; description: string };
    anomaly: { label: string; description: string };
  };
  flash: {
    hitTitle: string;
    hitBody: string;
    hitContinue: string;
    failTitle: string;
    failBody: string;
    failContinue: string;
  };
  toast: {
    settingsSaved: string;
    runReset: string;
    badgeUnlockedPrefix: string;
  };
  badges: {
    titleTemplateHitUntilWin: string;
    titleTemplateAntiBingo: string;
    descriptionHitUntilWin: string;
    descriptionAntiBingo: string;
  };
  achievements: {
    title: string;
    modeLabelHitUntilWin: string;
    modeLabelAntiBingo: string;
    unlockedCountTemplate: string;
    lockedLabel: string;
    close: string;
  };
};

export const ultimateProbabilitySlotJa: UltimateProbabilitySlotDict = {
  shell: {
    title: "究極確率スロット",
    description:
      "自作の天文学的低確率スロットで、確率の哲学と狂気を味わう演算エンジン。",
  },
  install: {
    button: "アプリとして保存",
    buttonShort: "保存",
    buttonAria: "ホーム画面にアプリを追加",
    modalTitle: "ホーム画面に追加",
    modalLead: "共有ボタンから、この演算装置を端末にインストールできます。",
    step1Title: "共有ボタンをタップ",
    step1Body: "画面下部（または上部）の共有アイコン［↑］をタップしてください。",
    step2Title: "ホーム画面に追加を選択",
    step2Body: "メニューから「ホーム画面に追加」を選ぶとアイコンが作成されます。",
    desktopTitle: "アプリとしてインストール",
    desktopLead: "ブラウザのインストール機能で、単体アプリとして利用できます。",
    desktopStep1Title: "アドレスバーを確認",
    desktopStep1Body: "アドレスバー付近のインストールアイコンをクリックしてください。",
    desktopStep2Title: "インストールを選択",
    desktopStep2Body: "表示されたダイアログで「インストール」を選ぶと完了します。",
    modalClose: "閉じる",
  },
  mode: {
    heading: "プレイモード",
    hitUntilWin: "当たるまで回す",
    hitUntilWinHint: "ジャックポットを目指す",
    antiBingo: "外し続ける",
    antiBingoHint: "的中を回避し続ける",
    switchConfirm: "モードを切り替えると現在の試行回数がリセットされます。よろしいですか？",
  },
  stopMode: {
    heading: "停止操作",
    individual: "個別 STOP",
    batch: "一括順次",
  },
  setup: {
    title: "スロット設定",
    subtitle: "共通の絵柄セットとリール本数で、確率そのものをデザインする。",
    reelsLabel: "リール数",
    itemsLabel: "絵柄の種類数",
    sharedSymbolsHint:
      "絵柄は全リール共通です。ここで設定した1セットが、すべてのリールで同じように使われます。",
    jackpotTag: "★ JACKPOT",
    typeLabel: "種類",
    typeText: "文字",
    typeNumber: "数字",
    typeEmoji: "絵文字",
    typeImage: "画像",
    valuePlaceholderText: "文字を入力",
    valuePlaceholderEmoji: "絵文字を入力",
    valuePlaceholderNumber: "数字を入力",
    uploadButton: "画像を選択",
    uploadHint: "端末内で自動縮小され、LocalStorageに保存されます。",
    removeImage: "削除",
    save: "この設定で開始",
    cancel: "キャンセル",
    startButton: "設定を保存して始める",
    oddsPreviewLabel: "この設定での単発オッズ",
  },
  dash: {
    attemptsLabel: "試行回数",
    singleProbLabel: "単発確率",
    cumulativeLabel: "累積確率",
    cumulativeLabelAntiBingo: "累積外し確率",
    fortuneLabel: "現在の運勢ステータス",
    spinButton: "SPIN",
    stopButton: "STOP",
    spinningLabel: "演算中…",
    resetRunButton: "この試行をリセット",
    resetRunConfirm: "現在の試行回数をリセットしますか？（生涯統計・実績は保持されます）",
    settingsButton: "設定",
    achievementsButton: "🏆 実績を見る",
    lifetimeHeading: "生涯統計",
    lifetimeAttempts: "生涯試行回数",
    lifetimeWins: "生涯的中回数",
    lifetimeMisses: "生涯ミス回数",
    bestWinAttempts: "最速的中",
    bestWinAttemptsEmpty: "—",
    longestMissStreak: "最長回避記録",
    antiBingoFailCount: "回避失敗回数",
    emptyTitle: "演算装置は未初期化です",
    emptyLead: "リールと絵柄を設定して、確率の実験を開始してください。",
    emptyButton: "スロットを設定する",
    oddsPrefix: "1 /",
    spaceHint: "Space キーで SPIN / STOP",
  },
  fortune: {
    superRare: {
      label: "激レア",
      description: "統計的にはまだ何も起きていない領域。今当たれば奇跡です。",
    },
    average: {
      label: "平均的",
      description: "統計上、ごく普通に当たってもおかしくないタイミングです。",
    },
    deepHooked: {
      label: "大ハマり中",
      description: "累積確率はすでに高水準。そろそろ収束してもいい頃合いです。",
    },
    anomaly: {
      label: "異常事態",
      description: "数学的にはほぼ確定していたはずの事象が、いまだ観測されていません。",
    },
  },
  fortuneAntiBingo: {
    superRare: {
      label: "超回避域",
      description:
        "累積外し確率は極小。統計上、そろそろ当たってもおかしくない回避限界です。",
    },
    average: {
      label: "安定回避",
      description: "累積外し確率は中程度。当たりと外しの境界線上にいます。",
    },
    deepHooked: {
      label: "快適地帯",
      description: "累積外し確率はまだ高水準。当たりを避け続けやすい領域です。",
    },
    anomaly: {
      label: "鉄壁",
      description:
        "累積外し確率は最大付近。統計的にはまだ何も起きていない、理想的な回避領域です。",
    },
  },
  flash: {
    hitTitle: "SIGNAL DETECTED",
    hitBody: "全リール同期。ジャックポットに到達しました。",
    hitContinue: "新しい試行を開始",
    failTitle: "SYNC FAILURE",
    failBody: "回避に失敗。的中を検出しました。",
    failContinue: "新しい試行を開始",
  },
  toast: {
    settingsSaved: "設定を保存しました。",
    runReset: "試行回数をリセットしました。",
    badgeUnlockedPrefix: "実績解放：",
  },
  badges: {
    titleTemplateHitUntilWin: "1/{odds} を当てた",
    titleTemplateAntiBingo: "累積外し確率 {percent}% 到達",
    descriptionHitUntilWin:
      "単発確率 1/{odds} 以下の的中を達成した。これより当たりやすい実績もまとめて解放。",
    descriptionAntiBingo:
      "累積外し確率が {percent}% まで下がるまで外し続けた。これより高い（易しい）実績もまとめて解放。",
  },
  achievements: {
    title: "実績",
    modeLabelHitUntilWin: "当たるまで回す",
    modeLabelAntiBingo: "外し続ける",
    unlockedCountTemplate: "{unlocked} / {total} 解放済み",
    lockedLabel: "未解放",
    close: "閉じる",
  },
};

export const ultimateProbabilitySlotEn: UltimateProbabilitySlotDict = {
  shell: {
    title: "Ultimate Probability Slot",
    description:
      "A computation engine for tasting the philosophy and madness of probability.",
  },
  install: {
    button: "Add to Home Screen",
    buttonShort: "Install",
    buttonAria: "Add this app to your home screen",
    modalTitle: "Add to Home Screen",
    modalLead: "Install this engine on your device via the share menu.",
    step1Title: "Tap the share button",
    step1Body: "Tap the share icon [↑] at the bottom (or top) of the screen.",
    step2Title: "Choose Add to Home Screen",
    step2Body: "Select \"Add to Home Screen\" from the menu to create the icon.",
    desktopTitle: "Install as an App",
    desktopLead: "Use your browser's install feature to run this as a standalone app.",
    desktopStep1Title: "Check the address bar",
    desktopStep1Body: "Click the install icon near the address bar.",
    desktopStep2Title: "Confirm install",
    desktopStep2Body: "Choose \"Install\" in the dialog that appears.",
    modalClose: "Close",
  },
  mode: {
    heading: "Play Mode",
    hitUntilWin: "Hit Until Win",
    hitUntilWinHint: "Chase the jackpot",
    antiBingo: "Keep Missing",
    antiBingoHint: "Dodge the jackpot forever",
    switchConfirm:
      "Switching modes will reset the current attempt streak. Continue?",
  },
  stopMode: {
    heading: "Stop Control",
    individual: "Per-reel STOP",
    batch: "Sequential",
  },
  setup: {
    title: "Slot Configuration",
    subtitle: "Design the odds with one shared symbol set and a reel count.",
    reelsLabel: "Number of reels",
    itemsLabel: "Symbol count",
    sharedSymbolsHint:
      "Symbols are shared across every reel. The set you configure here is used identically on all reels.",
    jackpotTag: "★ JACKPOT",
    typeLabel: "Type",
    typeText: "Text",
    typeNumber: "Number",
    typeEmoji: "Emoji",
    typeImage: "Image",
    valuePlaceholderText: "Enter text",
    valuePlaceholderEmoji: "Enter an emoji",
    valuePlaceholderNumber: "Enter a number",
    uploadButton: "Choose image",
    uploadHint: "Automatically downsized on-device and stored in LocalStorage.",
    removeImage: "Remove",
    save: "Start with this setup",
    cancel: "Cancel",
    startButton: "Save & Start",
    oddsPreviewLabel: "Single-spin odds with this setup",
  },
  dash: {
    attemptsLabel: "Attempts",
    singleProbLabel: "Single odds",
    cumulativeLabel: "Cumulative",
    cumulativeLabelAntiBingo: "Cumulative dodge",
    fortuneLabel: "Current fortune status",
    spinButton: "SPIN",
    stopButton: "STOP",
    spinningLabel: "Computing…",
    resetRunButton: "Reset this run",
    resetRunConfirm:
      "Reset the current attempt count? (Lifetime stats & achievements are kept.)",
    settingsButton: "Settings",
    achievementsButton: "🏆 Achievements",
    lifetimeHeading: "Lifetime Stats",
    lifetimeAttempts: "Lifetime attempts",
    lifetimeWins: "Lifetime hits",
    lifetimeMisses: "Lifetime misses",
    bestWinAttempts: "Fastest hit",
    bestWinAttemptsEmpty: "—",
    longestMissStreak: "Longest dodge streak",
    antiBingoFailCount: "Dodge failures",
    emptyTitle: "Engine not initialized",
    emptyLead: "Configure your reels and symbols to begin the probability experiment.",
    emptyButton: "Configure slot",
    oddsPrefix: "1 /",
    spaceHint: "Press Space to SPIN / STOP",
  },
  fortune: {
    superRare: {
      label: "Super Rare",
      description:
        "Statistically, nothing should have happened yet. A hit now would be a miracle.",
    },
    average: {
      label: "Average",
      description:
        "Right in the expected zone — a hit now would be perfectly ordinary.",
    },
    deepHooked: {
      label: "Deeply Hooked",
      description: "Cumulative probability is already high. Convergence is overdue.",
    },
    anomaly: {
      label: "Critical Anomaly",
      description:
        "An event that was nearly certain by now has still not been observed.",
    },
  },
  fortuneAntiBingo: {
    superRare: {
      label: "Critical Dodge",
      description:
        "Cumulative dodge probability is minimal. A hit is statistically overdue.",
    },
    average: {
      label: "Balanced Dodge",
      description: "Mid-range dodge probability — on the edge between hit and miss.",
    },
    deepHooked: {
      label: "Comfort Zone",
      description: "Dodge probability is still high. Avoidance remains comfortable.",
    },
    anomaly: {
      label: "Iron Wall",
      description:
        "Near-maximum dodge probability. Statistically, nothing has happened yet — ideal avoidance.",
    },
  },
  flash: {
    hitTitle: "SIGNAL DETECTED",
    hitBody: "All reels synchronized. Jackpot reached.",
    hitContinue: "Start a new run",
    failTitle: "SYNC FAILURE",
    failBody: "Avoidance failed. A hit was detected.",
    failContinue: "Start a new run",
  },
  toast: {
    settingsSaved: "Settings saved.",
    runReset: "Attempt count reset.",
    badgeUnlockedPrefix: "Achievement unlocked: ",
  },
  badges: {
    titleTemplateHitUntilWin: "Hit 1/{odds}",
    titleTemplateAntiBingo: "Dodge rate reached {percent}%",
    descriptionHitUntilWin:
      "Landed a hit at single-spin odds of 1/{odds} or rarer. Easier tiers unlock together.",
    descriptionAntiBingo:
      "Kept missing until cumulative dodge probability fell to {percent}%. Easier (higher %) tiers unlock together.",
  },
  achievements: {
    title: "Achievements",
    modeLabelHitUntilWin: "Hit Until Win",
    modeLabelAntiBingo: "Keep Missing",
    unlockedCountTemplate: "{unlocked} / {total} unlocked",
    lockedLabel: "Locked",
    close: "Close",
  },
};
