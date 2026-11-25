import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TimAI Edu — ҰБТ-ға дайындалудың жаңа деңгейі",
  description:
    "Информатика пәнін жүйелі меңгер, біліміңді тексер және ҰБТ-ға сенімді дайындал.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kk" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
