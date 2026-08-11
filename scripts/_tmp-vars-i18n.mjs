import fs from "node:fs";

const variablesBlockEn = `    variables: {
      heading: "Name placeholders",
      lead: "Define words readers can customize. Write {{name1}} in the body text.",
      tokenHint:
        "Use double curly braces (e.g. {{name1}}). Pagination runs after substitution, so longer names still fit the page grid.",
      add: "+ Add variable",
      empty: "No variables yet. Add one to show a setup screen before reading.",
      idLabel: "Code (ID used in the text)",
      labelLabel: "Label (shown to readers)",
      labelPlaceholder: "e.g. Protagonist's name",
      defaultLabel: "Default value",
      defaultPlaceholder: "e.g. Alice",
      remove: "Delete this variable",
      confirmRemove: "Delete this variable?",
    },`;

const viewVarsEn = `    variables: {
      title: "Before you read",
      lead: "Enter names or words to use in the story. Empty fields keep their defaults.",
      confirm: "Read with these names",
    },
`;

const byLang = {
  de: {
    tab: "Namen",
    variables: `    variables: {
      heading: "Namensplatzhalter",
      lead: "Wörter definieren, die Leser anpassen können. Im Text {{name1}} schreiben.",
      tokenHint:
        "Doppelte geschweifte Klammern (z. B. {{name1}}). Die Paginierung läuft nach der Ersetzung.",
      add: "+ Variable hinzufügen",
      empty: "Noch keine Variablen. Mit einer erscheint vor dem Lesen ein Setup.",
      idLabel: "Code (ID im Text)",
      labelLabel: "Bezeichnung (für Leser)",
      labelPlaceholder: "z. B. Name der Hauptfigur",
      defaultLabel: "Standardwert",
      defaultPlaceholder: "z. B. Alice",
      remove: "Diese Variable löschen",
      confirmRemove: "Diese Variable löschen?",
    },`,
    view: `    variables: {
      title: "Vor dem Lesen",
      lead: "Namen oder Wörter eingeben. Leere Felder behalten den Standard.",
      confirm: "Mit diesen Namen lesen",
    },
`,
  },
  es: {
    tab: "Nombres",
    variables: `    variables: {
      heading: "Marcadores de nombre",
      lead: "Define palabras que el lector pueda cambiar. Escribe {{name1}} en el texto.",
      tokenHint:
        "Usa llaves dobles (p. ej. {{name1}}). La paginación se calcula tras sustituir.",
      add: "+ Añadir variable",
      empty: "Aún no hay variables. Si añades una, habrá una pantalla antes de leer.",
      idLabel: "Código (ID en el texto)",
      labelLabel: "Etiqueta (para el lector)",
      labelPlaceholder: "p. ej. Nombre del protagonista",
      defaultLabel: "Valor por defecto",
      defaultPlaceholder: "p. ej. Alicia",
      remove: "Eliminar esta variable",
      confirmRemove: "¿Eliminar esta variable?",
    },`,
    view: `    variables: {
      title: "Antes de leer",
      lead: "Introduce nombres o palabras. Los campos vacíos usan el valor por defecto.",
      confirm: "Leer con estos nombres",
    },
`,
  },
  fr: {
    tab: "Noms",
    variables: `    variables: {
      heading: "Variables de nom",
      lead: "Définissez des mots personnalisables. Écrivez {{name1}} dans le texte.",
      tokenHint:
        "Utilisez des doubles accolades (ex. {{name1}}). La pagination suit la substitution.",
      add: "+ Ajouter une variable",
      empty: "Aucune variable. Ajoutez-en une pour afficher un écran avant la lecture.",
      idLabel: "Code (ID dans le texte)",
      labelLabel: "Libellé (affiché au lecteur)",
      labelPlaceholder: "ex. Nom du protagoniste",
      defaultLabel: "Valeur par défaut",
      defaultPlaceholder: "ex. Alice",
      remove: "Supprimer cette variable",
      confirmRemove: "Supprimer cette variable ?",
    },`,
    view: `    variables: {
      title: "Avant de lire",
      lead: "Saisissez des noms ou mots. Les champs vides gardent la valeur par défaut.",
      confirm: "Lire avec ces noms",
    },
`,
  },
  ko: {
    tab: "이름 변환",
    variables: `    variables: {
      heading: "이름 변환",
      lead: "읽는 이가 바꿀 단어를 정의합니다. 본문에 {{name1}}처럼 적으세요.",
      tokenHint:
        "이중 중괄호를 씁니다(예: {{name1}}). 치환 뒤에 페이지를 나누므로 레이아웃이 유지됩니다.",
      add: "+ 변수 추가",
      empty: "아직 변수가 없습니다. 추가하면 읽기 전에 입력 화면이 나옵니다.",
      idLabel: "코드(본문에 쓸 ID)",
      labelLabel: "표시 이름(독자용)",
      labelPlaceholder: "예: 주인공 이름",
      defaultLabel: "기본값",
      defaultPlaceholder: "예: 앨리스",
      remove: "이 변수 삭제",
      confirmRemove: "이 변수를 삭제할까요?",
    },`,
    view: `    variables: {
      title: "읽기 전 설정",
      lead: "이름이나 호칭을 입력하세요. 비워 두면 기본값을 씁니다.",
      confirm: "이 설정으로 읽기",
    },
`,
  },
  pt: {
    tab: "Nomes",
    variables: `    variables: {
      heading: "Marcadores de nome",
      lead: "Defina palavras que o leitor possa trocar. Escreva {{name1}} no texto.",
      tokenHint:
        "Use chaves duplas (ex.: {{name1}}). A paginação roda após a substituição.",
      add: "+ Adicionar variável",
      empty: "Ainda sem variáveis. Adicione uma para mostrar a tela antes de ler.",
      idLabel: "Código (ID no texto)",
      labelLabel: "Rótulo (para o leitor)",
      labelPlaceholder: "ex.: Nome do protagonista",
      defaultLabel: "Valor padrão",
      defaultPlaceholder: "ex.: Alice",
      remove: "Excluir esta variável",
      confirmRemove: "Excluir esta variável?",
    },`,
    view: `    variables: {
      title: "Antes de ler",
      lead: "Digite nomes ou palavras. Campos vazios mantêm o padrão.",
      confirm: "Ler com estes nomes",
    },
`,
  },
  "zh-CN": {
    tab: "名字替换",
    variables: `    variables: {
      heading: "名字替换",
      lead: "定义读者可自定义的词语。在正文中写 {{name1}}。",
      tokenHint:
        "使用双花括号（如 {{name1}}）。替换后再分页，版面不会乱。",
      add: "+ 添加变量",
      empty: "还没有变量。添加后，阅读前会显示输入界面。",
      idLabel: "代码（正文中的 ID）",
      labelLabel: "显示名（给读者看）",
      labelPlaceholder: "例如：主角名字",
      defaultLabel: "默认值",
      defaultPlaceholder: "例如：爱丽丝",
      remove: "删除此变量",
      confirmRemove: "要删除此变量吗？",
    },`,
    view: `    variables: {
      title: "阅读前设置",
      lead: "请输入名字或称呼。留空则使用默认值。",
      confirm: "按此设置阅读",
    },
`,
  },
  "zh-TW": {
    tab: "名字替換",
    variables: `    variables: {
      heading: "名字替換",
      lead: "定義讀者可自訂的詞語。在正文中寫 {{name1}}。",
      tokenHint:
        "使用雙花括號（如 {{name1}}）。替換後再分頁，版面不會亂。",
      add: "+ 新增變數",
      empty: "還沒有變數。新增後，閱讀前會顯示輸入畫面。",
      idLabel: "代碼（正文中的 ID）",
      labelLabel: "顯示名（給讀者看）",
      labelPlaceholder: "例如：主角名字",
      defaultLabel: "預設值",
      defaultPlaceholder: "例如：愛麗絲",
      remove: "刪除此變數",
      confirmRemove: "要刪除此變數嗎？",
    },`,
    view: `    variables: {
      title: "閱讀前設定",
      lead: "請輸入名字或稱呼。留空則使用預設值。",
      confirm: "依此設定閱讀",
    },
`,
  },
};

