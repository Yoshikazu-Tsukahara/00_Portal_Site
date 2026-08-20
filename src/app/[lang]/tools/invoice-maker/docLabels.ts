/**
 * 帳票ラベル辞書。
 * - PDF／プレビュー印字: data.docLocale で取得
 * - 入力フォーム操作 UI: サイト言語にマップした DocLocale で取得
 */

import type { DocLocale, DocumentType } from "./types";

/** 書類タイプに応じて切り替わるラベル */
export type DocumentTypeFieldLabels = {
  number: Record<DocumentType, string>;
  dueDate: Record<DocumentType, string | null>;
  issueDate: Record<DocumentType, string>;
  to: Record<DocumentType, string>;
  from: Record<DocumentType, string>;
  amountDue: Record<DocumentType, string>;
  paymentMethod: Record<DocumentType, string>;
  thanks: Record<DocumentType, string>;
};

/** 帳票言語ごとの UI／印字ラベル一式 */
export type DocLabels = {
  titles: Record<DocumentType, string>;
  byDocumentType: DocumentTypeFieldLabels;
  registrationNumber: string;
  itemName: string;
  unitPrice: string;
  quantity: string;
  amount: string;
  subtotal: string;
  tax: string;
  withholdingTax: string;
  total: string;
  notes: string;
  placeholders: { partyName: string; itemName: string };
  form: {
    basicsHeading: string;
    invoiceNumberPlaceholder: string;
    fromHint: string;
    fromNamePlaceholder: string;
    fromAddressPlaceholder: string;
    fromEmailPlaceholder: string;
    fromExtraPlaceholder: string;
    toNamePlaceholderByType: Record<DocumentType, string>;
    toAddressPlaceholder: string;
    toEmailPlaceholder: string;
    toExtraPlaceholder: string;
    fields: {
      name: string;
      address: string;
      email: string;
      extra: string;
      registrationNumber: string;
      registrationNumberPlaceholder: string;
    };
    items: {
      heading: string;
      add: string;
      name: string;
      namePlaceholder: string;
      unitPrice: string;
      quantity: string;
      amount: string;
      remove: string;
      removeAria: string;
      removeLastAlert: string;
      maxItemsAlert: string;
      subtotalLabel: string;
    };
    paymentHintByType: Record<DocumentType, string>;
    paymentPlaceholderByType: Record<DocumentType, string>;
    notesPlaceholder: string;
  };
};

