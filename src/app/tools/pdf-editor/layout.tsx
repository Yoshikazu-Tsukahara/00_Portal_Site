import ViewportLock from "./ViewportLock";

/** PDF編集: 1画面完結のためビューポートを固定 */
export default function PdfEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ViewportLock>{children}</ViewportLock>;
}
