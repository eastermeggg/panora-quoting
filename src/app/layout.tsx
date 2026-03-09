import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panora - Assistant Cotation",
  description: "Assistant de cotation automatisée sur extranets assureurs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