const ja: DocLabels = {
  titles: {
    invoice: "請求書",
    estimate: "見積書",
    deliveryNote: "納品書",
    receipt: "領収書",
  },
  byDocumentType: {
    number: {
      invoice: "請求書番号",
      estimate: "見積書番号",
      deliveryNote: "納品書番号",
      receipt: "領収書番号",
    },
    dueDate: {
      invoice: "支払期日",
      estimate: "有効期限",
      deliveryNote: null,
      receipt: null,
    },
    issueDate: {
      invoice: "発行日",
      estimate: "発行日",
      deliveryNote: "納品日",
      receipt: "領収日",
    },
    to: {
      invoice: "請求先",
      estimate: "見積先",
      deliveryNote: "納品先",
      receipt: "宛名",
    },
    from: {
      invoice: "発行者",
      estimate: "発行者",
      deliveryNote: "発行者",
      receipt: "領収者",
    },
    amountDue: {
      invoice: "ご請求金額",
      estimate: "お見積金額",
      deliveryNote: "合計金額",
      receipt: "領収金額",
    },
    paymentMethod: {
      invoice: "支払方法",
      estimate: "支払条件",
      deliveryNote: "支払条件",
      receipt: "受領方法",
    },
    thanks: {
      invoice: "お取引いただきありがとうございます。",
      estimate: "ご検討のほどよろしくお願いいたします。",
      deliveryNote: "納品いたしました。ご確認のほどよろしくお願いいたします。",
      receipt: "上記正に領収いたしました。",
    },
  },
  registrationNumber: "登録番号",
  itemName: "品目",
  unitPrice: "単価",
  quantity: "数量",
  amount: "金額",
  subtotal: "小計",
  tax: "消費税",
  withholdingTax: "源泉徴収税",
  total: "合計",
  notes: "備考 / 特記事項",
  placeholders: { partyName: "（未入力）", itemName: "（品名未入力）" },
  form: {
    basicsHeading: "基本情報",
    invoiceNumberPlaceholder: "INV-20260801-01",
    fromHint: "この内容は自動でブラウザに保存され、次回そのまま使えます。",
    fromNamePlaceholder: "山田 太郎 / 屋号・社名",
    fromAddressPlaceholder: "〒000-0000\n東京都◯◯区◯◯ 1-2-3",
    fromEmailPlaceholder: "you@example.com",
    fromExtraPlaceholder: "TEL 090-0000-0000",
    toNamePlaceholderByType: {
      invoice: "株式会社◯◯ 御中",
      estimate: "株式会社◯◯ 御中",
      deliveryNote: "株式会社◯◯ 御中",
      receipt: "株式会社◯◯ 様",
    },
    toAddressPlaceholder: "〒000-0000\n東京都◯◯区◯◯ 4-5-6",
    toEmailPlaceholder: "billing@example.com",
    toExtraPlaceholder: "担当者名・部署など",
    fields: {
      name: "名前 / 社名",
      address: "住所",
      email: "メール",
      extra: "補足",
      registrationNumber: "登録番号（任意）",
      registrationNumberPlaceholder: "T1234567890123",
    },
    items: {
      heading: "品目",
      add: "＋ 行を追加",
      name: "品名",
      namePlaceholder: "Webサイト制作費",
      unitPrice: "単価",
      quantity: "数量",
      amount: "金額",
      remove: "削除",
      removeAria: "この行を削除",
      removeLastAlert: "品目は1行以上必要です。",
      maxItemsAlert: "品目は最大10行までです。",
      subtotalLabel: "小計（税抜）",
    },
    paymentHintByType: {
      invoice: "銀行口座や Stripe / PayPal の決済URLをそのまま書けます。",
      estimate: "振込・月末締めなど、見積時点の支払条件を書けます。",
      deliveryNote: "支払条件があれば任意で書けます（未入力なら帳票に出ません）。",
      receipt: "現金・クレジットカード・振込など、受け取った方法を書けます。",
    },
    paymentPlaceholderByType: {
      invoice:
        "◯◯銀行 ◯◯支店 普通 1234567（ヤマダ タロウ）\nまたは https://buy.stripe.com/xxxx",
      estimate: "お振込：納品後◯日以内\nクレジットカード可",
      deliveryNote: "請求書に記載のお支払条件に準じます",
      receipt: "現金\nクレジットカード（一括）\n銀行振込",
    },
    notesPlaceholder:
      "ご不明点があればお気軽にご連絡ください。\n※振込手数料はお客様にてご負担をお願いいたします。",
  },
};

