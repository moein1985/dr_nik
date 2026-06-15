"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";

type Props = { dict: Dictionary; locale: string };

export function HomeTestimonials({ dict, locale }: Props) {
  const [idx, setIdx] = useState(0);
  const quotes = dict.home.testimonials;
  const current = quotes[idx % quotes.length] ?? quotes[0];

  return (
    <section className="bg-clinic-teal px-4 py-14 text-center text-white lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-6xl leading-none text-white/40">"</p>
        <p className="mx-auto mt-3 text-sm leading-8 text-white/95 lg:text-base">{current}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIdx((p) => (p - 1 + quotes.length) % quotes.length)}
            aria-label="previous testimonial"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm transition hover:bg-white/40"
          >
            {locale === "en" ? "←" : "→"}
          </button>
          {quotes.slice(0, 3).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-2 w-2 rounded-full transition ${i === idx % quotes.length ? "scale-125 bg-white" : "bg-white/40 hover:bg-white/70"}`}
              aria-label={`testimonial ${i + 1}`}
            />
          ))}
          <button
            type="button"
            onClick={() => setIdx((p) => (p + 1) % quotes.length)}
            aria-label="next testimonial"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm transition hover:bg-white/40"
          >
            {locale === "en" ? "→" : "←"}
          </button>
        </div>
      </div>
    </section>
  );
}
