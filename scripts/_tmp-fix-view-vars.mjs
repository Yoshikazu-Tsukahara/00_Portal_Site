import fs from "node:fs";

const inserts = {
  fr: `    variables: {
      title: "Avant de lire",
      lead: "Saisissez des noms ou mots. Les champs vides gardent la valeur par défaut.",
      confirm: "Lire avec ces noms",
    },
`,
  ko: `    variables: {
      title: "읽기 전 설정",
      lead: "이름이나 호칭을 입력하세요. 비워 두면 기본값을 씁니다.",
      confirm: "이 설정으로 읽기",
    },
`,
  pt: `    variables: {
      title: "Antes de ler",
      lead: "Digite nomes ou palavras. Campos vazios mantêm o padrão.",
      confirm: "Ler com estes nomes",
    },
`,
  "zh-TW": `    variables: {
      title: "閱讀前設定",
      lead: "請輸入名字或稱呼。留空則使用預設值。",
      confirm: "依此設定閱讀",
    },
`,
};

for (const [lang, block] of Object.entries(inserts)) {
  const file = `src/i18n/locales/apps/${lang}.ts`;
  let s = fs.readFileSync(file, "utf8");
  // Only touch bookVisualizer.view: first endEditConfirm after bookVisualizer
  const marker = "bookVisualizer:";
  const start = s.indexOf(marker);
  if (start < 0) throw new Error("no bookVisualizer " + lang);
  const viewIdx = s.indexOf("view:", start);
  const endEdit = s.indexOf("endEditConfirm:", viewIdx);
  const lineEnd = s.indexOf("\n", endEdit);
  const after = s.slice(lineEnd + 1);
  // if next non-ws is already variables, skip
  if (/^\s*variables:\s*\{/.test(after)) {
    console.log(lang, "already has view.variables");
    continue;
  }
  s = s.slice(0, lineEnd + 1) + block + s.slice(lineEnd + 1);
  fs.writeFileSync(file, s);
  console.log(lang, "inserted");
}
