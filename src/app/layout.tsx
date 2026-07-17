import type { Metadata } from "next";
import "@fontsource/open-sauce-one";
import "@fontsource/open-sauce-one/700.css";
import "@fontsource/open-sauce-one/800.css";
import "@fontsource/open-sauce-one/900.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jernih Creatif",
  description: "Marketplace modern untuk produk, jasa, dan sewa peralatan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[#f8f9fa] text-[#191c1d]">
        {children}
      </body>
    </html>
  );
}
