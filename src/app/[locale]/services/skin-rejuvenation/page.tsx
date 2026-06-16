import { notFound } from "next/navigation";
import { PatientCarouselGrid } from "@/components/sliders/patient-carousel-grid";
import { isLocale, type Locale } from "@/i18n/config";
import { serviceMediaManifest } from "@/lib/service-media-manifest";

type Props = { params: Promise<{ locale: string }> };

export default async function SkinRejuvenationPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const localeCode = locale as Locale;
  const items = [
    {
      title: "Cleaning & Anti Spot",
      images: serviceMediaManifest.skinRejuvenation["cleaning-anti-spot"],
    },
    {
      title: "PRP & Hair Filler",
      images: serviceMediaManifest.skinRejuvenation["prp-hair-filler"],
    },
  ];

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="bg-clinic-teal px-4 py-14 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.35em] text-white/80">{localeCode.toUpperCase()}</p>
          <h1 className="mt-3 text-3xl font-bold lg:text-5xl">Skin Rejuvenation</h1>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <PatientCarouselGrid items={items} />
      </section>
    </main>
  );
}
