// 究極確率スロット: アプリ内 UI 辞書（JA / EN）

export type UltimateProbabilitySlotDict = {
  shell: { title: string; description: string };
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
  mode: {
    heading: string;
    hitUntilWin: string;
    hitUntilWinHint: string;
    antiBingo: string;
    antiBingoHint: string;
    switchConfirm: string;
  };
  setup: {
    title: string;
    subtitle: string;
    reelsLabel: string;
    itemsLabel: string;
    autoMissHint: string;
    jackpotTag: string;
    jackpotImageOnly: string;
    uploadButton: string;
    uploadHint: string;
    resetJackpot: string;
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
    /** 当たるまで回す：チャンスのリーチ文言 */
    reachChanceWarning: string;
    /** 外し続ける：ピンチのリーチ文言 */
    reachPinchWarning: string;
    manualStopButton: string;
    reachSpaceHint: string;
    antiCheatWarning: string;
    antiCheatLockdown: string;
  };
  fortune: {
    p0: { label: string; description: string };
    p20: { label: string; description: string };
    p50: { label: string; description: string };
    p80: { label: string; description: string };
    p90: { label: string; description: string };
    p95: { label: string; description: string };
    p99: { label: string; description: string };
    p999: { label: string; description: string };
  };
  fortuneAntiBingo: {
    p0: { label: string; description: string };
    p20: { label: string; description: string };
    p50: { label: string; description: string };
    p80: { label: string; description: string };
    p90: { label: string; description: string };
    p95: { label: string; description: string };
    p99: { label: string; description: string };
    p999: { label: string; description: string };
  };
  flash: {
    hitTitle: string;
    hitBody: string;
    hitContinue: string;
    failTitle: string;
    failBody: string;
    failContinue: string;
  };
  /** ゲーム終了リザルト画面 */
  result: {
    outcomeClear: string;
    outcomeGameover: string;
    attemptsLabel: string;
    cumulativeLabel: string;
    singleProbLabel: string;
    evaluationLabel: string;
    downloadPng: string;
    generatingPng: string;
    oddsPrefix: string;
    langPickerTitle: string;
    langJa: string;
    langEn: string;
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
    unlockedLabel: string;
    close: string;
  };
};

