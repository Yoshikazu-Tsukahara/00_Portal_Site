import type { AppShellCopy } from "./otherApps";

export type ExcelMergerDict = {
  shell: AppShellCopy;
  drop: {
    hint: string;
    sub: string;
    reading: string;
    full: string;
  };
  list: {
    heading: string;
    hint: string;
    empty: string;
    count: string;
    fileCount: string;
    clearAll: string;
    formattingNote: string;
  };
  board: {
    emptyColumn: string;
    downloadColumn: string;
    downloadColumnAria: string;
  };
  card: {
    size: string;
    empty: string;
    renamed: string;
    fromFile: string;
    remove: string;
    removeAria: string;
    dragAria: string;
    refWarning: string;
    refWarningNames: string;
    refWarningTitle: string;
    refWarningTitleNamed: string;
  };
  valuesOnly: {
    label: string;
    hint: string;
  };
  merge: string;
  mergeShort: string;
  merging: string;
  errors: {
    invalidType: string;
    tooManyFiles: string;
    readFailed: string;
    noSheets: string;
    exportFailed: string;
  };
  messages: {
    loaded: string;
    exported: string;
    exportedZip: string;
  };
};

export const excelMergerJa: ExcelMergerDict = {
  shell: {
    title: "シート結合",
    description:
      "ファイルごとに列を作り、シートをドラッグして整理・結合できます。",
  },
  drop: {
    hint: ".xlsx をここにドラッグ＆ドロップ（最大5ファイル）",
    sub: "クリックしてファイルを選ぶこともできます。ファイルは端末内だけで処理します。",
    reading: "読み込み中…",
    full: "ファイルは最大5つです。クリアしてから追加してください。",
  },
  list: {
    heading: "ファイル別ボード",
    hint: "同じ列の中で並べ替え、別の列へドロップするとそのファイルへ移動します。× で対象から外します。",
    empty: "まだファイルがありません。上のエリアに .xlsx を投下してください。",
    count: "{count} シート",
    fileCount: "{count} ファイル",
    clearAll: "すべてクリア",
    formattingNote:
      "セルの値・数式・結合セルは引き継ぎます。グラフ・画像・一部の書式は引き継がれません。",
  },
  board: {
    emptyColumn: "シートをここにドロップ",
    downloadColumn: "保存",
    downloadColumnAria: "{name} をダウンロード",
  },
  card: {
    size: "{rows} 行 × {cols} 列",
    empty: "空のシート",
    renamed: "出力名: {name}",
    fromFile: "元: {name}",
    remove: "結合対象から外す",
    removeAria: "{name} を結合対象から外す",
    dragAria: "{index} 番目のシート「{name}」。ドラッグで並べ替え",
    refWarning: "⚠ 他シート参照あり",
    refWarningNames: "⚠ {names}",
    refWarningTitle:
      "このシートだけを抽出すると、数式（#REF!）やグラフが壊れることがあります",
    refWarningTitleNamed:
      "参照先: {names}。このシートだけを抽出すると、数式やグラフが壊れることがあります",
  },
  valuesOnly: {
    label: "数式を破棄して『値』として結合する（推奨）",
    hint: "計算済みの結果だけを書き出します。OFF にすると数式をそのまま残します。",
  },
  merge: "すべてのファイルをダウンロード",
  mergeShort: "まとめて保存",
  merging: "書き出し中…",
  errors: {
    invalidType: ".xlsx のみ対応しています",
    tooManyFiles: "ファイルは最大5つまでです",
    readFailed: "ファイルを読み込めませんでした",
    noSheets: "結合できるシートがありません",
    exportFailed: "結合ファイルの作成に失敗しました",
  },
  messages: {
    loaded: "{count} シートを読み込みました",
    exported: "{count} シートを書き出してダウンロードしました",
    exportedZip: "{files} ファイル（{sheets} シート）を ZIP で保存しました",
  },
};

