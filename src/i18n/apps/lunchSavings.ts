import type { AppShellCopy } from "./otherApps";
import type { SavingsQuipsDict } from "../../app/lunch-savings/savingsQuips";
import {
  lunchSavingsQuipsEn,
  lunchSavingsQuipsJa,
} from "./lunchSavingsQuips";

export type LunchSavingsDict = {
  shell: AppShellCopy;
  quips: SavingsQuipsDict;
  modes: {
    savings: string;
    savingsHint: string;
    budget: string;
    budgetHint: string;
  };
  currency: {
    label: string;
    hint: string;
    JPY: string;
    USD: string;
    EUR: string;
    GBP: string;
  };
  period: {
    label: string;
    calendarMonth: string;
    salaryCycle: string;
    customRange: string;
    fixedDays: string;
    startDate: string;
    endDate: string;
    salaryDay: string;
    salaryDayHint: string;
  };
  setup: {
    title: string;
    subtitle: string;
    modeLabel: string;
    workDays: string;
    workDaysHint: string;
    dailyBudget: string;
    totalBudget: string;
    totalBudgetHint: string;
    goalAmount: string;
    goalLabel: string;
    goalLabelPlaceholder: string;
    goalLabelDefault: string;
    save: string;
    saveEdit: string;
    cancel: string;
  };
  dash: {
    modeSavings: string;
    modeBudget: string;
    savedLabel: string;
    remainingBudgetLabel: string;
    remainingDays: string;
    remainingDaysUnit: string;
    avgPerDay: string;
    avgPerDayEmpty: string;
    progressLabel: string;
    usageLabel: string;
    rewardZero: string;
    rewardTimes: string;
    budgetHint: string;
    loggedToday: string;
    notLoggedToday: string;
    editToday: string;
    recordToday: string;
    openSettings: string;
    recent: string;
    recentEmpty: string;
    deleteEntry: string;
    periodBudget: string;
    periodLabel: string;
    spentLabel: string;
  };
  numpad: {
    title: string;
    titleEdit: string;
    confirm: string;
    clear: string;
    backspace: string;
    cancel: string;
    /** 通貨コードに応じて上書きされることがある単位ラベル */
    amountUnit: string;
    noteLabel: string;
    notePlaceholder: string;
  };
  toast: {
    saved: string;
    updated: string;
    deleted: string;
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

export const lunchSavingsJa: LunchSavingsDict = {
  shell: {
    title: "ランチ貯金",
    description:
      "予算との差額をタップで記録。浮いたお金をゲーム感覚で貯めよう。",
  },
  quips: lunchSavingsQuipsJa,
  modes: {
    savings: "コツコツ貯金",
    savingsHint: "1日の予算との差額を積み上げて、目標のご褒美を目指します",
    budget: "残金カウントダウン",
    budgetHint: "期間の総予算から使った分を引き、「あといくら」を管理します",
  },
  currency: {
    label: "通貨",
    hint: "金額の表示・入力単位を選びます（換算はしません）",
    JPY: "日本円（¥）",
    USD: "米ドル（$）",
    EUR: "ユーロ（€）",
    GBP: "英ポンド（£）",
  },
  period: {
    label: "期間の決め方",
    calendarMonth: "今月（1日〜末日）",
    salaryCycle: "給料日ベース",
    customRange: "開始・終了日を指定",
    fixedDays: "日数を指定",
    startDate: "開始日",
    endDate: "終了日",
    salaryDay: "給料日（毎月）",
    salaryDayHint: "例: 25 → 25日〜翌月24日",
  },
  setup: {
    title: "はじめの設定",
    subtitle: "ざっくりでOK。あとからいつでも変更できます。",
    modeLabel: "計測モード",
    workDays: "期間内の稼働日数",
    workDaysHint: "ランチを記録する予定の日数",
    dailyBudget: "1日のランチ予算",
    totalBudget: "期間の総予算（限度額）",
    totalBudgetHint: "この期間で使えるランチ代の上限",
    goalAmount: "目標貯金額",
    goalLabel: "貯めたら買うもの",
    goalLabelPlaceholder: "例: 高級コーヒー豆",
    goalLabelDefault: "高級コーヒー豆",
    save: "はじめる",
    saveEdit: "保存する",
    cancel: "閉じる",
  },
  dash: {
    modeSavings: "コツコツ貯金",
    modeBudget: "残金カウントダウン",
    savedLabel: "期間の浮いたお金",
    remainingBudgetLabel: "あといくら使える",
    remainingDays: "残り",
    remainingDaysUnit: "日",
    avgPerDay: "1日あたりの目安",
    avgPerDayEmpty: "期間の記録完了",
    progressLabel: "目標まで",
    usageLabel: "予算の使用率",
    rewardZero: "もう少しで「{goal}」が近づきます",
    rewardTimes: "「{goal}」の {count} 回分、浮きました！",
    budgetHint: "使いすぎ注意。残金を意識してランチを選ぼう",
    loggedToday: "今日は記録済み",
    notLoggedToday: "今日はまだ未記録",
    editToday: "今日の金額を修正",
    recordToday: "今日のランチ代を記録",
    openSettings: "設定",
    recent: "最近の記録",
    recentEmpty: "まだ記録がありません",
    deleteEntry: "削除",
    periodBudget: "期間の予算枠",
    periodLabel: "対象期間",
    spentLabel: "使った合計",
  },
  numpad: {
    title: "今日使った金額",
    titleEdit: "金額を修正",
    confirm: "記録する",
    clear: "C",
    backspace: "⌫",
    cancel: "やめる",
    amountUnit: "",
    noteLabel: "ひとことメモ（任意）",
    notePlaceholder: "例: 日替わり定食、カフェ代",
  },
  toast: {
    saved: "記録しました！",
    updated: "更新しました",
    deleted: "削除しました",
  },
  install: {
    button: "このアプリをインストール",
    buttonShort: "インストール",
    buttonTiny: "インストール",
    buttonAria: "ランチ貯金をインストールして、個別アプリとして使う",
    modalTitle: "アプリをインストール",
    modalLead:
      "対応ブラウザからインストールすると、ランチ貯金だけを個別アプリとしてすぐ開けます。",
    step1Title: "共有をタップ",
    step1Body: "画面下（または上）の共有アイコン［↑］をタップします。",
    step2Title: "「ホーム画面に追加」",
    step2Body: "メニューを下にスクロールし、「ホーム画面に追加」を選びます。",
    desktopTitle: "アプリとしてインストール",
    desktopLead:
      "Chrome / Edge なら、アドレスバーやメニューからランチ貯金を独立アプリとして追加できます。",
    desktopStep1Title: "ブラウザのメニューを開く",
    desktopStep1Body:
      "画面右上の「︙」またはアドレスバー横のインストールアイコンを探します。",
    desktopStep2Title: "「アプリをインストール」",
    desktopStep2Body:
      "「ランチ貯金をインストール」や「アプリをインストール」を選ぶとホーム／デスクトップに追加されます。",
    modalClose: "わかった",
  },
};

export const lunchSavingsEn: LunchSavingsDict = {
  shell: {
    title: "Lunch Savings",
    description:
      "Tap to log lunch spend vs budget. Watch your savings grow like a game.",
  },
  quips: lunchSavingsQuipsEn,
  modes: {
    savings: "Target Savings",
    savingsHint: "Stack leftover daily budget toward a reward goal",
    budget: "Budget Limit",
    budgetHint: "Set a period cap and track how much you can still spend",
  },
  currency: {
    label: "Currency",
    hint: "Display and input unit only — no currency conversion",
    JPY: "Japanese Yen (¥)",
    USD: "US Dollar ($)",
    EUR: "Euro (€)",
    GBP: "British Pound (£)",
  },
  period: {
    label: "Period type",
    calendarMonth: "This Month",
    salaryCycle: "Payday Cycle",
    customRange: "Custom start & end",
    fixedDays: "Fixed number of days",
    startDate: "Start date",
    endDate: "End date",
    salaryDay: "Payday (monthly)",
    salaryDayHint: "e.g. 25 → 25th to next month’s 24th",
  },
  setup: {
    title: "Quick setup",
    subtitle: "Keep it rough—you can change this anytime.",
    modeLabel: "Tracking mode",
    workDays: "Lunch days in period",
    workDaysHint: "How many days you’ll log lunch",
    dailyBudget: "Daily lunch budget",
    totalBudget: "Total period budget",
    totalBudgetHint: "Spending cap for this period",
    goalAmount: "Savings goal",
    goalLabel: "What you're saving for",
    goalLabelPlaceholder: "e.g. Premium Coffee Beans",
    goalLabelDefault: "Premium Coffee Beans",
    save: "Start",
    saveEdit: "Save",
    cancel: "Close",
  },
  dash: {
    modeSavings: "Target Savings",
    modeBudget: "Budget Limit",
    savedLabel: "Saved this period",
    remainingBudgetLabel: "Left to spend",
    remainingDays: "Left",
    remainingDaysUnit: "days",
    avgPerDay: "Avg. left per day",
    avgPerDayEmpty: "Period complete",
    progressLabel: "Toward goal",
    usageLabel: "Budget used",
    rewardZero: "You're getting closer to “{goal}”",
    rewardTimes: "Saved enough for {count}× “{goal}”!",
    budgetHint: "Watch the remaining balance when choosing lunch",
    loggedToday: "Logged today",
    notLoggedToday: "Not logged yet today",
    editToday: "Edit today's amount",
    recordToday: "Log today's lunch",
    openSettings: "Settings",
    recent: "Recent logs",
    recentEmpty: "No logs yet",
    deleteEntry: "Delete",
    periodBudget: "Period budget",
    periodLabel: "Period",
    spentLabel: "Total spent",
  },
  numpad: {
    title: "Amount spent today",
    titleEdit: "Edit amount",
    confirm: "Save",
    clear: "C",
    backspace: "⌫",
    cancel: "Cancel",
    amountUnit: "",
    noteLabel: "Optional note",
    notePlaceholder: "e.g. Lunch set, Coffee",
  },
  toast: {
    saved: "Saved!",
    updated: "Updated",
    deleted: "Deleted",
  },
  install: {
    button: "Install this app",
    buttonShort: "Install",
    buttonTiny: "Install",
    buttonAria: "Install Lunch Savings as a standalone app",
    modalTitle: "Install app",
    modalLead:
      "Install Lunch Savings from Safari to open it as its own app — not the portal.",
    step1Title: "Tap Share",
    step1Body: "Tap the Share icon [↑] at the bottom (or top) of Safari.",
    step2Title: "Add to Home Screen",
    step2Body: "Scroll the menu and choose “Add to Home Screen”.",
    desktopTitle: "Install as an app",
    desktopLead:
      "In Chrome or Edge, install Lunch Savings as its own app from the address bar or browser menu.",
    desktopStep1Title: "Open the browser menu",
    desktopStep1Body:
      "Look for the ⋮ menu or the install icon near the address bar.",
    desktopStep2Title: "Install app",
    desktopStep2Body:
      "Choose “Install Lunch Savings” / “Install app” to add it to your home screen or desktop.",
    modalClose: "Got it",
  },
};