export const ultimateProbabilitySlotJa: UltimateProbabilitySlotDict = {
  shell: {
    title: "究極確率スロット",
    description: "自分だけの低確率スロットで、確率を体感する。",
  },
  install: {
    button: "📱 アプリをインストール",
    buttonShort: "インストール",
    buttonTiny: "インストール",
    buttonAria: "このアプリをインストール",
    modalTitle: "アプリをインストール",
    modalLead: "共有メニューから、個別アプリとしてインストールできます。",
    step1Title: "共有をタップ",
    step1Body: "画面下の共有アイコン［↑］をタップ。",
    step2Title: "ホーム画面に追加",
    step2Body: "メニューから「ホーム画面に追加」を選ぶ。",
    desktopTitle: "アプリとしてインストール",
    desktopLead: "ブラウザから単体アプリとして使えます。",
    desktopStep1Title: "アドレスバーを確認",
    desktopStep1Body: "インストールアイコンをクリック。",
    desktopStep2Title: "インストール",
    desktopStep2Body: "ダイアログで「インストール」を選ぶ。",
    modalClose: "閉じる",
  },
  mode: {
    heading: "TARGET",
    hitUntilWin: "[ TARGET: HIT ]",
    hitUntilWinHint: "当たるまで",
    antiBingo: "[ TARGET: AVOID ]",
    antiBingoHint: "外し続ける",
    switchConfirm: "モードを切り替えると回転数がリセットされます。よろしいですか？",
  },
  setup: {
    title: "スロット設定",
    subtitle: "リール数と絵柄数で確率を決め、当たり画像だけ差し替え。",
    reelsLabel: "リール数",
    itemsLabel: "絵柄の種類",
    autoMissHint:
      "ハズレは王道絵柄が自動配置。変えられるのはジャックポット画像だけです。",
    jackpotTag: "★ JACKPOT",
    jackpotImageOnly: "IMAGE ONLY",
    uploadButton: "画像をアップロード",
    uploadHint: "JPEG / PNG など。端末内で縮小して保存します。",
    resetJackpot: "デフォルトに戻す",
    save: "この設定で開始",
    cancel: "キャンセル",
    startButton: "保存して始める",
    oddsPreviewLabel: "1回の確率（オッズ）",
  },
  dash: {
    attemptsLabel: "回転数",
    singleProbLabel: "1回の確率",
    cumulativeLabel: "当たった確率",
    cumulativeLabelAntiBingo: "外し続けた確率",
    fortuneLabel: "いまの状態",
    spinButton: "SPIN",
    stopButton: "STOP",
    spinningLabel: "回転中…",
    resetRunButton: "回転数をリセット",
    resetRunConfirm: "回転数をリセットしますか？（生涯統計・実績は残ります）",
    settingsButton: "設定",
    achievementsButton: "🏆 実績",
    lifetimeHeading: "生涯統計",
    lifetimeAttempts: "総回転数",
    lifetimeWins: "当たり回数",
    lifetimeMisses: "ハズレ回数",
    bestWinAttempts: "最速当たり",
    bestWinAttemptsEmpty: "—",
    longestMissStreak: "最長外し",
    antiBingoFailCount: "外し失敗",
    emptyTitle: "まだ設定がありません",
    emptyLead: "リールと絵柄を設定して始めましょう。",
    emptyButton: "スロットを設定",
    oddsPrefix: "1 /",
    spaceHint: "Space で SPIN / STOP",
    reachChanceWarning: "[ CHANCE: REACH DETECTED ]",
    reachPinchWarning: "[ PINCH: CRITICAL REACH ]",
    manualStopButton: "MANUAL STOP",
    reachSpaceHint: "クリック／タップで MANUAL STOP",
    antiCheatWarning: "[ WARNING: AUTOMATED INPUT DETECTED ]",
    antiCheatLockdown:
      "[ ANTI-CHEAT SYSTEM ACTIVATED: LOCKDOWN FOR {sec} SEC ]",
  },
  fortune: {
    p0: {
      label: "観測開始",
      description: "まだ序盤。誤差の範囲です。",
    },
    p20: {
      label: "平均的領域",
      description: "そろそろ当たりがチラつく頃。",
    },
    p50: {
      label: "折り返し通過",
      description: "半数超え。ハマり領域に突入。",
    },
    p80: {
      label: "大ハマり予兆",
      description: "80%をスルー。運気低下を検知。",
    },
    p90: {
      label: "警戒レベル高",
      description: "90%の壁。そろそろ当てたい。",
    },
    p95: {
      label: "天文学的ハマり",
      description: "95%超え。バグを疑いたくなる領域。",
    },
    p99: {
      label: "確率の奴隷",
      description: "99%超え。100人に1人の不運。",
    },
    p999: {
      label: "確率の特異点",
      description: "99.9%超。当たらない方が奇跡。",
    },
  },
  fortuneAntiBingo: {
    p0: {
      label: "生存確認",
      description: "まだ序盤。罠はあちこちに。",
    },
    p20: {
      label: "順調",
      description: "確率の網をうまくすり抜け中。",
    },
    p50: {
      label: "卓越した回避",
      description: "50%を回避。生存率が上昇。",
    },
    p80: {
      label: "神回避の兆候",
      description: "80%の当たりを無効化。見事。",
    },
    p90: {
      label: "鉄壁",
      description: "90%の壁をすり抜けた回避力。",
    },
    p95: {
      label: "絶対防御",
      description: "95%を拒否。プロ級の回避力。",
    },
    p99: {
      label: "バグ級の生存",
      description: "99%を回避。システム困惑中。",
    },
    p999: {
      label: "アンチビンゴ神",
      description: "99.9%をすり抜けた伝説の回避。",
    },
  },
  flash: {
    hitTitle: "SIGNAL DETECTED",
    hitBody: "ジャックポット達成！",
    hitContinue: "次の試行へ",
    failTitle: "SYNC FAILURE",
    failBody: "回避失敗。当たってしまいました。",
    failContinue: "次の試行へ",
  },
  result: {
    outcomeClear: "CLEAR — 観測成功",
    outcomeGameover: "GAME OVER — 回避失敗",
    attemptsLabel: "回した回数",
    cumulativeLabel: "到達した累積確率",
    singleProbLabel: "1回の確率",
    evaluationLabel: "最終評価",
    downloadPng: "📄 実験レポートをPNGでダウンロード",
    generatingPng: "GENERATING REPORT...",
    oddsPrefix: "1 /",
    langPickerTitle: "REPORT LANGUAGE",
    langJa: "日本語 (JP)",
    langEn: "English (EN)",
  },
  toast: {
    settingsSaved: "設定を保存しました。",
    runReset: "回転数をリセットしました。",
    badgeUnlockedPrefix: "実績解放：",
  },
  badges: {
    titleTemplateHitUntilWin: "1/{odds} を当てた",
    titleTemplateAntiBingo: "外し確率 {percent}% 到達",
    descriptionHitUntilWin: "1回の確率 1/{odds} 以下で的中。",
    descriptionAntiBingo: "外し確率が {percent}% まで下がるまで継続。",
  },
  achievements: {
    title: "実績",
    modeLabelHitUntilWin: "当たるまで回す",
    modeLabelAntiBingo: "外し続ける",
    unlockedCountTemplate: "{unlocked} / {total} 解放",
    lockedLabel: "LOCK",
    unlockedLabel: "UNLOCKED",
    close: "閉じる",
  },
};

