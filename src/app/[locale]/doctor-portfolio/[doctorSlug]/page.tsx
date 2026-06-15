import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { optimizedAssetPath } from "@/lib/asset-path";
import { clinicImages } from "@/lib/clinic-image-manifest";
import { getDoctorPortfolioBySlug } from "@/lib/doctor-portfolio-map";
import { prisma } from "@/server/shared/prisma-client";

type Props = {
  params: Promise<{ locale: string; doctorSlug: string }>;
};

const fallbackDoctorVideos = [
  {
    title: "Clinic Intro & Aesthetic Workflow",
    url: "/home/hero-intro.mp4",
    coverImage: clinicImages.home.results,
  },
  {
    title: "Treatment Results & Patient Experience",
    url: "/home/hero-reverse.mp4",
    coverImage: clinicImages.gallery.environment[0],
  },
] as const;

export default async function DoctorPortfolioPage({ params }: Props) {
  const { locale, doctorSlug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);
  const portfolio = getDoctorPortfolioBySlug(doctorSlug, localeCode);
  const doctorVideos = portfolio
    ? await prisma.video.findMany({
        where: { doctorSlug: portfolio.slug },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const approvedMedia = await prisma.media.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  const visibleVideos = doctorVideos.length > 0 ? doctorVideos : fallbackDoctorVideos;

  if (!portfolio) {
    notFound();
  }

  return (
    <main>
      {/* Mini hero */}
      <div className="bg-clinic-teal px-4 py-14 text-center text-white lg:px-8">
        <h1 className="text-3xl font-bold lg:text-5xl">{portfolio.title}</h1>
        <p className="mt-4 text-base text-white/80">{portfolio.name}</p>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="relative h-64 sm:h-96 w-full">
            <Image
              src={portfolio.coverImage}
              alt={portfolio.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 800px, 100vw"
              priority
            />
          </div>
          <div className="p-8 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">{dict.pages.portfolioTitle}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl">{portfolio.name}</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">{portfolio.description}</p>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {portfolio.highlights.map((item) => (
                <article key={item} className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm text-slate-700 shadow-sm">
                  {item}
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`/${localeCode}/booking`}
                className="inline-flex rounded-full bg-clinic-teal-mid px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-clinic-teal-dark"
              >
                {portfolio.ctaLabel}
              </a>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">{dict.nav.booking}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {localeCode === "en" ? "Real Results Gallery" : localeCode === "ar" ? "معرض النتائج الحقيقية" : "گالری نتایج واقعی"}
          </h2>
          {approvedMedia.length === 0 ? (
            <p className="text-sm text-slate-500">{localeCode === "en" ? "Approved clinic photos will appear here as soon as staff publishes them." : localeCode === "ar" ? "ستظهر الصور المعتمدة هنا بمجرد نشرها من قبل الفريق." : "تصاویر تاییدشده بعد از انتشار توسط تیم در اینجا نمایش داده می‌شود."}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {approvedMedia.map((media) => (
                <article key={media.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative aspect-[4/3] w-full">
                    <Image src={media.url} alt={media.title} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 50vw" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-800">{media.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{media.category}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Video Portfolio Section */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {localeCode === "en" ? "Video Portfolio" : localeCode === "ar" ? "سجل أعمال الفيديو" : "ویدیوهای نمونه کار"}
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleVideos.map((video, index) => {
              const previewImage = typeof video.coverImage === "string" && video.coverImage.trim().length > 0
                ? optimizedAssetPath(video.coverImage)
                : clinicImages.placeholder;

              return (
              <article key={video.title + index} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative aspect-video w-full bg-slate-900/10">
                  <Image src={previewImage} alt={video.title} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">{localeCode === "en" ? "Preview" : localeCode === "ar" ? "معاينة" : "پیش‌نمایش"}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-800">{video.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{portfolio.name}</p>
                  <a href={video.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-semibold text-cyan-700 hover:text-cyan-800">{localeCode === "en" ? "Open video" : localeCode === "ar" ? "فتح الفيديو" : "مشاهده ویدیو"}</a>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