export const excelMergerEn: ExcelMergerDict = {
  shell: {
    title: "Sheet Merge",
    description:
      "One column per file. Drag sheets to reorder or merge into another workbook.",
  },
  drop: {
    hint: "Drop .xlsx files here (up to 5 files)",
    sub: "You can also click to choose files. Everything is processed on your device.",
    reading: "Reading…",
    full: "You already have 5 files. Clear one before adding more.",
  },
  list: {
    heading: "File board",
    hint: "Reorder within a column, or drop onto another column to move the sheet. Press × to exclude it.",
    empty: "No files yet. Drop .xlsx files into the area above.",
    count: "{count} sheets",
    fileCount: "{count} files",
    clearAll: "Clear all",
    formattingNote:
      "Cell values, formulas, and merged cells carry over. Charts, images, and some styling do not.",
  },
  board: {
    emptyColumn: "Drop a sheet here",
    downloadColumn: "Save",
    downloadColumnAria: "Download {name}",
  },
  card: {
    size: "{rows} rows × {cols} cols",
    empty: "Empty sheet",
    renamed: "Output name: {name}",
    fromFile: "From: {name}",
    remove: "Remove from merge",
    removeAria: "Remove {name} from the merge",
    dragAria: "Sheet {index}: {name}. Drag to reorder",
    refWarning: "⚠ Cross-sheet refs",
    refWarningNames: "⚠ {names}",
    refWarningTitle:
      "Extracting this sheet alone may break formulas (#REF!) or charts",
    refWarningTitleNamed:
      "Refs: {names}. Extracting this sheet alone may break formulas or charts",
  },
  valuesOnly: {
    label: "Discard formulas and merge as values (recommended)",
    hint: "Writes calculated results only. Turn off to keep formulas.",
  },
  merge: "Download all files",
  mergeShort: "Save all",
  merging: "Exporting…",
  errors: {
    invalidType: "Only .xlsx files are supported",
    tooManyFiles: "You can load up to 5 files",
    readFailed: "Could not read the file",
    noSheets: "No sheets to merge",
    exportFailed: "Failed to build the merged file",
  },
  messages: {
    loaded: "Loaded {count} sheets",
    exported: "Exported {count} sheets and downloaded the file",
    exportedZip: "Saved {files} files ({sheets} sheets) as a ZIP",
  },
};

export const excelMergerZhCN: ExcelMergerDict = {
  shell: {
    title: "工作表合并",
    description: "每个文件一列。拖动工作表即可重排，或合并到另一文件。",
  },
  drop: {
    hint: "将 .xlsx 拖放到此处（最多 5 个文件）",
    sub: "也可以点击选择文件。文件只在本机处理。",
    reading: "正在读取…",
    full: "最多 5 个文件。请先清除后再添加。",
  },
  list: {
    heading: "文件看板",
    hint: "同一列内可重排；拖到另一列即移动到该文件。点 × 可排除。",
    empty: "还没有文件。请把 .xlsx 放到上方区域。",
    count: "{count} 个工作表",
    fileCount: "{count} 个文件",
    clearAll: "全部清除",
    formattingNote:
      "会保留单元格的值、公式和合并单元格。图表、图片和部分格式不会带入。",
  },
  board: {
    emptyColumn: "把工作表拖到这里",
    downloadColumn: "保存",
    downloadColumnAria: "下载 {name}",
  },
  card: {
    size: "{rows} 行 × {cols} 列",
    empty: "空工作表",
    renamed: "输出名称: {name}",
    fromFile: "来自: {name}",
    remove: "从合并对象中移除",
    removeAria: "将 {name} 从合并对象中移除",
    dragAria: "第 {index} 个工作表「{name}」。拖动可调整顺序",
    refWarning: "⚠ 含其他表引用",
    refWarningNames: "⚠ {names}",
    refWarningTitle: "单独抽出此工作表可能导致公式变为 #REF!",
    refWarningTitleNamed:
      "引用: {names}。单独抽出此工作表可能导致公式变为 #REF!",
  },
  valuesOnly: {
    label: "丢弃公式，按“值”合并（推荐）",
    hint: "只写出已计算的结果。关闭则保留公式。",
  },
  merge: "下载全部文件",
  mergeShort: "全部保存",
  merging: "正在导出…",
  errors: {
    invalidType: "仅支持 .xlsx",
    tooManyFiles: "最多只能加载 5 个文件",
    readFailed: "无法读取文件",
    noSheets: "没有可合并的工作表",
    exportFailed: "无法生成合并文件",
  },
  messages: {
    loaded: "已读取 {count} 个工作表",
    exported: "已导出 {count} 个工作表并开始下载",
    exportedZip: "已将 {files} 个文件（{sheets} 个工作表）保存为 ZIP",
  },
};

