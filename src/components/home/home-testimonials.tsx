"use client";

import { SimpleCarousel } from "@/components/sliders/simple-carousel";
import type { Dictionary } from "@/i18n/dictionary";

type Props = { dict: Dictionary; locale: string };

export function HomeTestimonials({ dict, locale }: Props) {
  const quotes = dict.home.testimonials;
  const testimonialImages = ["/testimonials/Patient1.png", "/testimonials/Patient2.png", "/testimonials/Patient3.png"];

  return (
    <section className="bg-clinic-teal px-4 py-14 text-white lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/8 p-6 shadow-lg backdrop-blur-sm">
        <p className="text-center text-sm uppercase tracking-[0.35em] text-white/70">{dict.home.testimonialsTitle}</p>
        <div className="mt-4">
          <SimpleCarousel
            slides={quotes.map((quote, index) => ({
              image: testimonialImages[index] ?? testimonialImages[0],
              title: `Patient ${index + 1}`,
              description: quote,
            }))}
            autoPlayInterval={4200}
            title={dict.home.testimonialsTitle}
          />
        </div>
        <p className="mt-4 text-center text-xs text-white/70">{locale === "en" ? "Autoplay, dots, and prev/next controls are built into the shared slider." : "پخش خودکار، دکمه‌های قبلی/بعدی و نقاط ناوبری در اسلایدر مشترک فعال‌اند."}</p>
      </div>
    </section>
  );
}
