import { SimpleCarousel } from "@/components/sliders/simple-carousel";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { clinicImages } from "@/lib/clinic-image-manifest";

const instagramSections = [
  {
    key: "event",
    images: clinicImages.home.instagram.event,
  },
  {
    key: "team",
    images: clinicImages.home.instagram.team,
  },
  {
    key: "clients",
    images: clinicImages.home.instagram.clients,
  },
  {
    key: "amwc",
    images: clinicImages.home.instagram.amwc,
  },
] as const;

const cardTitles: Record<string, string[]> = {
  fa: ["رویداد", "تیم", "مراجعان", "AMWC"],
  en: ["Event", "Team", "Clients", "AMWC"],
  ar: ["فعالية", "الفريق", "المراجعون", "AMWC"],
};

const labels: Record<string, { heading: string; follow: string }> = {
  fa: { heading: "ما را در اینستاگرام دنبال کنید", follow: "دنبال کنید" },
  en: { heading: "Follow Us on Instagram", follow: "Follow Us" },
  ar: { heading: "تابعنا على انستغرام", follow: "تابعنا" },
};

type Props = { dict: Dictionary; locale: Locale };

export function HomeInstagramStrip({ dict: _dict, locale }: Props) {
  const cards = cardTitles[locale] ?? cardTitles.en;
  const { heading, follow } = labels[locale] ?? labels.en;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 lg:px-8">
      <div className="rounded-2xl bg-clinic-dark-card p-6 text-center">
        <p className="text-xl font-bold text-white">{heading}</p>
        <p className="mt-1 text-sm text-white/50">
          @dr.nik.dental.clinic &nbsp;·&nbsp; @dr.nik_doost
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {instagramSections.map((section, index) => {
            const sectionTitle = cards[index] ?? section.key.toUpperCase();
            return (
            <article key={section.key} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{sectionTitle}</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">{section.images.length} photos</span>
              </div>
              <SimpleCarousel images={section.images} autoPlayInterval={4500} title={sectionTitle} />
            </article>
            );
          })}
        </div>
        <a
          href="https://instagram.com/dr.nik.dental.clinic"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-clinic-teal bg-transparent px-5 py-2 text-sm font-semibold text-clinic-teal transition hover:bg-clinic-teal/10"
        >
          <span aria-hidden="true">📷</span>
          {follow}
        </a>
      </div>
    </section>
  );
}