export const excelMergerZhTW: ExcelMergerDict = {
  shell: {
    title: "工作表合併",
    description: "每個檔案一欄。拖曳工作表即可重排，或合併到另一檔案。",
  },
  drop: {
    hint: "將 .xlsx 拖放到這裡（最多 5 個檔案）",
    sub: "也可以點選來選擇檔案。檔案只在本機處理。",
    reading: "讀取中…",
    full: "最多 5 個檔案。請先清除再新增。",
  },
  list: {
    heading: "檔案看板",
    hint: "同一欄內可重排；拖到另一欄即移動到該檔案。點 × 可排除。",
    empty: "還沒有檔案。請把 .xlsx 放到上方區域。",
    count: "{count} 個工作表",
    fileCount: "{count} 個檔案",
    clearAll: "全部清除",
    formattingNote:
      "會保留儲存格的值、公式與合併儲存格。圖表、圖片與部分格式不會帶入。",
  },
  board: {
    emptyColumn: "把工作表拖到這裡",
    downloadColumn: "儲存",
    downloadColumnAria: "下載 {name}",
  },
  card: {
    size: "{rows} 列 × {cols} 欄",
    empty: "空白工作表",
    renamed: "輸出名稱: {name}",
    fromFile: "來自: {name}",
    remove: "從合併對象中移除",
    removeAria: "將 {name} 從合併對象中移除",
    dragAria: "第 {index} 個工作表「{name}」。拖曳可調整順序",
    refWarning: "⚠ 含其他表參照",
    refWarningNames: "⚠ {names}",
    refWarningTitle: "單獨抽出此工作表可能導致公式變成 #REF!",
    refWarningTitleNamed:
      "參照: {names}。單獨抽出此工作表可能導致公式變成 #REF!",
  },
  valuesOnly: {
    label: "捨棄公式，以「值」合併（建議）",
    hint: "只寫出已計算的結果。關閉則保留公式。",
  },
  merge: "下載全部檔案",
  mergeShort: "全部儲存",
  merging: "匯出中…",
  errors: {
    invalidType: "僅支援 .xlsx",
    tooManyFiles: "最多只能載入 5 個檔案",
    readFailed: "無法讀取檔案",
    noSheets: "沒有可合併的工作表",
    exportFailed: "無法產生合併檔案",
  },
  messages: {
    loaded: "已讀取 {count} 個工作表",
    exported: "已匯出 {count} 個工作表並開始下載",
    exportedZip: "已將 {files} 個檔案（{sheets} 個工作表）存成 ZIP",
  },
};

export const excelMergerKo: ExcelMergerDict = {
  shell: {
    title: "시트 결합",
    description:
      "파일마다 열을 만들고, 시트를 드래그해 정리·결합합니다.",
  },
  drop: {
    hint: ".xlsx 파일을 여기에 끌어다 놓으세요 (최대 5개)",
    sub: "클릭해서 파일을 선택할 수도 있습니다. 파일은 이 기기에서만 처리됩니다.",
    reading: "읽는 중…",
    full: "파일은 최대 5개입니다. 지운 뒤에 추가해 주세요.",
  },
  list: {
    heading: "파일 보드",
    hint: "같은 열에서 순서를 바꾸고, 다른 열로 드롭하면 그 파일로 이동합니다. × 로 제외합니다.",
    empty: "아직 파일이 없습니다. 위 영역에 .xlsx 를 놓아 주세요.",
    count: "{count}개 시트",
    fileCount: "{count}개 파일",
    clearAll: "모두 지우기",
    formattingNote:
      "셀 값·수식·병합 셀은 유지됩니다. 차트·이미지·일부 서식은 이어지지 않습니다.",
  },
  board: {
    emptyColumn: "시트를 여기에 놓으세요",
    downloadColumn: "저장",
    downloadColumnAria: "{name} 다운로드",
  },
  card: {
    size: "{rows}행 × {cols}열",
    empty: "빈 시트",
    renamed: "출력 이름: {name}",
    fromFile: "원본: {name}",
    remove: "결합 대상에서 빼기",
    removeAria: "{name}을(를) 결합 대상에서 빼기",
    dragAria: "{index}번째 시트 「{name}」. 드래그해서 순서 변경",
    refWarning: "⚠ 다른 시트 참조",
    refWarningNames: "⚠ {names}",
    refWarningTitle:
      "이 시트만 추출하면 수식이 #REF! 가 될 수 있습니다",
    refWarningTitleNamed:
      "참조: {names}. 이 시트만 추출하면 수식이 #REF! 가 될 수 있습니다",
  },
  valuesOnly: {
    label: "수식을 버리고 값으로 결합（권장）",
    hint: "계산된 결과만 씁니다. 끄면 수식을 그대로 유지합니다.",
  },
  merge: "모든 파일 다운로드",
  mergeShort: "모두 저장",
  merging: "내보내는 중…",
  errors: {
    invalidType: ".xlsx 만 지원합니다",
    tooManyFiles: "파일은 최대 5개까지입니다",
    readFailed: "파일을 읽을 수 없습니다",
    noSheets: "결합할 시트가 없습니다",
    exportFailed: "결합 파일을 만들지 못했습니다",
  },
  messages: {
    loaded: "{count}개 시트를 읽었습니다",
    exported: "{count}개 시트를 내보내 다운로드했습니다",
    exportedZip: "{files}개 파일({sheets}개 시트)을 ZIP으로 저장했습니다",
  },
};