const en: DocLabels = {
  titles: {
    invoice: "INVOICE",
    estimate: "ESTIMATE",
    deliveryNote: "DELIVERY NOTE",
    receipt: "RECEIPT",
  },
  byDocumentType: {
    number: {
      invoice: "Invoice #",
      estimate: "Estimate #",
      deliveryNote: "Delivery #",
      receipt: "Receipt #",
    },
    dueDate: {
      invoice: "Due Date",
      estimate: "Valid Until",
      deliveryNote: null,
      receipt: null,
    },
    issueDate: {
      invoice: "Issue Date",
      estimate: "Issue Date",
      deliveryNote: "Delivery Date",
      receipt: "Receipt Date",
    },
    to: {
      invoice: "Billed To",
      estimate: "Estimate For",
      deliveryNote: "Deliver To",
      receipt: "Received From",
    },
    from: {
      invoice: "From",
      estimate: "From",
      deliveryNote: "From",
      receipt: "Issued By",
    },
    amountDue: {
      invoice: "Amount Due",
      estimate: "Estimated Total",
      deliveryNote: "Total Amount",
      receipt: "Amount Received",
    },
    paymentMethod: {
      invoice: "Payment Method",
      estimate: "Payment Terms",
      deliveryNote: "Payment Terms",
      receipt: "Received via",
    },
    thanks: {
      invoice: "Thank you for your business.",
      estimate: "Thank you for considering this estimate.",
      deliveryNote: "Delivered. Please confirm receipt.",
      receipt: "Payment received with thanks.",
    },
  },
  registrationNumber: "Registration No.",
  itemName: "Description",
  unitPrice: "Unit Price",
  quantity: "Qty",
  amount: "Amount",
  subtotal: "Subtotal",
  tax: "Tax",
  withholdingTax: "Withholding Tax",
  total: "Total",
  notes: "Notes / Terms",
  placeholders: { partyName: "(not set)", itemName: "(no description)" },
  form: {
    basicsHeading: "Basics",
    invoiceNumberPlaceholder: "INV-20260801-01",
    fromHint: "Saved in your browser automatically, ready for next time.",
    fromNamePlaceholder: "Taro Yamada / Studio name",
    fromAddressPlaceholder: "1-2-3 Somewhere\nTokyo 000-0000, Japan",
    fromEmailPlaceholder: "you@example.com",
    fromExtraPlaceholder: "Tel +81 90-0000-0000",
    toNamePlaceholderByType: {
      invoice: "Acme Inc.",
      estimate: "Acme Inc.",
      deliveryNote: "Acme Inc.",
      receipt: "Acme Inc.",
    },
    toAddressPlaceholder: "4-5-6 Elsewhere\nTokyo 000-0000, Japan",
    toEmailPlaceholder: "billing@example.com",
    toExtraPlaceholder: "Contact person, department, etc.",
    fields: {
      name: "Name / Company",
      address: "Address",
      email: "Email",
      extra: "Extra",
      registrationNumber: "Registration No. (optional)",
      registrationNumberPlaceholder: "T1234567890123",
    },
    items: {
      heading: "Items",
      add: "+ Add row",
      name: "Description",
      namePlaceholder: "Website design",
      unitPrice: "Unit price",
      quantity: "Qty",
      amount: "Amount",
      remove: "Remove",
      removeAria: "Remove this row",
      removeLastAlert: "At least one item row is required.",
      maxItemsAlert: "You can add up to 10 item rows.",
      subtotalLabel: "Subtotal (ex. tax)",
    },
    paymentHintByType: {
      invoice: "Bank details, or a Stripe / PayPal checkout URL.",
      estimate: "Note payment terms at quote time (net 30, card, etc.).",
      deliveryNote: "Optional payment terms (left blank if not needed).",
      receipt: "How you received payment — cash, card, bank transfer, etc.",
    },
    paymentPlaceholderByType: {
      invoice:
        "Bank of Example, Main Branch, 1234567 (TARO YAMADA)\nor https://buy.stripe.com/xxxx",
      estimate: "Bank transfer within 14 days of delivery\nCards accepted",
      deliveryNote: "Per terms stated on the invoice",
      receipt: "Cash\nCredit card (one-time)\nBank transfer",
    },
    notesPlaceholder:
      "Questions welcome — feel free to get in touch.\nPlease cover any bank transfer fees on your side.",
  },
};

