import { notFound } from "next/navigation";
import Image from "next/image";
import type { Media } from "@prisma/client";
import { getDictionary } from "@/i18n/dictionary";
import { isLocale, type Locale } from "@/i18n/config";
import { clinicImages } from "@/lib/clinic-image-manifest";
import { prisma } from "@/server/shared/prisma-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);

  let approvedMedia: Media[] = [];
  // Only query database if DATABASE_URL is set (not during build)
  if (process.env.DATABASE_URL) {
    try {
      approvedMedia = await prisma.media.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.warn("Gallery media query failed, falling back to an empty gallery state.", error);
    }
  }

  return (
    <main>
      {/* Page hero */}
      <div className="bg-clinic-teal px-4 py-16 text-center text-white lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold lg:text-5xl">{dict.pages.galleryTitle}</h1>
          <p className="mt-4 text-base text-white/80">{dict.pages.galleryText}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
        {/* Disclaimer */}
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-700 ring-1 ring-amber-200">
          {dict.pages.galleryDisclaimer}
        </p>

        {/* Real Gallery Items Section */}
        <section className="py-10">
          <h2 className="mb-6 text-2xl font-bold text-clinic-teal">
            {dict.gallery.patientOutcomes}
          </h2>

          {approvedMedia.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
              <span className="text-4xl opacity-50 block mb-3">🖼️</span>
              <p className="text-slate-500 font-medium text-sm">
                {dict.gallery.noApprovedPhotos}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {approvedMedia.map((media) => (
                <article
                  key={media.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-100">
                    <Image
                      src={media.url}
                      alt={media.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{media.title}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 inline-block bg-slate-100 px-2 py-0.5 rounded-md">
                      {media.category}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Category grid */}
        <section className="py-6 border-t border-slate-100">
          <h2 className="mb-6 text-2xl font-bold text-clinic-teal">
            {dict.pages.galleryCategoriesTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: dict.pages.galleryCategories[0], href: `/${localeCode}/gallery/environment`, image: clinicImages.gallery.categories.environment, alt: dict.gallery.clinicEnvironment },
              { label: dict.pages.galleryCategories[1], href: `/${localeCode}/services`, image: clinicImages.gallery.categories.beforeAfter, alt: dict.gallery.beforeAfter },
              { label: dict.pages.galleryCategories[2], href: `/${localeCode}/gallery/equipment`, image: clinicImages.gallery.categories.equipment, alt: dict.gallery.equipment },
              { label: dict.pages.galleryCategories[3], href: `/${localeCode}/gallery/team`, image: clinicImages.gallery.categories.team, alt: dict.gallery.medicalTeam },
            ].map((item) => (
              <a key={item.label} href={item.href} className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
                <article>
                  <div className="relative aspect-[4/5] bg-slate-100">
                    <Image src={item.image} alt={item.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <p className="border-t border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700">{item.label}</p>
                </article>
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* Booking CTA */}
      <section className="bg-clinic-teal px-4 py-14 text-center text-white lg:px-8">
        <p className="text-2xl font-bold lg:text-4xl">{dict.home.finalCtaTitle}</p>
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