export const excelMergerEs: ExcelMergerDict = {
  shell: {
    title: "Combinar hojas",
    description:
      "Una columna por archivo. Arrastra hojas para reordenar o fusionarlas en otro libro.",
  },
  drop: {
    hint: "Suelta aquí archivos .xlsx (hasta 5)",
    sub: "También puedes hacer clic para elegirlos. Todo se procesa en este dispositivo.",
    reading: "Leyendo…",
    full: "Ya hay 5 archivos. Borra uno antes de añadir más.",
  },
  list: {
    heading: "Tablero de archivos",
    hint: "Reordena en la misma columna, o suelta en otra para mover la hoja. Pulsa × para excluirla.",
    empty: "Aún no hay archivos. Suelta .xlsx en el área de arriba.",
    count: "{count} hojas",
    fileCount: "{count} archivos",
    clearAll: "Borrar todo",
    formattingNote:
      "Se conservan valores, fórmulas y celdas combinadas. Gráficos, imágenes y parte del formato no se copian.",
  },
  board: {
    emptyColumn: "Suelta una hoja aquí",
    downloadColumn: "Guardar",
    downloadColumnAria: "Descargar {name}",
  },
  card: {
    size: "{rows} filas × {cols} cols",
    empty: "Hoja vacía",
    renamed: "Nombre de salida: {name}",
    fromFile: "De: {name}",
    remove: "Quitar de la fusión",
    removeAria: "Quitar {name} de la fusión",
    dragAria: "Hoja {index}: {name}. Arrastra para reordenar",
    refWarning: "⚠ Refs. a otras hojas",
    refWarningNames: "⚠ {names}",
    refWarningTitle:
      "Extraer solo esta hoja puede romper las fórmulas (#REF!)",
    refWarningTitleNamed:
      "Refs.: {names}. Extraer solo esta hoja puede romper las fórmulas (#REF!)",
  },
  valuesOnly: {
    label: "Descartar fórmulas y combinar como valores (recomendado)",
    hint: "Escribe solo los resultados calculados. Desactívelo para conservar las fórmulas.",
  },
  merge: "Descargar todos los archivos",
  mergeShort: "Guardar todo",
  merging: "Exportando…",
  errors: {
    invalidType: "Solo se admiten archivos .xlsx",
    tooManyFiles: "Puedes cargar hasta 5 archivos",
    readFailed: "No se pudo leer el archivo",
    noSheets: "No hay hojas para combinar",
    exportFailed: "No se pudo crear el archivo combinado",
  },
  messages: {
    loaded: "Se cargaron {count} hojas",
    exported: "Se exportaron {count} hojas y se descargó el archivo",
    exportedZip: "Se guardaron {files} archivos ({sheets} hojas) en un ZIP",
  },
};