const files = [
  "src/i18n/locales/apps/de.ts",
  "src/i18n/locales/apps/es.ts",
  "src/i18n/locales/apps/fr.ts",
  "src/i18n/locales/apps/ko.ts",
  "src/i18n/locales/apps/pt.ts",
  "src/i18n/locales/apps/zh-CN.ts",
  "src/i18n/locales/apps/zh-TW.ts",
];

for (const file of files) {
  const lang = file.split("/").pop().replace(".ts", "");
  const conf = byLang[lang];
  if (!conf) continue;
  let s = fs.readFileSync(file, "utf8");
  s = s.replace(/tabPrompts:\s*"[^"]*"/g, `tabVariables: ${JSON.stringify(conf.tab)}`);
  s = s.replace(/tabVariables:\s*"[^"]*"/g, `tabVariables: ${JSON.stringify(conf.tab)}`);
  // Replace prompts block inside edit
  s = s.replace(
    /\n\s*prompts:\s*\{[\s\S]*?confirmRemove:\s*"[^"]*",?\s*\},/,
    `\n${conf.variables}`,
  );
  // Insert view.variables before closing of view if missing
  if (!s.includes("view:") || !/view:\s*\{[\s\S]*variables:\s*\{/.test(s)) {
    s = s.replace(
      /(endEditConfirm:\s*"[^"]*",)\s*\n(\s*)\},(\s*\n\s*\},?\s*\n\s*(?:export|$|palette-collector|invoiceMaker|bookVisualizer))/m,
      `$1\n$2${conf.view.trim()}\n$2},$3`,
    );
  }
  // Simpler: after endEditConfirm in bookVisualizer view section
  if (!/bookVisualizer:[\s\S]*view:[\s\S]*variables:\s*\{/.test(s)) {
    s = s.replace(
      /(bookVisualizer:[\s\S]*?endEditConfirm:\s*"[^"]*",)/,
      `$1\n${conf.view}`,
    );
  }
  fs.writeFileSync(file, s);
  console.log("updated", file);
}

// sanity: unused
void variablesBlockEn;
void viewVarsEn;
