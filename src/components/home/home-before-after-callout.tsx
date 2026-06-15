import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { clinicImages } from "@/lib/clinic-image-manifest";

type Props = { dict: Dictionary; locale: Locale };

export function HomeBeforeAfterCallout({ dict, locale }: Props) {
  const { title, desc, ctaLabel } = dict.home.beforeAfterCallout;
  return (
    <section className="relative overflow-hidden bg-clinic-teal-light px-4 py-14 text-center lg:px-8">
      <div className="absolute inset-0">
        <Image src={clinicImages.home.results} alt="Results callout" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold text-white lg:text-4xl">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-white/80">{desc}</p>
        <a
          href={`/${locale}/gallery`}
          className="mt-6 inline-flex rounded-full bg-clinic-teal-mid px-8 py-3 text-sm font-semibold text-white transition hover:bg-clinic-teal-dark"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
