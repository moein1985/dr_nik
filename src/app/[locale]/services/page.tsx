import Image from "next/image";
import { notFound } from "next/navigation";
import { getServicesForLocale } from "@/app/[locale]/services/service-content";
import { getDictionary } from "@/i18n/dictionary";
import { isLocale, type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);
  const services = getServicesForLocale(localeCode);

  return (
    <main>
      {/* Page hero */}
      <div className="bg-clinic-teal px-4 py-16 text-center text-white lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold lg:text-5xl">{dict.pages.servicesTitle}</h1>
          <p className="mt-4 text-base text-white/80">{dict.pages.servicesText}</p>
        </div>
      </div>

      {/* 4 main service category cards */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.servicePillars.items.map((item) => (
            <a
              key={item.id}
              href={`/${localeCode}${item.href}`}
              className="group relative overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 p-5 text-white">
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p className="mt-1 text-xs leading-5 text-white/80">{item.desc}</p>
                <span className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  {dict.home.servicePillars.ctaLabel}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Popular treatments list */}
      <section className="bg-white px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-clinic-teal">{dict.home.servicesTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.slug}
                className="flex flex-col rounded-2xl bg-[#f3f5f6] p-6 ring-1 ring-slate-200"
              >
                <h3 className="text-lg font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">
                  {service.shortDescription}
                </p>
                <a
                  href={`/${localeCode}/services/${service.slug}`}
                  className="mt-5 self-start rounded-full bg-clinic-teal-mid px-4 py-2 text-xs font-semibold text-white transition hover:bg-clinic-teal-dark"
                >
                  {dict.pages.viewDetails}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="bg-clinic-teal px-4 py-14 text-center text-white lg:px-8">
        <h3 className="text-2xl font-bold lg:text-4xl">{dict.home.finalCtaTitle}</h3>
        <a
          href={`/${localeCode}/booking`}
          className="mt-6 inline-flex rounded-full bg-white px-8 py-3 text-base font-bold text-clinic-teal shadow-md transition hover:bg-clinic-teal-light hover:text-clinic-teal-dark"
        >
          {dict.nav.booking}
        </a>
      </section>
    </main>
  );
}
