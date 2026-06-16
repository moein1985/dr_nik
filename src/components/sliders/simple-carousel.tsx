"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SlideItem = {
  image?: string;
  title?: string;
  description?: string;
};

type Props = {
  images?: readonly string[];
  slides?: readonly SlideItem[];
  autoPlayInterval?: number;
  title?: string;
};

export function SimpleCarousel({ images, slides, autoPlayInterval = 3000, title }: Props) {
  const slideItems = (slides ?? (images ?? []).map((image) => ({ image }))) as readonly SlideItem[];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!slideItems.length || autoPlayInterval <= 0) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideItems.length);
    }, autoPlayInterval);

    return () => window.clearInterval(interval);
  }, [autoPlayInterval, slideItems.length]);

  if (!slideItems.length) return null;

  const goToPrevious = () => setCurrentIndex((prev) => (prev - 1 + slideItems.length) % slideItems.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % slideItems.length);

  return (
    <section className="w-full">
      {title ? <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3> : null}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden md:aspect-[16/10]">
          {slideItems[currentIndex]?.image ? (
            <Image
              src={slideItems[currentIndex].image}
              alt={slideItems[currentIndex]?.title ?? title ?? "Gallery slide"}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-clinic-teal-dark via-clinic-teal-mid to-slate-900" />
          )}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
            <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {currentIndex + 1} / {slideItems.length}
            </span>
            <span className="rounded-full bg-black/45 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">reusable slider</span>
          </div>
          {(slideItems[currentIndex]?.title || slideItems[currentIndex]?.description) ? (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-6 text-white">
              {slideItems[currentIndex]?.title ? <h4 className="text-xl font-bold">{slideItems[currentIndex]?.title}</h4> : null}
              {slideItems[currentIndex]?.description ? <p className="mt-1 text-sm text-white/80">{slideItems[currentIndex]?.description}</p> : null}
            </div>
          ) : null}
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-3 text-white shadow-lg transition hover:bg-black/65"
            aria-label="Previous image"
          >
            ←
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-3 text-white shadow-lg transition hover:bg-black/65"
            aria-label="Next image"
          >
            →
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {slideItems.map((item, index) => (
          <button
            key={`${item.title ?? item.image ?? index}-${index}`}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition ${index === currentIndex ? "w-8 bg-clinic-teal-mid" : "w-2 bg-slate-300 hover:bg-slate-400"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
