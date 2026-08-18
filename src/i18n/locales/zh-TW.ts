import type { PartialDictionary } from "../localeMeta";
import { appsZhTW } from "./apps/zh-TW";

/** 繁體中文 — 門戶共通 UI ＋ アプリ内 UI（legal は英語フォールバック） */
export const zhTW: PartialDictionary = {
  brand: "Blank Note",
  common: {
    backToPortal: "← 返回入口網站",
    loading: "載入中…",
    close: "關閉",
    save: "儲存",
    cancel: "取消",
    edit: "編輯",
    delete: "刪除",
    clear: "清除",
  },
  header: {
    support: "支持開發者",
    supportShort: "支持",
    supportAria: "支持開發者（開啟 Stripe 付款頁面）",
    supportTitle: "開啟支持頁面",
    langToggleAria: "切換顯示語言",
    layoutToggle: {
      aria: "切換顯示寬度",
      caption: "Width",
      defaultShort: "標準",
      wideShort: "較寬",
      fullShort: "全寬",
      default: "以標準寬度顯示",
      wide: "以較寬寬度顯示",
      full: "全螢幕顯示",
    },
  },
  home: {
    heroTitleLine1: "讓日常工作，",
    heroTitleLine2: "稍微輕鬆一點的工具箱。",
    heroLead1: "彙整個人開發實用工具的入口網站。",
    heroLead2: "找到感興趣的工具後，歡迎隨時試用。",
  },
  genres: {
    business: {
      name: "業務效率",
      description: "貼近實務、讓日常工作更輕鬆的工具",
    },
    creators: {
      name: "創作者支援",
      description: "支援內容創作與發布的創作者工具箱",
    },
    utilities: {
      name: "日常實用工具",
      description: "快速完成小任務的通用工具",
    },
    minigames: {
      name: "小遊戲",
      description: "工作空檔稍作放鬆的趣味小遊戲",
    },
  },
  tools: {
    "invoice-maker": {
      title: "單據製作",
      description: "A4 發票/報價/交貨單/收據。多語言多貨幣 PDF。",
    },
    "mail-template": {
      title: "郵件範本",
      description: "以標籤分類與變數替換，讓日常郵件回覆更快。",
    },
    "folder-generator": {
      title: "資料夾生成",
      description: "依命名規則組合日期、編號與清單，一鍵批次建立。",
    },
    "excel-merger": {
      title: "工作表合併",
      description: "抽取並重排 Excel 工作表，合併成一個檔案。",
    },
    "pdf-editor": {
      title: "PDF編輯",
      description: "在瀏覽器中完成合併、排序與頁面刪除。",
    },
    "image-compressor": {
      title: "圖片壓縮",
      description: "指定最大寬度與畫質，在瀏覽器內批次縮放與壓縮。",
    },
    "text-cleaner": {
      title: "文字清理",
      description: "一鍵清理換行、空白與控制字元，也可儲存自訂取代規則。",
    },
    "media-metadata-editor": {
      title: "媒體標籤",
      description: "在瀏覽器內編輯並預覽音樂與影片的標籤和封面。",
    },
    "character-relation-editor": {
      title: "小說關係圖",
      description: "以角色卡片與關係線，直觀整理故事中的人物關係。",
    },
    "book-visualizer": {
      title: "紙面編輯",
      description: "指定紙張與排版，直接編輯版面，並以 .mybook 分享。",
    },
    "palette-collector": {
      title: "配色盤",
      description: "從圖片提取配色，支援自動提取與對比度檢查。",
    },
    "lunch-savings": {
      title: "午餐存錢",
      description: "點按記錄與預算的差額，用遊戲感存下省下的錢。",
    },
    "link-stocker": {
      title: "連結收藏",
      description: "用不太正式的書籤方式，以含 OGP 的卡片收藏 URL。",
    },
    "ultimate-probability-slot": {
      title: "機率老虎機",
      description: "用自製低機率老虎機挑戰「直到中獎」或「連續落空」。",
    },
    "pixel-drop-puzzle": {
      title: "像素落縫",
      description: "把照片落入縫隙即可，亞像素級判定的精度謎題。",
    },
    "robot-freethrow": {
      title: "投射罰球",
      description: "用角度、初速與旋轉瞄準籃框的拋體運動小遊戲。",
    },
    "crypto-message": {
      title: "秘密訊息",
      description: "用口令加密解密，附帶凱撒密碼挑戰。",
    },
    "monster-driver": {
      title: "怪物駕駛",
      description: "紅燈停、藍燈衝。考驗方向燈記憶的第一人稱動作。",
    },
  },
  card: {
    open: "開啟",
    comingSoon: "準備中",
    comingSoonHint: "即將推出",
    mobileSupported: "支援手機",
    mobileSupportedHint: "已針對手機最佳化",
    pcRecommended: "建議電腦",
    pcRecommendedHint: "建議在電腦上使用",
  },
  footer: {
    tagline: "讓日常瑣事更輕鬆的個人開發工具集",
    navAria: "營運者資訊",
    contact: "聯絡我們",
    terms: "使用條款",
    privacy: "隱私權政策",
    environmentLabel: "執行環境",
    noticeLabel: "注意事項",
    localOnly:
      "🔒 工具的檔案與輸入內容原則上在瀏覽器內處理並儲存，營運者不會蒐集或保管其內容。也不使用 Cookie 進行個人追蹤。僅為改進網站，我們會統計匿名化的造訪量與工具使用次數。部分工具可能有有限的網路請求（詳見隱私權政策）。",
  },
  messages: {
    environment:
      "本站工具原則上在瀏覽器內運作，無需安裝。可在 Windows / Mac / 智慧型手機等使用，但部分工具面向電腦（不支援手機）。瀏覽網站與首次使用需要網路，不保證全站離線可用。",
    persistence:
      "儲存資料放在瀏覽器的 LocalStorage（裝置本機暫存區）。清除快取、刪除網站資料，或改用其他瀏覽器／裝置時可能遺失。重要資料請定期「匯出（儲存）」並自行備份。",
    safety:
      "工具中輸入與建立的資料原則上只保存在您的裝置（瀏覽器）內，營運者不會在伺服器上蒐集或保管其內容。這無法涵蓋裝置端風險，重要資料請自行備份。",
    safetyShort: "資料原則上保存在瀏覽器內，營運者不會蒐集內容。",
    privacyBanner:
      "檔案與輸入內容原則上在此瀏覽器內處理。營運者不會蒐集或儲存其內容。",
    privacyBannerShort:
      "原則上在瀏覽器內處理。營運者不儲存輸入內容。",
  },
  dataManager: {
    buttonTitle: "資料管理（備份與還原）",
    buttonAria: "資料管理（備份與還原）",
    buttonLabel: "備份",
    buttonLabelShort: "資料",
    dialogTitle: "資料管理（備份與還原）",
    close: "關閉",
    safetyHeading: "關於資料安全",
    backupReasonHeading: "建議備份的原因",
    export: "📥 匯出資料（儲存）",
    import: "📤 匯入資料（載入）",
    noData: "此工具僅在工作階段內運作，沒有可儲存的設定資料。營運者也不會蒐集或儲存處理內容。",
    exportOk: "已下載備份檔案。",
    exportFail: "匯出失敗。",
    importOk: "已載入資料。",
    importFail: "載入失敗。",
    importInvalid: "無法套用該資料內容。",
    importConfirm: "目前資料將被覆蓋，確定繼續嗎？",
  },
  apps: appsZhTW,
  contact: {
    title: "聯絡我們",
    lead: "填寫下方表單並送出後，將開啟您的郵件應用程式。不會向伺服器傳送資料。",
    mailtoHint: "※按下送出後，將啟動您的郵件軟體",
    submit: "用郵件應用程式傳送",
    messageRequired: "請填寫訊息內容。",
    categoryLabel: "諮詢類型",
    categories: {
      general: "一般諮詢",
      feature: "功能建議",
      bug: "問題回報",
      other: "其他",
    },
    appLabel: "相關應用",
    appPlaceholder: "選填",
    appNone: "（未指定）",
    nameLabel: "您的姓名",
    namePlaceholder: "選填",
    emailLabel: "回覆信箱",
    emailPlaceholder: "you@example.com",
    emailHint: "選填 — 如需回覆請填寫",
    messageLabel: "訊息內容",
    messagePlaceholder: "請填寫問題、建議或故障詳情",
    subjectPrefix: "【Blank Note】諮詢",
    bodyLabels: {
      category: "諮詢類型",
      app: "相關應用",
      name: "姓名",
      email: "回覆信箱",
      message: "訊息",
      environment: "環境資訊（自動附加）",
      notProvided: "（未填寫）",
    },
  },
};
