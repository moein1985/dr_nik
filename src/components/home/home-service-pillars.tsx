import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { optimizedAssetPath } from "@/lib/asset-path";
import { clinicImages } from "@/lib/clinic-image-manifest";

type Props = { dict: Dictionary; locale: Locale };

export function HomeServicePillars({ dict, locale }: Props) {
  const { sectionTitle, ctaLabel, items } = dict.home.servicePillars;
  return (
    <section className="bg-clinic-dark-card px-4 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-white lg:text-4xl">
          {sectionTitle}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <a
              key={item.id}
              href={`/${locale}${item.href}`}
              className="group relative overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={optimizedAssetPath(item.image ?? clinicImages.placeholder)}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              </div>
              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-white/80">{item.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm transition group-hover:bg-clinic-teal-mid">
                  {ctaLabel} →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
