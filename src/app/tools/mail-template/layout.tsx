import ViewportLock from "./ViewportLock";

export default function MailTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ViewportLock>{children}</ViewportLock>;
}
