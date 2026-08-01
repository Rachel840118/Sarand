import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHARAND JINHWA SEOUL | High Jewelry",
  description: "SHARAND JINHWA SEOUL — high jewelry shaped by Seoul's quiet architecture.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