const zh: DocLabels = {
  titles: {
    invoice: "发票",
    estimate: "报价单",
    deliveryNote: "送货单",
    receipt: "收据",
  },
  byDocumentType: {
    number: {
      invoice: "发票编号",
      estimate: "报价单编号",
      deliveryNote: "送货单编号",
      receipt: "收据编号",
    },
    dueDate: {
      invoice: "付款期限",
      estimate: "有效期至",
      deliveryNote: null,
      receipt: null,
    },
    issueDate: {
      invoice: "开票日期",
      estimate: "开具日期",
      deliveryNote: "送货日期",
      receipt: "收款日期",
    },
    to: {
      invoice: "收票方",
      estimate: "报价对象",
      deliveryNote: "收货方",
      receipt: "付款方",
    },
    from: {
      invoice: "开票方",
      estimate: "报价方",
      deliveryNote: "发货方",
      receipt: "收款方",
    },
    amountDue: {
      invoice: "应付金额",
      estimate: "报价合计",
      deliveryNote: "合计金额",
      receipt: "实收金额",
    },
    paymentMethod: {
      invoice: "付款方式",
      estimate: "付款条件",
      deliveryNote: "付款条件",
      receipt: "收款方式",
    },
    thanks: {
      invoice: "感谢您的惠顾。",
      estimate: "敬请审阅本报价，期待合作。",
      deliveryNote: "货物／服务已交付，请核对确认。",
      receipt: "上述款项已如数收讫。",
    },
  },
  registrationNumber: "登记号",
  itemName: "项目",
  unitPrice: "单价",
  quantity: "数量",
  amount: "金额",
  subtotal: "小计",
  tax: "税额",
  withholdingTax: "预扣税",
  total: "合计",
  notes: "备注 / 条款",
  placeholders: { partyName: "（未填写）", itemName: "（未填写品名）" },
  form: {
    basicsHeading: "基本信息",
    invoiceNumberPlaceholder: "INV-20260801-01",
    fromHint: "内容会自动保存在浏览器中，下次可直接使用。",
    fromNamePlaceholder: "姓名 / 公司名称",
    fromAddressPlaceholder: "地址（可换行）",
    fromEmailPlaceholder: "you@example.com",
    fromExtraPlaceholder: "电话等补充信息",
    toNamePlaceholderByType: {
      invoice: "某某有限公司",
      estimate: "某某有限公司",
      deliveryNote: "某某有限公司",
      receipt: "某某先生／女士",
    },
    toAddressPlaceholder: "地址（可换行）",
    toEmailPlaceholder: "billing@example.com",
    toExtraPlaceholder: "联系人、部门等",
    fields: {
      name: "姓名 / 公司",
      address: "地址",
      email: "邮箱",
      extra: "补充",
      registrationNumber: "登记号（可选）",
      registrationNumberPlaceholder: "T1234567890123",
    },
    items: {
      heading: "明细",
      add: "＋ 添加行",
      name: "品名",
      namePlaceholder: "网站制作费",
      unitPrice: "单价",
      quantity: "数量",
      amount: "金额",
      remove: "删除",
      removeAria: "删除此行",
      removeLastAlert: "至少需要一行明细。",
      maxItemsAlert: "明细最多 10 行。",
      subtotalLabel: "小计（不含税）",
    },
    paymentHintByType: {
      invoice: "可填写银行账户或支付链接。",
      estimate: "可填写报价阶段的付款条件。",
      deliveryNote: "如有付款条件可填写（空白则不打印）。",
      receipt: "可填写现金、刷卡、转账等收款方式。",
    },
    paymentPlaceholderByType: {
      invoice: "某某银行 某某支行 账号 1234567\n或 https://pay.example.com/xxxx",
      estimate: "交货后 14 日内银行转账\n可接受信用卡",
      deliveryNote: "以发票所载付款条件为准",
      receipt: "现金\n信用卡（一次付清）\n银行转账",
    },
    notesPlaceholder: "如有疑问欢迎联系。\n※银行手续费请由付款方承担。",
  },
};

