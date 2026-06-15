import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { getDoctorPortfolioBySlug } from "@/lib/doctor-portfolio-map";
import { clinicImages } from "@/lib/clinic-image-manifest";

type Props = { dict: Dictionary; locale: Locale };

const learnMoreLabel: Record<string, string> = {
  fa: "بیشتر بدانید",
  ar: "اقرأ المزيد",
  en: "Learn More",
};

export function HomeDoctorFeature({ dict, locale }: Props) {
  const { doctorTitle, doctorName, doctorText, trustItems } = dict.home;
  const doctorPortfolio = getDoctorPortfolioBySlug("dr-nik", locale);
  const doctorImages = clinicImages.home.doctor;

  return (
    <section className="bg-clinic-dark-bg px-4 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid overflow-hidden rounded-3xl bg-clinic-dark-card shadow-sm lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative min-h-[320px] lg:min-h-[480px]">
            <Image
              src="/home/optimized/doctor-photo.webp"
              alt={doctorName}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
          </div>
          <div className="flex flex-col justify-center gap-5 p-8 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#56d9e8]">
              {doctorTitle}
            </p>
            <h2 className="text-3xl font-extrabold text-white lg:text-4xl">{doctorName}</h2>
            <p className="text-sm leading-8 text-white/75">{doctorText}</p>
            <ul className="grid gap-3 text-sm text-white/85 lg:grid-cols-1">
              {trustItems.slice(0, 3).map((item) => (
                <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={doctorPortfolio ? `/${locale}/doctor-portfolio/${doctorPortfolio.slug}` : `/${locale}/doctor-portfolio/dr-nik`}
              className="inline-flex self-start rounded-full bg-clinic-teal-mid px-7 py-3 text-sm font-semibold text-white transition hover:bg-clinic-teal-dark"
            >
              {learnMoreLabel[locale] ?? learnMoreLabel.en}
            </a>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#56d9e8]">Doctor gallery</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {doctorImages.map((src, index) => (
                  <div key={src} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-800">
                    <Image src={src} alt={`${doctorName} ${index + 1}`} fill sizes="96px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
