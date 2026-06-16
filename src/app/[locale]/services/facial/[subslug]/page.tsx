import { notFound } from "next/navigation";
import { SimpleCarousel } from "@/components/sliders/simple-carousel";
import { isLocale, type Locale } from "@/i18n/config";
import { serviceMediaManifest } from "@/lib/service-media-manifest";

type Props = { params: Promise<{ locale: string; subslug: string }> };

export default async function FacialSubslugPage({ params }: Props) {
  const { locale, subslug } = await params;
  if (!isLocale(locale)) notFound();

  const localeCode = locale as Locale;
  const images = serviceMediaManifest.facial[subslug as keyof typeof serviceMediaManifest.facial] ?? [];

  if (!images.length) notFound();

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="bg-clinic-teal px-4 py-14 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.35em] text-white/80">{localeCode.toUpperCase()}</p>
          <h1 className="mt-3 text-3xl font-bold lg:text-5xl">{subslug}</h1>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <SimpleCarousel images={images} title={`${subslug} gallery`} />
      </section>
    </main>
  );
}
