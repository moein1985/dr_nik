import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "کلینیک زیبایی دکتر نیک",
  description: "سامانه نوبت دهی و مدیریت کلینیک زیبایی دکتر نیک",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* Vazirmatn — GDPR-safe Google Fonts mirror (no build-time download) */}
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          rel="stylesheet"
          href="https://fonts.bunny.net/css?family=vazirmatn:300,400,500,700&display=swap"
        />
      </head>
      <body>
        <ErrorBoundary locale="fa">{children}</ErrorBoundary>
      </body>
    </html>
  );
}
