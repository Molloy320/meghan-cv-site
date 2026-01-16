import "./globals.css";
import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";


export const metadata: Metadata = {
  title: "Meghan Molloy",
  description: "Portfolio and AI chat experience for Meghan Molloy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
