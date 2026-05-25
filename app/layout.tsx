import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Termômetro 0→1 · DRUM",
  description:
    "Uma conversa curta de voz pra entender em que ponto você está na sua carreira.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="px-6 sm:px-10 py-5 flex items-center justify-between">
          <a
            href="/"
            className="font-display text-xl tracking-tight text-foreground"
          >
            DRUM
          </a>
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            Termômetro 0→1
          </span>
        </header>
        {children}
        <footer className="px-6 sm:px-10 py-6 text-xs text-muted flex flex-col sm:flex-row gap-2 sm:justify-between">
          <span>© DRUM · feito com cuidado</span>
          <span>
            Sua conversa é processada por IA. Não compartilhamos com terceiros.
          </span>
        </footer>
      </body>
    </html>
  );
}
