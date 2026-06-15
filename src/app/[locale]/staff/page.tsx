import { notFound } from "next/navigation";
import { StaffDashboardPanel } from "@/components/staff-dashboard-panel";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function StaffPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">{dict.dashboard.staffTitle}</h1>
      <p className="mt-3 text-sm text-slate-600">{dict.dashboard.staffSubtitle}</p>
      <StaffDashboardPanel dict={dict} locale={localeCode} />
    </main>
  );
}
