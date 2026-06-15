import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BookingSuccessPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);

  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center lg:px-8">
      <h1 className="text-3xl font-bold text-emerald-700">{dict.pages.bookingTitle}</h1>
      <p className="mt-4 text-slate-700">{dict.auth.registerSuccess}</p>
      <a
        href={`/${localeCode}/patient`}
        className="mt-8 inline-flex rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white"
      >
        {dict.auth.openPatientPanel}
      </a>
    </main>
  );
}