export const excelMergerFr: ExcelMergerDict = {
  shell: {
    title: "Fusion de feuilles",
    description:
      "Une colonne par fichier. Glissez les feuilles pour réordonner ou les fusionner dans un autre classeur.",
  },
  drop: {
    hint: "Déposez des fichiers .xlsx ici (5 maximum)",
    sub: "Vous pouvez aussi cliquer pour les choisir. Tout est traité sur cet appareil.",
    reading: "Lecture…",
    full: "Vous avez déjà 5 fichiers. Effacez-en un avant d’en ajouter.",
  },
  list: {
    heading: "Tableau des fichiers",
    hint: "Réordonnez dans une colonne, ou déposez dans une autre pour déplacer la feuille. Appuyez sur × pour l’exclure.",
    empty: "Pas encore de fichiers. Déposez des .xlsx dans la zone du haut.",
    count: "{count} feuilles",
    fileCount: "{count} fichiers",
    clearAll: "Tout effacer",
    formattingNote:
      "Les valeurs, formules et cellules fusionnées sont conservées. Graphiques, images et une partie de la mise en forme ne le sont pas.",
  },
  board: {
    emptyColumn: "Déposez une feuille ici",
    downloadColumn: "Enregistrer",
    downloadColumnAria: "Télécharger {name}",
  },
  card: {
    size: "{rows} lig. × {cols} col.",
    empty: "Feuille vide",
    renamed: "Nom de sortie : {name}",
    fromFile: "De : {name}",
    remove: "Retirer de la fusion",
    removeAria: "Retirer {name} de la fusion",
    dragAria: "Feuille {index} : {name}. Glisser pour réordonner",
    refWarning: "⚠ Réfs. autres feuilles",
    refWarningNames: "⚠ {names}",
    refWarningTitle:
      "Extraire cette feuille seule peut casser les formules (#REF!)",
    refWarningTitleNamed:
      "Réfs. : {names}. Extraire cette feuille seule peut casser les formules (#REF!)",
  },
  valuesOnly: {
    label: "Ignorer les formules et fusionner en valeurs (recommandé)",
    hint: "N’écrit que les résultats calculés. Désactivez pour conserver les formules.",
  },
  merge: "Télécharger tous les fichiers",
  mergeShort: "Tout enregistrer",
  merging: "Export…",
  errors: {
    invalidType: "Seuls les fichiers .xlsx sont pris en charge",
    tooManyFiles: "Vous pouvez charger jusqu’à 5 fichiers",
    readFailed: "Impossible de lire le fichier",
    noSheets: "Aucune feuille à fusionner",
    exportFailed: "Échec de la création du fichier fusionné",
  },
  messages: {
    loaded: "{count} feuilles chargées",
    exported: "{count} feuilles exportées et fichier téléchargé",
    exportedZip: "{files} fichiers ({sheets} feuilles) enregistrés en ZIP",
  },
};

export const excelMergerDe: ExcelMergerDict = {
  shell: {
    title: "Blätter zusammenführen",
    description:
      "Eine Spalte pro Datei. Blätter ziehen zum Umsortieren oder in eine andere Mappe verschieben.",
  },
  drop: {
    hint: ".xlsx-Dateien hierher ziehen (max. 5)",
    sub: "Sie können auch klicken, um Dateien zu wählen. Alles bleibt auf diesem Gerät.",
    reading: "Wird gelesen…",
    full: "Es sind bereits 5 Dateien da. Löschen Sie eine, bevor Sie weitere hinzufügen.",
  },
  list: {
    heading: "Datei-Board",
    hint: "In derselben Spalte umsortieren oder auf eine andere Spalte ziehen, um das Blatt zu verschieben. × zum Entfernen.",
    empty: "Noch keine Dateien. Legen Sie .xlsx in den Bereich oben.",
    count: "{count} Blätter",
    fileCount: "{count} Dateien",
    clearAll: "Alles löschen",
    formattingNote:
      "Werte, Formeln und verbundene Zellen bleiben erhalten. Diagramme, Bilder und ein Teil der Formatierung nicht.",
  },
  board: {
    emptyColumn: "Blatt hierher ziehen",
    downloadColumn: "Speichern",
    downloadColumnAria: "{name} herunterladen",
  },
  card: {
    size: "{rows} Zeilen × {cols} Spalten",
    empty: "Leeres Blatt",
    renamed: "Ausgabename: {name}",
    fromFile: "Aus: {name}",
    remove: "Aus der Zusammenführung nehmen",
    removeAria: "{name} aus der Zusammenführung nehmen",
    dragAria: "Blatt {index}: {name}. Ziehen zum Umsortieren",
    refWarning: "⚠ Blattübergreifende Bezüge",
    refWarningNames: "⚠ {names}",
    refWarningTitle:
      "Dieses Blatt allein zu extrahieren kann Formeln zerstören (#REF!)",
    refWarningTitleNamed:
      "Bezüge: {names}. Dieses Blatt allein zu extrahieren kann Formeln zerstören (#REF!)",
  },
  valuesOnly: {
    label: "Formeln verwerfen und als Werte zusammenführen (empfohlen)",
    hint: "Schreibt nur berechnete Ergebnisse. Aus = Formeln behalten.",
  },
  merge: "Alle Dateien herunterladen",
  mergeShort: "Alles speichern",
  merging: "Wird exportiert…",
  errors: {
    invalidType: "Nur .xlsx-Dateien werden unterstützt",
    tooManyFiles: "Sie können bis zu 5 Dateien laden",
    readFailed: "Datei konnte nicht gelesen werden",
    noSheets: "Keine Blätter zum Zusammenführen",
    exportFailed: "Die zusammengeführte Datei konnte nicht erstellt werden",
  },
  messages: {
    loaded: "{count} Blätter geladen",
    exported: "{count} Blätter exportiert und heruntergeladen",
    exportedZip: "{files} Dateien ({sheets} Blätter) als ZIP gespeichert",
  },
};

