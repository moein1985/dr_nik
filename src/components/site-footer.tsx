import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

type SiteFooterProps = {
  dict: Dictionary;
  locale: Locale;
};

export function SiteFooter({ dict, locale }: SiteFooterProps) {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-slate-900 text-slate-100">
      {/* Centered logo block */}
      <div className="flex flex-col items-center gap-2 border-b border-slate-700 py-6">
        <Image src="/home/optimized/logo-drnik.webp" alt="Dr Nik clinic" width={160} height={52} className="h-12 w-auto brightness-0 invert" />
        <p className="text-xs text-slate-400">{dict.footer.trustBadge}</p>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="text-lg font-semibold text-white">{dict.brand.name}</h3>
          <p className="mt-2 text-sm text-slate-300">{dict.brand.tagline}</p>
        </div>
        <div>
          <div className="flex items-start gap-2 text-sm font-semibold text-slate-200">
            <span>📞</span>
            <span>{dict.footer.phone}</span>
          </div>
          <div className="mt-2 flex items-start gap-2 text-sm text-slate-300">
            <span>📍</span>
            <span>{dict.footer.address}</span>
          </div>
          <a
            href={`/${locale}/contact`}
            className="mt-3 inline-block text-xs font-semibold text-clinic-teal-light hover:text-white"
          >
            {dict.footer.mapLinkLabel}
          </a>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {dict.nav.services}
          </p>
          <ul className="space-y-2">
            {dict.nav.serviceCategories.map((cat) => (
              <li key={cat.href}>
                <a
                  href={`/${locale}${cat.href}`}
                  className="text-sm text-slate-300 transition hover:text-clinic-teal-light"
                >
                  {cat.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm text-slate-300">{dict.footer.rights}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{dict.footer.socialTitle}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href="https://instagram.com/dr.nik.dental.clinic"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            >
              <span>📷</span>
              <span>{dict.footer.instagram}</span>
            </a>
            <a
              href="https://wa.me/989152006560"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
            >
              <span>💬</span>
              <span>{dict.footer.whatsapp}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