const ko: DocLabels = {
  titles: {
    invoice: "청구서",
    estimate: "견적서",
    deliveryNote: "납품서",
    receipt: "영수증",
  },
  byDocumentType: {
    number: {
      invoice: "청구서 번호",
      estimate: "견적서 번호",
      deliveryNote: "납품서 번호",
      receipt: "영수증 번호",
    },
    dueDate: {
      invoice: "지급 기한",
      estimate: "유효 기간",
      deliveryNote: null,
      receipt: null,
    },
    issueDate: {
      invoice: "발행일",
      estimate: "발행일",
      deliveryNote: "납품일",
      receipt: "수령일",
    },
    to: {
      invoice: "청구처",
      estimate: "견적 대상",
      deliveryNote: "납품처",
      receipt: "받는 분",
    },
    from: {
      invoice: "발행자",
      estimate: "발행자",
      deliveryNote: "발행자",
      receipt: "수령자",
    },
    amountDue: {
      invoice: "청구 금액",
      estimate: "견적 합계",
      deliveryNote: "합계 금액",
      receipt: "수령 금액",
    },
    paymentMethod: {
      invoice: "결제 방법",
      estimate: "결제 조건",
      deliveryNote: "결제 조건",
      receipt: "수령 방법",
    },
    thanks: {
      invoice: "이용해 주셔서 감사합니다.",
      estimate: "검토 부탁드리며 좋은 협력 기대합니다.",
      deliveryNote: "납품하였습니다. 확인 부탁드립니다.",
      receipt: "위 금액을 정히 영수하였습니다.",
    },
  },
  registrationNumber: "등록번호",
  itemName: "품목",
  unitPrice: "단가",
  quantity: "수량",
  amount: "금액",
  subtotal: "소계",
  tax: "세금",
  withholdingTax: "원천징수세",
  total: "합계",
  notes: "비고 / 특약",
  placeholders: { partyName: "(미입력)", itemName: "(품명 미입력)" },
  form: {
    basicsHeading: "기본 정보",
    invoiceNumberPlaceholder: "INV-20260801-01",
    fromHint: "브라우저에 자동 저장되어 다음에 그대로 사용할 수 있습니다.",
    fromNamePlaceholder: "이름 / 상호",
    fromAddressPlaceholder: "주소 (줄바꿈 가능)",
    fromEmailPlaceholder: "you@example.com",
    fromExtraPlaceholder: "전화 등 보충 정보",
    toNamePlaceholderByType: {
      invoice: "○○ 주식회사 귀중",
      estimate: "○○ 주식회사 귀중",
      deliveryNote: "○○ 주식회사 귀중",
      receipt: "○○ 님",
    },
    toAddressPlaceholder: "주소 (줄바꿈 가능)",
    toEmailPlaceholder: "billing@example.com",
    toExtraPlaceholder: "담당자·부서 등",
    fields: {
      name: "이름 / 회사명",
      address: "주소",
      email: "이메일",
      extra: "보충",
      registrationNumber: "등록번호 (선택)",
      registrationNumberPlaceholder: "T1234567890123",
    },
    items: {
      heading: "품목",
      add: "+ 행 추가",
      name: "품명",
      namePlaceholder: "웹사이트 제작비",
      unitPrice: "단가",
      quantity: "수량",
      amount: "금액",
      remove: "삭제",
      removeAria: "이 행 삭제",
      removeLastAlert: "품목은 1행 이상 필요합니다.",
      maxItemsAlert: "품목은 최대 10행까지입니다.",
      subtotalLabel: "소계 (세전)",
    },
    paymentHintByType: {
      invoice: "계좌 정보나 결제 URL을 그대로 적을 수 있습니다.",
      estimate: "견적 시점의 결제 조건을 적을 수 있습니다.",
      deliveryNote: "결제 조건이 있으면 선택적으로 적습니다 (비우면 미출력).",
      receipt: "현금·카드·계좌이체 등 수령 방법을 적습니다.",
    },
    paymentPlaceholderByType: {
      invoice: "○○은행 ○○지점 보통 1234567\n또는 https://pay.example.com/xxxx",
      estimate: "납품 후 14일 이내 계좌이체\n신용카드 가능",
      deliveryNote: "청구서에 기재된 결제 조건에 따름",
      receipt: "현금\n신용카드 (일시불)\n계좌이체",
    },
    notesPlaceholder:
      "문의 사항이 있으면 연락 주세요.\n※송금 수수료는 고객 부담입니다.",
  },
};

