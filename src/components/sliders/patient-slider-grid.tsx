"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Props = {
  images: readonly string[];
  title: string;
  subtitle?: string;
};

export function PatientSliderGrid({ images, title, subtitle }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images.length) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [images.length]);

  const visibleImages = useMemo(() => {
    if (images.length <= 4) return images;
    return images.slice(0, 4);
  }, [images]);

  if (!images.length) return null;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-clinic-teal-dark">Patient gallery</p>
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous image" onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">←</button>
          <button type="button" aria-label="Next image" onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">→</button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <div className="relative aspect-[4/3]">
            <Image src={images[currentIndex]} alt={title} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </article>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {visibleImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Show image ${index + 1}`}
              onClick={() => setCurrentIndex((index + currentIndex) % images.length)}
              className={`overflow-hidden rounded-3xl border bg-slate-50 text-left shadow-sm transition hover:-translate-y-1 hover:border-clinic-teal-mid ${index === currentIndex ? "border-clinic-teal-mid" : "border-slate-200"}`}
            >
              <div className="relative aspect-[4/3]">
                <Image src={image} alt={`${title} ${index + 1}`} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