export const ultimateProbabilitySlotEn: UltimateProbabilitySlotDict = {
  shell: {
    title: "Ultimate Probability Slot",
    description: "Feel probability with your own ultra-rare slot.",
  },
  install: {
    button: "📱 Install",
    buttonShort: "Install",
    buttonTiny: "Install",
    buttonAria: "Install this app",
    modalTitle: "Install app",
    modalLead: "Add this app from the share menu.",
    step1Title: "Tap Share",
    step1Body: "Tap the share icon [↑] at the bottom.",
    step2Title: "Add to Home Screen",
    step2Body: "Choose \"Add to Home Screen\".",
    desktopTitle: "Install as an App",
    desktopLead: "Run it as a standalone app from your browser.",
    desktopStep1Title: "Check the address bar",
    desktopStep1Body: "Click the install icon.",
    desktopStep2Title: "Install",
    desktopStep2Body: "Confirm Install in the dialog.",
    modalClose: "Close",
  },
  mode: {
    heading: "TARGET",
    hitUntilWin: "[ TARGET: HIT ]",
    hitUntilWinHint: "Hit until win",
    antiBingo: "[ TARGET: AVOID ]",
    antiBingoHint: "Keep missing",
    switchConfirm: "Switching modes resets your spin count. Continue?",
  },
  setup: {
    title: "Slot Settings",
    subtitle: "Set reels and symbol count. Only the jackpot image is custom.",
    reelsLabel: "Reels",
    itemsLabel: "Symbols",
    autoMissHint:
      "Miss icons are classic slot symbols. Only the jackpot image is editable.",
    jackpotTag: "★ JACKPOT",
    jackpotImageOnly: "IMAGE ONLY",
    uploadButton: "Upload image",
    uploadHint: "JPEG / PNG etc. Downsized and saved locally.",
    resetJackpot: "Reset to default",
    save: "Start with this setup",
    cancel: "Cancel",
    startButton: "Save & Start",
    oddsPreviewLabel: "Odds per spin",
  },
  dash: {
    attemptsLabel: "Spins",
    singleProbLabel: "Per spin",
    cumulativeLabel: "Hit chance",
    cumulativeLabelAntiBingo: "Miss streak",
    fortuneLabel: "Status",
    spinButton: "SPIN",
    stopButton: "STOP",
    spinningLabel: "Spinning…",
    resetRunButton: "Reset spins",
    resetRunConfirm:
      "Reset spin count? (Lifetime stats & achievements are kept.)",
    settingsButton: "Settings",
    achievementsButton: "🏆 Achievements",
    lifetimeHeading: "Lifetime",
    lifetimeAttempts: "Total spins",
    lifetimeWins: "Hits",
    lifetimeMisses: "Misses",
    bestWinAttempts: "Fastest hit",
    bestWinAttemptsEmpty: "—",
    longestMissStreak: "Longest miss",
    antiBingoFailCount: "Miss fails",
    emptyTitle: "Not set up yet",
    emptyLead: "Configure reels and symbols to start.",
    emptyButton: "Set up slot",
    oddsPrefix: "1 /",
    spaceHint: "Space for SPIN / STOP",
    reachChanceWarning: "[ CHANCE: REACH DETECTED ]",
    reachPinchWarning: "[ PINCH: CRITICAL REACH ]",
    manualStopButton: "MANUAL STOP",
    reachSpaceHint: "Click or tap to MANUAL STOP",
    antiCheatWarning: "[ WARNING: AUTOMATED INPUT DETECTED ]",
    antiCheatLockdown:
      "[ ANTI-CHEAT SYSTEM ACTIVATED: LOCKDOWN FOR {sec} SEC ]",
  },
  fortune: {
    p0: {
      label: "JUST STARTED",
      description: "Still early. Within noise range.",
    },
    p20: {
      label: "AVERAGE ZONE",
      description: "A hit should start to feel close.",
    },
    p50: {
      label: "MIDPOINT",
      description: "Past 50%. Entering deep-hook zone.",
    },
    p80: {
      label: "DEEP HOOK SIGN",
      description: "Skipped 80%. Luck dropping.",
    },
    p90: {
      label: "HIGH ALERT",
      description: "90% wall. Time for a hit.",
    },
    p95: {
      label: "WILD HOOK",
      description: "Over 95%. Almost looks broken.",
    },
    p99: {
      label: "ODDS SLAVE",
      description: "Past 99%. One-in-a-hundred unlucky.",
    },
    p999: {
      label: "SINGULARITY",
      description: "Past 99.9%. Missing is the miracle.",
    },
  },
  fortuneAntiBingo: {
    p0: {
      label: "ALIVE",
      description: "Early phase. Traps everywhere.",
    },
    p20: {
      label: "STEADY",
      description: "Slipping through the odds mesh.",
    },
    p50: {
      label: "GREAT DODGE",
      description: "Dodged 50%. Survival rising.",
    },
    p80: {
      label: "DIVINE DODGE",
      description: "Nullified an 80% hit. Nice.",
    },
    p90: {
      label: "IRON WALL",
      description: "Slipped past the 90% wall.",
    },
    p95: {
      label: "ABSOLUTE DEFENSE",
      description: "Rejected 95%. Pro-level dodge.",
    },
    p99: {
      label: "BUG-TIER SURVIVAL",
      description: "Dodged 99%. System confused.",
    },
    p999: {
      label: "ANTI-BINGO GOD",
      description: "Legendary dodge past 99.9%.",
    },
  },
  flash: {
    hitTitle: "SIGNAL DETECTED",
    hitBody: "Jackpot!",
    hitContinue: "Next run",
    failTitle: "SYNC FAILURE",
    failBody: "Dodge failed. You hit.",
    failContinue: "Next run",
  },
  result: {
    outcomeClear: "CLEAR — Observation success",
    outcomeGameover: "GAME OVER — Dodge failed",
    attemptsLabel: "Spins",
    cumulativeLabel: "Final cumulative probability",
    singleProbLabel: "Per-spin probability",
    evaluationLabel: "Final evaluation",
    downloadPng: "📄 Download experiment report (PNG)",
    generatingPng: "GENERATING REPORT...",
    oddsPrefix: "1 /",
    langPickerTitle: "REPORT LANGUAGE",
    langJa: "日本語 (JP)",
    langEn: "English (EN)",
  },
  toast: {
    settingsSaved: "Settings saved.",
    runReset: "Spin count reset.",
    badgeUnlockedPrefix: "Unlocked: ",
  },
  badges: {
    titleTemplateHitUntilWin: "Hit 1/{odds}",
    titleTemplateAntiBingo: "Miss rate {percent}%",
    descriptionHitUntilWin: "Hit at 1/{odds} or rarer.",
    descriptionAntiBingo: "Kept missing until miss rate hit {percent}%.",
  },
  achievements: {
    title: "Achievements",
    modeLabelHitUntilWin: "Hit Until Win",
    modeLabelAntiBingo: "Keep Missing",
    unlockedCountTemplate: "{unlocked} / {total} unlocked",
    lockedLabel: "LOCK",
    unlockedLabel: "UNLOCKED",
    close: "Close",
  },
};
