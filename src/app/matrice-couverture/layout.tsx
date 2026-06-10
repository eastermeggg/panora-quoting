export default function MatriceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Standalone product page — no sidebar / app chrome.
  return <>{children}</>;
}
