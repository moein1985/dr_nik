import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { clinicImages } from "@/lib/clinic-image-manifest";

type Props = { dict: Dictionary; locale: Locale };

export function HomeFinalCta({ dict, locale }: Props) {
  return (
    <section className="relative overflow-hidden bg-clinic-teal px-4 py-12 text-center text-white lg:px-8">
      <div className="absolute inset-0">
        <Image src={clinicImages.home.finalCta} alt="Clinic final CTA" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/55" />
      </div>
      <div className="relative mx-auto max-w-3xl">
        <h3 className="text-3xl font-bold lg:text-5xl">{dict.home.finalCtaTitle}</h3>
        <p className="mt-3 text-base text-white/90 lg:text-xl">
          {dict.home.finalCtaText}
        </p>
        <a
          href={`/${locale}/booking`}
          className="mt-5 inline-flex rounded-full bg-white px-7 py-3 text-base font-bold text-clinic-teal shadow-md transition hover:bg-clinic-teal-light"
        >
          {dict.nav.booking}
        </a>
      </div>
    </section>
  );
}
