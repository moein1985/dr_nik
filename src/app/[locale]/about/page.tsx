import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionary";
import { isLocale, type Locale } from "@/i18n/config";
import { clinicImages } from "@/lib/clinic-image-manifest";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const doctorImages = clinicImages.home.doctor;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeCode = locale as Locale;
  const dict = getDictionary(localeCode);

  return (
    <main>
      {/* Page hero */}
      <div className="bg-clinic-teal px-4 py-16 text-center text-white lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold lg:text-5xl">{dict.pages.aboutTitle}</h1>
          <p className="mt-4 text-base text-white/80">{dict.pages.aboutText}</p>
        </div>
      </div>

      {/* Doctor two-column */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 lg:grid lg:grid-cols-2">
          <div className="relative min-h-72 lg:min-h-[480px]">
            <Image
              src="/home/optimized/doctor-photo.webp"
              alt={dict.home.doctorName}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-5 p-8 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-clinic-teal-mid">
              {dict.home.doctorTitle}
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 lg:text-4xl">
              {dict.home.doctorName}
            </h2>
            <p className="text-sm leading-8 text-slate-600">{dict.home.doctorText}</p>
            <a
              href={`/${localeCode}/booking`}
              className="self-start rounded-full bg-clinic-teal-mid px-7 py-3 text-sm font-semibold text-white transition hover:bg-clinic-teal-dark"
            >
              {dict.home.ctaPrimary}
            </a>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-clinic-teal-mid">Doctor gallery</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {doctorImages.map((src, index) => (
                  <div key={src} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                    <Image src={src} alt={`${dict.home.doctorName} ${index + 1}`} fill sizes="96px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-clinic-teal">
            {dict.pages.aboutHighlightsTitle}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {dict.pages.aboutHighlights.map((item) => (
              <article key={item} className="rounded-2xl bg-clinic-teal-light p-6">
                <p className="text-sm font-medium leading-7 text-clinic-teal-dark">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Licenses */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="rounded-3xl bg-[#f3f5f6] p-8">
          <h2 className="text-2xl font-bold text-clinic-teal">{dict.pages.aboutLicensesTitle}</h2>
          <ul className="mt-6 space-y-4">
            {dict.pages.aboutLicenses.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-clinic-teal-mid" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
