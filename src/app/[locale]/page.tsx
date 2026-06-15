import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { HomeLanding } from "@/components/home-landing";

type LocalePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocalizedHomePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);

  return <HomeLanding locale={localeCode} dict={dict} />;
}
