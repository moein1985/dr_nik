import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChatLeadWidget } from "@/components/chat-lead-widget";
import { ClinicJsonLd } from "@/components/clinic-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, localeInfo, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);
  const baseUrl = "http://localhost:3001";

  return {
    title: dict.brand.name,
    description: dict.brand.tagline,
    alternates: {
      canonical: `/${localeCode}`,
      languages: {
        fa: `${baseUrl}/fa`,
        en: `${baseUrl}/en`,
        ar: `${baseUrl}/ar`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);
  const dir = localeInfo[localeCode].dir;

  return (
    <html lang={localeCode} dir={dir}>
      <body>
        <div data-locale={localeCode} className="min-h-screen bg-slate-50 text-slate-900">
          <ClinicJsonLd locale={localeCode} dict={dict} />
          <SiteHeader locale={localeCode} dict={dict} />
          {children}
          <SiteFooter dict={dict} locale={localeCode} />
          <ChatLeadWidget dict={dict} />
        </div>
      </body>
    </html>
  );
}