const es: DocLabels = {
  titles: {
    invoice: "FACTURA",
    estimate: "PRESUPUESTO",
    deliveryNote: "ALBARÁN",
    receipt: "RECIBO",
  },
  byDocumentType: {
    number: {
      invoice: "N.º de factura",
      estimate: "N.º de presupuesto",
      deliveryNote: "N.º de albarán",
      receipt: "N.º de recibo",
    },
    dueDate: {
      invoice: "Vencimiento",
      estimate: "Válido hasta",
      deliveryNote: null,
      receipt: null,
    },
    issueDate: {
      invoice: "Fecha de emisión",
      estimate: "Fecha de emisión",
      deliveryNote: "Fecha de entrega",
      receipt: "Fecha de recibo",
    },
    to: {
      invoice: "Facturado a",
      estimate: "Presupuesto para",
      deliveryNote: "Entregar a",
      receipt: "Recibido de",
    },
    from: {
      invoice: "De",
      estimate: "De",
      deliveryNote: "De",
      receipt: "Emitido por",
    },
    amountDue: {
      invoice: "Importe a pagar",
      estimate: "Total estimado",
      deliveryNote: "Importe total",
      receipt: "Importe recibido",
    },
    paymentMethod: {
      invoice: "Forma de pago",
      estimate: "Condiciones de pago",
      deliveryNote: "Condiciones de pago",
      receipt: "Recibido mediante",
    },
    thanks: {
      invoice: "Gracias por su confianza.",
      estimate: "Gracias por considerar este presupuesto.",
      deliveryNote: "Entrega realizada. Por favor, confirme la recepción.",
      receipt: "Importe recibido. Gracias.",
    },
  },
  registrationNumber: "N.º de registro",
  itemName: "Concepto",
  unitPrice: "Precio unit.",
  quantity: "Cant.",
  amount: "Importe",
  subtotal: "Subtotal",
  tax: "Impuestos",
  withholdingTax: "Retención",
  total: "Total",
  notes: "Notas / Condiciones",
  placeholders: { partyName: "(sin indicar)", itemName: "(sin concepto)" },
  form: {
    basicsHeading: "Datos básicos",
    invoiceNumberPlaceholder: "INV-20260801-01",
    fromHint: "Se guarda automáticamente en el navegador para la próxima vez.",
    fromNamePlaceholder: "Nombre / Empresa",
    fromAddressPlaceholder: "Dirección (varias líneas)",
    fromEmailPlaceholder: "you@example.com",
    fromExtraPlaceholder: "Teléfono u otros datos",
    toNamePlaceholderByType: {
      invoice: "Acme S.A.",
      estimate: "Acme S.A.",
      deliveryNote: "Acme S.A.",
      receipt: "Acme S.A.",
    },
    toAddressPlaceholder: "Dirección (varias líneas)",
    toEmailPlaceholder: "billing@example.com",
    toExtraPlaceholder: "Contacto, departamento, etc.",
    fields: {
      name: "Nombre / Empresa",
      address: "Dirección",
      email: "Correo",
      extra: "Extra",
      registrationNumber: "N.º de registro (opcional)",
      registrationNumberPlaceholder: "T1234567890123",
    },
    items: {
      heading: "Líneas",
      add: "+ Añadir línea",
      name: "Concepto",
      namePlaceholder: "Diseño web",
      unitPrice: "Precio unit.",
      quantity: "Cant.",
      amount: "Importe",
      remove: "Eliminar",
      removeAria: "Eliminar esta línea",
      removeLastAlert: "Se requiere al menos una línea.",
      maxItemsAlert: "Máximo 10 líneas.",
      subtotalLabel: "Subtotal (sin impuestos)",
    },
    paymentHintByType: {
      invoice: "Cuenta bancaria o enlace de pago (Stripe / PayPal, etc.).",
      estimate: "Condiciones de pago del presupuesto.",
      deliveryNote: "Condiciones opcionales (si está vacío, no se imprime).",
      receipt: "Cómo se recibió el pago: efectivo, tarjeta, transferencia…",
    },
    paymentPlaceholderByType: {
      invoice:
        "Banco Ejemplo, sucursal Centro, 1234567\no https://buy.stripe.com/xxxx",
      estimate: "Transferencia en 14 días tras la entrega\nTarjeta aceptada",
      deliveryNote: "Según las condiciones de la factura",
      receipt: "Efectivo\nTarjeta (pago único)\nTransferencia",
    },
    notesPlaceholder:
      "Ante cualquier duda, no dude en contactarnos.\n※Las comisiones bancarias corren a cargo del pagador.",
  },
};

