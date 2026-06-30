import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

type Props = { params: Promise<{ locale: string }> };

export default async function DentalServicesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);

  const sections = [
    { slug: "implants", title: dict.pages.dentalImplantsTitle, desc: dict.pages.dentalImplantsDesc },
    { slug: "bleaching", title: dict.pages.dentalBleachingTitle, desc: dict.pages.dentalBleachingDesc },
    { slug: "scaling", title: dict.pages.dentalScalingTitle, desc: dict.pages.dentalScalingDesc },
    { slug: "composite", title: dict.pages.dentalCompositeTitle, desc: dict.pages.dentalCompositeDesc },
    { slug: "laminate", title: dict.pages.dentalLaminateTitle, desc: dict.pages.dentalLaminateDesc },
  ];

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="bg-clinic-teal px-4 py-14 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.35em] text-white/80">{dict.nav.services}</p>
          <h1 className="mt-3 text-3xl font-bold lg:text-5xl">{dict.pages.dentalTitle}</h1>
          <p className="mt-4 max-w-3xl text-base text-white/80">{dict.pages.dentalSubtitle}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-2 lg:px-8">
        {sections.map((section) => (
          <Link key={section.slug} href={`/${localeCode}/services/dental/${section.slug}` as import("next").Route} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-clinic-teal-dark">{dict.pages.dentalCategory}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{section.desc}</p>
            <span className="mt-5 inline-flex rounded-full bg-clinic-teal-mid px-4 py-2 text-xs font-semibold text-white">{dict.pages.viewDetails}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
