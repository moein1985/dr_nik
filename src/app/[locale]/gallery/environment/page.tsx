import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { clinicImages } from "@/lib/clinic-image-manifest";

export const dynamic = "force-static";

type Props = { params: Promise<{ locale: string }> };

const environmentImages = clinicImages.gallery.environment;

export default async function GalleryEnvironmentPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);

  return (
    <main className="bg-white text-slate-900">
      <section className="bg-clinic-teal px-4 py-14 text-white lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-clinic-teal-light">{dict.pages.galleryCategories[0]}</p>
          <h1 className="mt-3 text-3xl font-bold lg:text-5xl">{dict.pages.galleryCategories[0]}</h1>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {environmentImages.map((src, index) => (
            <article key={src} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[4/5]">
                <Image src={src} alt={`${dict.pages.galleryCategories[0]} ${index + 1}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
