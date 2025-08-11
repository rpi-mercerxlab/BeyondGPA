import type { Metadata } from "next";
import "./globals.css";

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
        className={` antialiased bg-bg-base`}
      >
        {children}
      </body>
    </html>
  );
}
