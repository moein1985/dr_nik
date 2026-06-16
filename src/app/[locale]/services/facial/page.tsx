import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { serviceMediaManifest } from "@/lib/service-media-manifest";

const facialGroups = [
  { slug: "fullface", label: "Full Face" },
  { slug: "botox", label: "Botox" },
  { slug: "smile-line", label: "Smile Line" },
  { slug: "face-angle", label: "Face Angle" },
  { slug: "cheek", label: "Cheek" },
  { slug: "cheek-chin", label: "Cheek & Chin" },
  { slug: "lip", label: "Lip" },
  { slug: "nose", label: "Nose" },
  { slug: "chin-before-after", label: "Chin Before & After" },
  { slug: "silhouette-thread", label: "Silhouette Thread" },
] as const;

type Props = { params: Promise<{ locale: string }> };

export default async function FacialServicesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const localeCode = locale as Locale;

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="bg-clinic-teal px-4 py-14 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.35em] text-white/80">Facial</p>
          <h1 className="mt-3 text-3xl font-bold lg:text-5xl">Face Aesthetics</h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-2 lg:px-8">
        {facialGroups.map((group) => (
          <Link key={group.slug} href={`/${localeCode}/services/facial/${group.slug}`} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-clinic-teal-dark">Facial</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{group.label}</h2>
            <p className="mt-3 text-sm text-slate-500">{(serviceMediaManifest.facial[group.slug as keyof typeof serviceMediaManifest.facial] ?? []).length} image(s) in the reusable gallery.</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
