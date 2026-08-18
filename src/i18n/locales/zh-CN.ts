import type { PartialDictionary } from "../localeMeta";
import { appsZhCN } from "./apps/zh-CN";

/**
 * 簡体中文 — ポータル共通 UI ＋ アプリ内 UI（legal は英語フォールバック）
 */
export const zhCN: PartialDictionary = {
  brand: "Blank Note",
  common: {
    backToPortal: "← 返回门户",
    loading: "加载中…",
    close: "关闭",
    save: "保存",
    cancel: "取消",
    edit: "编辑",
    delete: "删除",
    clear: "清除",
  },
  header: {
    support: "支持开发者",
    supportShort: "支持",
    supportAria: "支持开发者（打开 Stripe 付款页面）",
    supportTitle: "打开支持页面",
    langToggleAria: "切换显示语言",
    layoutToggle: {
      aria: "切换显示宽度",
      caption: "Width",
      defaultShort: "标准",
      wideShort: "较宽",
      fullShort: "全宽",
      default: "以标准宽度显示",
      wide: "以较宽宽度显示",
      full: "全屏显示",
    },
  },
  home: {
    heroTitleLine1: "让日常工作，",
    heroTitleLine2: "稍微轻松一点的工具箱。",
    heroLead1: "汇总个人开发实用工具的门户网站。",
    heroLead2: "找到感兴趣的工具后，请随时试用。",
  },
  genres: {
    business: {
      name: "业务效率",
      description: "贴近实务、让日常工作更轻松的工具",
    },
    creators: {
      name: "创作者支持",
      description: "支持内容创作与发布的创作者工具箱",
    },
    utilities: {
      name: "日常实用工具",
      description: "快速搞定小任务的通用工具",
    },
    minigames: {
      name: "小游戏",
      description: "工作间隙稍作放松的趣味小游戏",
    },
  },
  tools: {
    "invoice-maker": {
      title: "单据制作",
      description: "A4 发票/报价/交货单/收据。多语言多货币 PDF。",
    },
    "mail-template": {
      title: "邮件模板",
      description: "用标签分类与变量替换，让日常邮件回复更快。",
    },
    "folder-generator": {
      title: "文件夹生成",
      description: "按命名规则组合日期、编号与列表，一键批量创建。",
    },
    "excel-merger": {
      title: "工作表合并",
      description: "拖动合并工作表。跨表引用有警告，也可按值导出。",
    },
    "pdf-editor": {
      title: "PDF编辑",
      description: "在浏览器中完成合并、排序与页面删除。",
    },
    "image-compressor": {
      title: "图片压缩",
      description: "指定最大宽度与画质，在浏览器内批量缩放与压缩。",
    },
    "text-cleaner": {
      title: "文本清理",
      description: "一键清理换行、空白与控制字符，也可保存自定义替换规则。",
    },
    "media-metadata-editor": {
      title: "媒体标签",
      description: "在浏览器内编辑并预览音乐与视频的标签和封面。",
    },
    "character-relation-editor": {
      title: "小说关系图",
      description: "用角色卡片与关系线，直观整理故事中的人物关系。",
    },
    "book-visualizer": {
      title: "纸面编辑",
      description: "指定纸张与排版，直接编辑版面，并用 .mybook 分享。",
    },
    "palette-collector": {
      title: "配色板",
      description: "从图片提取配色，支持自动提取与对比度检查。",
    },
    "lunch-savings": {
      title: "午餐存钱",
      description: "点按记录与预算的差额，用游戏感攒下省下的钱。",
    },
    "link-stocker": {
      title: "链接收藏",
      description: "用不太正式的书签方式，以带 OGP 的卡片收藏 URL。",
    },
    "ultimate-probability-slot": {
      title: "概率老虎机",
      description: "用自制低概率老虎机挑战「直到中奖」或「连续落空」。",
    },
    "pixel-drop-puzzle": {
      title: "像素落缝",
      description: "把照片落入缝隙即可，亚像素级判定的精度谜题。",
    },
    "robot-freethrow": {
      title: "投射罚球",
      description: "用角度、初速与旋转瞄准篮筐的抛体运动小游戏。",
    },
    "crypto-message": {
      title: "秘密消息",
      description: "用口令加密解密，附带凯撒密码挑战。",
    },
    "monster-driver": {
      title: "怪物驾驶",
      description: "红灯停、蓝灯冲。考验转向灯记忆的第一人称动作。",
    },
  },
  card: {
    open: "打开",
    comingSoon: "准备中",
    comingSoonHint: "即将推出",
    mobileSupported: "支持手机",
    mobileSupportedHint: "已针对手机优化",
    pcRecommended: "推荐电脑",
    pcRecommendedHint: "建议在电脑上使用",
  },
  footer: {
    tagline: "让日常琐事更轻松的个人开发工具集",
    navAria: "运营者信息",
    contact: "联系我们",
    terms: "使用条款",
    privacy: "隐私政策",
    environmentLabel: "运行环境",
    noticeLabel: "注意事项",
    localOnly:
      "🔒 工具的文件与输入内容原则上在浏览器内处理并保存，运营者不会收集或保管其内容。也不使用 Cookie 进行个人追踪。仅为改进网站，我们会统计匿名化的访问量与工具使用次数。部分工具可能有有限的网络请求（详见隐私政策）。",
  },
  messages: {
    environment:
      "本站工具原则上在浏览器内运行，无需安装。可在 Windows / Mac / 智能手机等使用，但部分工具面向电脑（不支持手机）。浏览网站与首次使用需要网络，不保证全站离线可用。",
    persistence:
      "保存数据存放在浏览器的 LocalStorage（设备本地临时区域）。清除缓存、删除站点数据，或换用其他浏览器/设备时可能丢失。重要数据请定期「导出（保存）」并自行备份。",
    safety:
      "工具中输入与创建的数据原则上只保存在您的设备（浏览器）内，运营者不会在服务器上收集或保管其内容。这无法覆盖设备侧风险，重要数据请自行备份。",
    safetyShort: "数据原则上保存在浏览器内，运营者不会收集内容。",
    privacyBanner:
      "文件与输入内容原则上在此浏览器内处理。运营者不会收集或保存其内容。",
    privacyBannerShort:
      "原则上在浏览器内处理。运营者不保存输入内容。",
  },
  dataManager: {
    buttonTitle: "数据管理（备份与恢复）",
    buttonAria: "数据管理（备份与恢复）",
    buttonLabel: "备份",
    buttonLabelShort: "数据",
    dialogTitle: "数据管理（备份与恢复）",
    close: "关闭",
    safetyHeading: "关于数据安全",
    backupReasonHeading: "建议备份的原因",
    export: "📥 导出数据（保存）",
    import: "📤 导入数据（加载）",
    noData: "此工具仅在会话内运行，没有可保存的设置数据。运营者也不会收集或保存处理内容。",
    exportOk: "已下载备份文件。",
    exportFail: "导出失败。",
    importOk: "已加载数据。",
    importFail: "加载失败。",
    importInvalid: "无法应用该数据内容。",
    importConfirm: "当前数据将被覆盖，确定继续吗？",
  },
  apps: appsZhCN,
  contact: {
    title: "联系我们",
    lead: "填写下方表单并提交后，将打开您的邮件应用。不会向服务器发送数据。",
    mailtoHint: "※点击发送后，将启动您的邮件软件",
    submit: "用邮件应用发送",
    messageRequired: "请填写消息内容。",
    categoryLabel: "咨询类型",
    categories: {
      general: "一般咨询",
      feature: "功能建议",
      bug: "问题反馈",
      other: "其他",
    },
    appLabel: "相关应用",
    appPlaceholder: "可选",
    appNone: "（未指定）",
    nameLabel: "您的姓名",
    namePlaceholder: "可选",
    emailLabel: "回复邮箱",
    emailPlaceholder: "you@example.com",
    emailHint: "可选 — 如需回复请填写",
    messageLabel: "消息内容",
    messagePlaceholder: "请填写问题、建议或故障详情",
    subjectPrefix: "【Blank Note】咨询",
    bodyLabels: {
      category: "咨询类型",
      app: "相关应用",
      name: "姓名",
      email: "回复邮箱",
      message: "消息",
      environment: "环境信息（自动附加）",
      notProvided: "（未填写）",
    },
  },
};
