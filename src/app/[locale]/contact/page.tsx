import { notFound } from "next/navigation";
import { ContactLeadForm } from "@/components/contact-lead-form";
import { getDictionary } from "@/i18n/dictionary";
import { isLocale, type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale as Locale);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">{dict.pages.contactTitle}</h1>
      <p className="mt-4 max-w-3xl text-slate-700">{dict.pages.contactText}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <ContactLeadForm dict={dict} />
          <section className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-slate-900">{dict.pages.socialConnectTitle}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <a href="https://instagram.com/dr.nik.dental.clinic" target="_blank" rel="noreferrer noopener" className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-clinic-teal-light hover:text-clinic-teal-dark">{dict.footer.instagram}</a>
              <a href="https://t.me/drnikdental" target="_blank" rel="noreferrer noopener" className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-clinic-teal-light hover:text-clinic-teal-dark">{dict.footer.telegram}</a>
              <a href="https://wa.me/989152006560" target="_blank" rel="noreferrer noopener" className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-clinic-teal-light hover:text-clinic-teal-dark">{dict.footer.whatsapp}</a>
            </div>
          </section>
        </div>

        <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{dict.pages.mapTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{dict.footer.address}</p>
          <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <iframe
              title={dict.pages.mapTitle}
              src="https://maps.google.com/maps?q=%D9%85%D8%B4%D9%87%D8%AF+%D9%85%D9%84%DA%A9+%D8%A2%D8%A8%D8%A7%D8%AF+%D8%B3%D8%A7%D8%AE%D8%AA%D9%85%D8%A7%D9%86+%D9%BE%D8%B2%D8%B4%DA%A9%D8%A7%D9%86+%D9%86%DB%8C%DA%A9&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
