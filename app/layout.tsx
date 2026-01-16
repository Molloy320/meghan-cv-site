import "./globals.css";
import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Meghan Molloy",
  description: "Portfolio + AI chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <Header />
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
