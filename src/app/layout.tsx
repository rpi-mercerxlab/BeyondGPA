import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/common/footer";
import Header from "@/components/common/header/header";

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
        className={` antialiased bg-bg-base flex flex-col items-start justify-start min-h-screen text-text-base`}
      >
        {children}
      </body>
    </html>
  );
}
