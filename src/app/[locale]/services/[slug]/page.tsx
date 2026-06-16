import { notFound, redirect } from "next/navigation";
import { getServiceBySlug, getServicesForLocale } from "@/app/[locale]/services/service-content";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getServicesForLocale(locale).map((service) => ({
      locale,
      slug: service.slug,
    })),
  );
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);

  if (slug === "facial" || slug === "face") {
    redirect(`/${localeCode}/services/facial`);
  }

  if (slug === "dental") {
    redirect(`/${localeCode}/services/dental`);
  }

  if (slug === "skin-rejuvenation") {
    redirect(`/${localeCode}/services/skin-rejuvenation`);
  }

  if (slug === "body-contouring") {
    redirect(`/${localeCode}/services/body-contouring`);
  }

  const service = getServiceBySlug(localeCode, slug);

  if (!service) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <p className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
          {dict.pages.serviceNotFound}
        </p>
      </main>
    );
  }

  return (
    <main>
      {/* Mini hero */}
      <div className="bg-clinic-teal px-4 py-14 text-center text-white lg:px-8">
        <h1 className="text-3xl font-bold lg:text-5xl">{service.title}</h1>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <p className="text-base leading-9 text-slate-700">{service.details}</p>
        <a
          href={`/${localeCode}/booking`}
          className="mt-8 inline-flex rounded-full bg-clinic-teal-mid px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-clinic-teal-dark"
        >
          {dict.nav.booking}
        </a>
      </div>
    </main>
  );
}