const fr: DocLabels = {
  titles: {
    invoice: "FACTURE",
    estimate: "DEVIS",
    deliveryNote: "BON DE LIVRAISON",
    receipt: "REÇU",
  },
  byDocumentType: {
    number: {
      invoice: "N° de facture",
      estimate: "N° de devis",
      deliveryNote: "N° de BL",
      receipt: "N° de reçu",
    },
    dueDate: {
      invoice: "Échéance",
      estimate: "Valable jusqu’au",
      deliveryNote: null,
      receipt: null,
    },
    issueDate: {
      invoice: "Date d’émission",
      estimate: "Date d’émission",
      deliveryNote: "Date de livraison",
      receipt: "Date de réception",
    },
    to: {
      invoice: "Facturé à",
      estimate: "Devis pour",
      deliveryNote: "Livrer à",
      receipt: "Reçu de",
    },
    from: {
      invoice: "De",
      estimate: "De",
      deliveryNote: "De",
      receipt: "Émis par",
    },
    amountDue: {
      invoice: "Montant dû",
      estimate: "Total estimé",
      deliveryNote: "Montant total",
      receipt: "Montant reçu",
    },
    paymentMethod: {
      invoice: "Mode de paiement",
      estimate: "Conditions de paiement",
      deliveryNote: "Conditions de paiement",
      receipt: "Reçu via",
    },
    thanks: {
      invoice: "Merci pour votre confiance.",
      estimate: "Merci d’examiner ce devis.",
      deliveryNote: "Livraison effectuée. Merci de confirmer la réception.",
      receipt: "Somme reçue avec nos remerciements.",
    },
  },
  registrationNumber: "N° d’immatriculation",
  itemName: "Désignation",
  unitPrice: "Prix unit.",
  quantity: "Qté",
  amount: "Montant",
  subtotal: "Sous-total",
  tax: "TVA",
  withholdingTax: "Retenue à la source",
  total: "Total",
  notes: "Notes / Conditions",
  placeholders: { partyName: "(non renseigné)", itemName: "(sans désignation)" },
  form: {
    basicsHeading: "Informations de base",
    invoiceNumberPlaceholder: "INV-20260801-01",
    fromHint: "Enregistré automatiquement dans le navigateur pour la prochaine fois.",
    fromNamePlaceholder: "Nom / Société",
    fromAddressPlaceholder: "Adresse (plusieurs lignes)",
    fromEmailPlaceholder: "you@example.com",
    fromExtraPlaceholder: "Téléphone ou complément",
    toNamePlaceholderByType: {
      invoice: "Acme SAS",
      estimate: "Acme SAS",
      deliveryNote: "Acme SAS",
      receipt: "Acme SAS",
    },
    toAddressPlaceholder: "Adresse (plusieurs lignes)",
    toEmailPlaceholder: "billing@example.com",
    toExtraPlaceholder: "Contact, service, etc.",
    fields: {
      name: "Nom / Société",
      address: "Adresse",
      email: "E-mail",
      extra: "Complément",
      registrationNumber: "N° d’immatriculation (facultatif)",
      registrationNumberPlaceholder: "T1234567890123",
    },
    items: {
      heading: "Lignes",
      add: "+ Ajouter une ligne",
      name: "Désignation",
      namePlaceholder: "Création de site web",
      unitPrice: "Prix unit.",
      quantity: "Qté",
      amount: "Montant",
      remove: "Supprimer",
      removeAria: "Supprimer cette ligne",
      removeLastAlert: "Au moins une ligne est requise.",
      maxItemsAlert: "Maximum 10 lignes.",
      subtotalLabel: "Sous-total (HT)",
    },
    paymentHintByType: {
      invoice: "RIB ou lien de paiement (Stripe / PayPal, etc.).",
      estimate: "Conditions de paiement du devis.",
      deliveryNote: "Conditions facultatives (vide = non imprimé).",
      receipt: "Mode de réception : espèces, carte, virement…",
    },
    paymentPlaceholderByType: {
      invoice:
        "Banque Exemple, agence Centre, 1234567\nou https://buy.stripe.com/xxxx",
      estimate: "Virement sous 14 jours après livraison\nCarte acceptée",
      deliveryNote: "Selon les conditions de la facture",
      receipt: "Espèces\nCarte (paiement unique)\nVirement",
    },
    notesPlaceholder:
      "Pour toute question, n’hésitez pas à nous contacter.\n※Les frais bancaires sont à la charge du payeur.",
  },
};

