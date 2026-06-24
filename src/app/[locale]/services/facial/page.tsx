import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { serviceMediaManifest } from "@/lib/service-media-manifest";

const facialGroups = [
  { slug: "fullface", label: { en: "Full Face", fa: "تمام صورت", ar: "الوجه الكامل" } },
  { slug: "botox", label: { en: "Botox", fa: "بوتاکس", ar: "بوتوكس" } },
  { slug: "smile-line", label: { en: "Smile Line", fa: "خط لبخند", ar: "خط الابتسامة" } },
  { slug: "face-angle", label: { en: "Face Angle", fa: "زاویه صورت", ar: "زاوية الوجه" } },
  { slug: "cheek", label: { en: "Cheek", fa: "گونه", ar: "الخد" } },
  { slug: "cheek-chin", label: { en: "Cheek & Chin", fa: "گونه و چانه", ar: "الخد والذقن" } },
  { slug: "lip", label: { en: "Lip", fa: "لب", ar: "الشفاه" } },
  { slug: "nose", label: { en: "Nose", fa: "بینی", ar: "الأنف" } },
  { slug: "chin-before-after", label: { en: "Chin Before & After", fa: "چانه قبل و بعد", ar: "الذقن قبل وبعد" } },
  { slug: "silhouette-thread", label: { en: "Silhouette Thread", fa: "نخ سیلوئت", ar: "خيط السيلويت" } },
] as const;

type Props = { params: Promise<{ locale: string }> };

export default async function FacialServicesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const localeCode = locale as Locale;

  const pageTitle = localeCode === "fa" ? "زیبایی صورت" : localeCode === "ar" ? "جماليات الوجه" : "Face Aesthetics";
  const categoryLabel = localeCode === "fa" ? "فیشال" : localeCode === "ar" ? "فيشال" : "FACIAL";
  const imagesText = localeCode === "fa" ? "تصویر در گالری" : localeCode === "ar" ? "صورة في المعرض" : "image(s) in the reusable gallery";

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="bg-clinic-teal px-4 py-14 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.35em] text-white/80">{categoryLabel}</p>
          <h1 className="mt-3 text-3xl font-bold lg:text-5xl">{pageTitle}</h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-2 lg:px-8">
        {facialGroups.map((group) => (
          <Link key={group.slug} href={`/${localeCode}/services/facial/${group.slug}`} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-clinic-teal-dark">{categoryLabel}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{group.label[localeCode]}</h2>
            <p className="mt-3 text-sm text-slate-500">{(serviceMediaManifest.facial[group.slug as keyof typeof serviceMediaManifest.facial] ?? []).length} {imagesText}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
