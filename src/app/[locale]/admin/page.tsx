import { notFound } from "next/navigation";
import { DoctorDashboardPanel } from "@/components/doctor-dashboard-panel";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">{dict.dashboard.adminTitle}</h1>
      <p className="mt-3 text-sm text-slate-600">{dict.dashboard.adminSubtitle}</p>
      <DoctorDashboardPanel dict={dict} locale={localeCode} />
    </main>
  );
}
