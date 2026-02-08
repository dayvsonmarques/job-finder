import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { SearchScheduler } from "@/components/layout/SearchScheduler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Work Finder",
  description: "Agregador de vagas de emprego com busca automática",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="max-w-5xl mx-auto p-8">{children}</div>
          </main>
        </div>
        <SearchScheduler />
      </body>
    </html>
  );
}