export const excelMergerPt: ExcelMergerDict = {
  shell: {
    title: "Mesclar planilhas",
    description:
      "Uma coluna por arquivo. Arraste abas para reordenar ou mesclar em outra planilha.",
  },
  drop: {
    hint: "Solte arquivos .xlsx aqui (até 5)",
    sub: "Você também pode clicar para escolher. Tudo é processado neste dispositivo.",
    reading: "Lendo…",
    full: "Já há 5 arquivos. Limpe um antes de adicionar mais.",
  },
  list: {
    heading: "Quadro de arquivos",
    hint: "Reordene na mesma coluna, ou solte em outra para mover a aba. Toque em × para excluir.",
    empty: "Ainda não há arquivos. Solte .xlsx na área acima.",
    count: "{count} planilhas",
    fileCount: "{count} arquivos",
    clearAll: "Limpar tudo",
    formattingNote:
      "Valores, fórmulas e células mescladas são mantidos. Gráficos, imagens e parte da formatação não.",
  },
  board: {
    emptyColumn: "Solte uma aba aqui",
    downloadColumn: "Salvar",
    downloadColumnAria: "Baixar {name}",
  },
  card: {
    size: "{rows} lin. × {cols} col.",
    empty: "Planilha vazia",
    renamed: "Nome de saída: {name}",
    fromFile: "De: {name}",
    remove: "Remover da mesclagem",
    removeAria: "Remover {name} da mesclagem",
    dragAria: "Planilha {index}: {name}. Arraste para reordenar",
    refWarning: "⚠ Refs. a outras abas",
    refWarningNames: "⚠ {names}",
    refWarningTitle:
      "Extrair só esta planilha pode quebrar fórmulas (#REF!)",
    refWarningTitleNamed:
      "Refs.: {names}. Extrair só esta planilha pode quebrar fórmulas (#REF!)",
  },
  valuesOnly: {
    label: "Descartar fórmulas e mesclar como valores (recomendado)",
    hint: "Grava só os resultados calculados. Desligue para manter as fórmulas.",
  },
  merge: "Baixar todos os arquivos",
  mergeShort: "Salvar tudo",
  merging: "Exportando…",
  errors: {
    invalidType: "Somente arquivos .xlsx são suportados",
    tooManyFiles: "Você pode carregar no máximo 5 arquivos",
    readFailed: "Não foi possível ler o arquivo",
    noSheets: "Não há planilhas para mesclar",
    exportFailed: "Falha ao criar o arquivo mesclado",
  },
  messages: {
    loaded: "{count} planilhas carregadas",
    exported: "{count} planilhas exportadas e arquivo baixado",
    exportedZip: "{files} arquivos ({sheets} planilhas) salvos em ZIP",
  },
};
