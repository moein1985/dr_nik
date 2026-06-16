import { SimpleCarousel } from "@/components/sliders/simple-carousel";

type PatientCarouselItem = {
  title: string;
  images: readonly string[];
};

type Props = {
  items: readonly PatientCarouselItem[];
};

export function PatientCarouselGrid({ items }: Props) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <SimpleCarousel images={item.images} title={item.title} />
        </article>
      ))}
    </section>
  );
}
