import { notFound } from "next/navigation";
import { PatientCarouselGrid } from "@/components/sliders/patient-carousel-grid";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { serviceMediaManifest } from "@/lib/service-media-manifest";

type Props = { params: Promise<{ locale: string }> };

export default async function DentalScalingPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);
  const items = serviceMediaManifest.dental.scaling.map((images, index) => ({
    title: `${dict.pages.dentalPatientLabel} ${index + 1}`,
    images,
  }));

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="bg-clinic-teal px-4 py-14 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.35em] text-white/80">{dict.pages.dentalCategory}</p>
          <h1 className="mt-3 text-3xl font-bold lg:text-5xl">{dict.pages.dentalScalingTitle}</h1>
          <p className="mt-4 max-w-3xl text-base text-white/80">{dict.pages.dentalScalingSubtitle}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <PatientCarouselGrid items={items} />
      </section>
    </main>
  );
}
