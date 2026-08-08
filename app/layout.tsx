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
      <body className={fraunces.variable}>
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
