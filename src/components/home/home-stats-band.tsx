import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionary";
import { clinicImages } from "@/lib/clinic-image-manifest";

type Props = { dict: Dictionary };

export function HomeStatsBand({ dict }: Props) {
  return (
    <section className="bg-clinic-teal px-4 py-16 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl shadow-black/10 lg:p-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-900">
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-2 p-3">
                {[
                  clinicImages.gallery.environment[0],
                  clinicImages.gallery.environment[1],
                  clinicImages.gallery.environment[2],
                  clinicImages.gallery.environment[3],
                ].map((src, index) => (
                  <div key={src} className={index === 0 ? "col-span-2" : ""}>
                    <div className="relative h-full overflow-hidden rounded-2xl bg-slate-800">
                      <Image
                        src={src}
                        alt={`${dict.home.socialTitle} ${index + 1}`}
                        fill
                        sizes="(min-width: 1024px) 22vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-clinic-teal-light">{dict.home.trustTitle}</p>
                <h3 className="mt-2 text-2xl font-bold text-white lg:text-3xl">{dict.home.socialTitle}</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/85">{dict.home.socialSubtitle}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl shadow-black/10 lg:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-clinic-teal-light">{dict.footer.trustBadge}</p>
            <h3 className="mt-3 text-2xl font-bold text-white lg:text-3xl">{dict.home.trustTitle}</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/90">
              {dict.home.trustItems.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-clinic-teal-light" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {dict.home.socialStats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-2xl bg-white px-4 py-4 text-clinic-teal shadow-md"
                >
                  <p className="text-2xl font-extrabold lg:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
