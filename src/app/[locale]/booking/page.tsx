import { notFound } from "next/navigation";
import { BookingAuthPanel } from "@/components/booking-auth-panel";
import { getDictionary } from "@/i18n/dictionary";
import { isLocale, type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BookingPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">{dict.pages.bookingTitle}</h1>
      <p className="mt-4 max-w-3xl text-slate-700">{dict.pages.bookingText}</p>
      <BookingAuthPanel dict={dict} locale={localeCode} />
    </main>
  );
}
