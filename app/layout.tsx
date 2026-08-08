import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Fraunces } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import { CurrencyProvider } from "./components/CurrencyContext";
import { AuthProvider } from "./components/AuthContext";
import { ToastProvider } from "./components/ToastContext";
import AppShell from "./components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SpendWise",
  description: "Track personal expenses and split costs with friends.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400;1,9..144,700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          .font-serif, h1, h2, h3, h4 {
            font-family: 'Fraunces', Georgia, serif !important;
          }
          body, .font-sans {
            font-family: var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif !important;
          }
        `}} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <CurrencyProvider>
              <ToastProvider>
                <AppShell>{children}</AppShell>
              </ToastProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