const de: DocLabels = {
  titles: {
    invoice: "RECHNUNG",
    estimate: "ANGEBOT",
    deliveryNote: "LIEFERSCHEIN",
    receipt: "QUITTUNG",
  },
  byDocumentType: {
    number: {
      invoice: "Rechnungsnr.",
      estimate: "Angebotsnr.",
      deliveryNote: "Lieferscheinnr.",
      receipt: "Quittungsnr.",
    },
    dueDate: {
      invoice: "Fälligkeitsdatum",
      estimate: "Gültig bis",
      deliveryNote: null,
      receipt: null,
    },
    issueDate: {
      invoice: "Rechnungsdatum",
      estimate: "Ausstellungsdatum",
      deliveryNote: "Lieferdatum",
      receipt: "Quittungsdatum",
    },
    to: {
      invoice: "Rechnungsempfänger",
      estimate: "Angebot für",
      deliveryNote: "Lieferanschrift",
      receipt: "Erhalten von",
    },
    from: {
      invoice: "Absender",
      estimate: "Absender",
      deliveryNote: "Absender",
      receipt: "Ausgestellt von",
    },
    amountDue: {
      invoice: "Fälliger Betrag",
      estimate: "Angebotssumme",
      deliveryNote: "Gesamtbetrag",
      receipt: "Erhaltener Betrag",
    },
    paymentMethod: {
      invoice: "Zahlungsart",
      estimate: "Zahlungsbedingungen",
      deliveryNote: "Zahlungsbedingungen",
      receipt: "Erhalten via",
    },
    thanks: {
      invoice: "Vielen Dank für Ihr Vertrauen.",
      estimate: "Vielen Dank für die Prüfung dieses Angebots.",
      deliveryNote: "Geliefert. Bitte Empfang bestätigen.",
      receipt: "Betrag dankend erhalten.",
    },
  },
  registrationNumber: "Reg.-Nr.",
  itemName: "Bezeichnung",
  unitPrice: "Einzelpreis",
  quantity: "Menge",
  amount: "Betrag",
  subtotal: "Zwischensumme",
  tax: "MwSt.",
  withholdingTax: "Quellensteuer",
  total: "Gesamt",
  notes: "Hinweise / Bedingungen",
  placeholders: { partyName: "(nicht angegeben)", itemName: "(ohne Bezeichnung)" },
  form: {
    basicsHeading: "Grunddaten",
    invoiceNumberPlaceholder: "INV-20260801-01",
    fromHint: "Wird automatisch im Browser gespeichert und bleibt erhalten.",
    fromNamePlaceholder: "Name / Firma",
    fromAddressPlaceholder: "Adresse (mehrzeilig)",
    fromEmailPlaceholder: "you@example.com",
    fromExtraPlaceholder: "Telefon o. Ä.",
    toNamePlaceholderByType: {
      invoice: "Muster GmbH",
      estimate: "Muster GmbH",
      deliveryNote: "Muster GmbH",
      receipt: "Muster GmbH",
    },
    toAddressPlaceholder: "Adresse (mehrzeilig)",
    toEmailPlaceholder: "billing@example.com",
    toExtraPlaceholder: "Ansprechpartner, Abteilung usw.",
    fields: {
      name: "Name / Firma",
      address: "Adresse",
      email: "E-Mail",
      extra: "Zusatz",
      registrationNumber: "Reg.-Nr. (optional)",
      registrationNumberPlaceholder: "T1234567890123",
    },
    items: {
      heading: "Positionen",
      add: "+ Zeile hinzufügen",
      name: "Bezeichnung",
      namePlaceholder: "Webseitenerstellung",
      unitPrice: "Einzelpreis",
      quantity: "Menge",
      amount: "Betrag",
      remove: "Löschen",
      removeAria: "Diese Zeile löschen",
      removeLastAlert: "Mindestens eine Position ist erforderlich.",
      maxItemsAlert: "Maximal 10 Positionen.",
      subtotalLabel: "Zwischensumme (ohne Steuer)",
    },
    paymentHintByType: {
      invoice: "Bankverbindung oder Zahlungslink (Stripe / PayPal usw.).",
      estimate: "Zahlungsbedingungen des Angebots.",
      deliveryNote: "Optional (leer = wird nicht gedruckt).",
      receipt: "Empfangsart: Bargeld, Karte, Überweisung …",
    },
    paymentPlaceholderByType: {
      invoice:
        "Musterbank, Filiale Mitte, 1234567\noder https://buy.stripe.com/xxxx",
      estimate: "Überweisung innerhalb von 14 Tagen nach Lieferung\nKarte akzeptiert",
      deliveryNote: "Gemäß den Bedingungen der Rechnung",
      receipt: "Bargeld\nKreditkarte (einmalig)\nÜberweisung",
    },
    notesPlaceholder:
      "Bei Fragen melden Sie sich gerne.\n※Bankgebühren trägt der Zahlungspflichtige.",
  },
};

export const docLabelsByLocale: Record<DocLocale, DocLabels> = {
  ja,
  en,
  zh,
  ko,
  es,
  fr,
  de,
};

export function getDocLabels(locale: DocLocale): DocLabels {
  return docLabelsByLocale[locale] ?? docLabelsByLocale.en;
}

/** プレビュー／PDF 用（従来の InvoiceSheetLabels 互換） */
export type InvoiceSheetLabels = Omit<DocLabels, "form">;

export function getInvoiceSheetLabels(locale: DocLocale): InvoiceSheetLabels {
  const { form: _form, ...sheet } = getDocLabels(locale);
  return sheet;
}
