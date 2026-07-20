/**
 * Excel / CSV から「最初にデータがある列」の値を抽出する。
 * ※ クライアント側でのみ使用（xlsx はブラウザで動作）。
 */
export async function extractColumnValuesFromFile(
  file: File,
): Promise<string[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
    sheet,
    {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false,
    },
  );

  if (rows.length === 0) return [];

  const maxCols = Math.max(...rows.map((row) => row.length), 0);
  let colIndex = 0;

  // A列を優先し、空ならデータが入っている最初の列を探す
  for (let c = 0; c < maxCols; c++) {
    const hasData = rows.some((row) => {
      const value = row[c];
      return value !== undefined && value !== null && String(value).trim() !== "";
    });
    if (hasData) {
      colIndex = c;
      break;
    }
  }

  return rows
    .map((row) => String(row[colIndex] ?? "").trim())
    .filter((value) => value.length > 0);
}
