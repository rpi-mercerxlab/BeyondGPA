import type { Metadata } from "next";
import "./globals.css";
import { Source_Sans_3 } from "next/font/google";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans", // if you want to use in Tailwind
});

export const metadata: Metadata = {
  title: "BeyondGPA",
  description:
    "A platform connecting students with professors for research opportunities. Coming soon!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased bg-bg-base-100 flex flex-col items-start justify-start min-h-screen text-text-base ${sourceSans.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
