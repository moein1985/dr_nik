"use client";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { HomeIntroBand } from "@/components/home/home-intro-band";
import { HomeTestimonials } from "@/components/home/home-testimonials";
import { HomeServicePillars } from "@/components/home/home-service-pillars";
import { HomeDoctorFeature } from "@/components/home/home-doctor-feature";
import { HomeBeforeAfterCallout } from "@/components/home/home-before-after-callout";
import { HomeStatsBand } from "@/components/home/home-stats-band";
import { HomeInstagramStrip } from "@/components/home/home-instagram-strip";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeFinalCta } from "@/components/home/home-final-cta";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export function HomeLanding({ locale, dict }: Props) {
  return (
    <main className="bg-clinic-dark-bg text-slate-100">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-clinic-teal/20 bg-[#191717] min-h-[520px] lg:min-h-[640px]">

        {/* Mobile: video as full background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-[50%_15%] lg:hidden"
        >
          <source src="/home/hero-reverse.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70 lg:hidden" />

        {/* Desktop: split layout */}
        <div className="hidden lg:flex min-h-[640px]">

          {/* Video panel — order-last = LEFT in RTL (fa/ar), RIGHT in LTR (en) */}
          <div className="relative w-[38%] shrink-0 overflow-hidden order-last">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover object-[50%_18%]"
            >
              <source src="/home/hero-reverse.mp4" type="video/mp4" />
            </video>
            {/* Edge blend gradient toward text side — wide for smooth transition */}
            <div
              className={`pointer-events-none absolute inset-y-0 w-1/2 ${
                locale === "en"
                  ? "left-0 bg-gradient-to-l from-transparent to-[#191717]"
                  : "right-0 bg-gradient-to-r from-transparent to-[#191717]"
              }`}
            />
          </div>

          {/* Text panel */}
          <div className="flex flex-1 flex-col justify-center px-10 xl:px-16">
            <div className="flex flex-wrap items-center gap-y-2">
              {dict.nav.serviceCategories.map((cat, idx) => (
                <span key={cat.href} className="flex items-center">
                  {idx > 0 && <span className="mx-3 text-white/50 lg:mx-4">|</span>}
                  <a
                    href={`/${locale}${cat.href}`}
                    className="text-2xl font-bold text-white transition hover:text-clinic-teal-light xl:text-3xl"
                  >
                    {cat.label}
                  </a>
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm font-medium text-white/70 lg:text-base">
              {dict.brand.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`/${locale}/booking`}
                className="rounded-full bg-clinic-teal-mid px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-clinic-teal-dark"
              >
                {dict.home.ctaPrimary}
              </a>
              <a
                href={`/${locale}/contact`}
                className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {dict.home.ctaSecondary}
              </a>
            </div>
          </div>
        </div>

        {/* Mobile text overlay */}
        <div className="relative z-10 lg:hidden mx-auto max-w-7xl px-4 pb-10 pt-12">
          <div className="flex flex-wrap items-center gap-y-2">
            {dict.nav.serviceCategories.map((cat, idx) => (
              <span key={cat.href} className="flex items-center">
                {idx > 0 && <span className="mx-3 text-white/50">|</span>}
                <a
                  href={`/${locale}${cat.href}`}
                  className="text-xl font-bold text-white transition hover:text-clinic-teal-light"
                >
                  {cat.label}
                </a>
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium text-white/80">
            {dict.brand.tagline}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`/${locale}/booking`}
              className="rounded-full bg-clinic-teal-mid px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-clinic-teal-dark"
            >
              {dict.home.ctaPrimary}
            </a>
            <a
              href={`/${locale}/contact`}
              className="rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {dict.home.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      <HomeIntroBand dict={dict} />
      <HomeTestimonials dict={dict} locale={locale} />

      <HomeServicePillars dict={dict} locale={locale} />
      <HomeDoctorFeature dict={dict} locale={locale} />
      <HomeBeforeAfterCallout dict={dict} locale={locale} />
      <HomeStatsBand dict={dict} />
      <HomeInstagramStrip dict={dict} locale={locale} />
      <HomeFaq dict={dict} locale={locale} />
      <HomeFinalCta dict={dict} locale={locale} />
    </main>
  );
}

