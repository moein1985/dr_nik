"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeInfo, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";

type SiteHeaderProps = {
  locale: Locale;
  dict: Dictionary;
};

export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  function getLocalizedPath(targetLocale: Locale) {
    const currentPath = pathname && pathname.startsWith("/") ? pathname : `/${locale}`;
    const parts = currentPath.split("/").filter(Boolean);

    if (parts.length === 0) {
      return `/${targetLocale}`;
    }

    if (locales.includes(parts[0] as Locale)) {
      parts[0] = targetLocale;
      return `/${parts.join("/")}`;
    }

    return `/${targetLocale}${currentPath}`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      {/* Top contact bar */}
      <div className="border-b border-slate-700 bg-slate-950 text-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2 text-xs lg:px-8">
          <div className="hidden items-center gap-4 lg:flex">
            <a href={`tel:${dict.footer.phone.split("|")[0]?.trim().replace(/\s/g,"")}`} className="flex items-center gap-1.5 transition hover:text-clinic-teal-light">
              <span aria-hidden="true">📞</span>
              <span dir="ltr">{dict.footer.phone.split("|")[0]?.trim()}</span>
            </a>
            <span className="text-slate-600">|</span>
            <span className="max-w-xs truncate text-slate-400">{dict.footer.address.split("،")[0]}</span>
          </div>
          <a href={`/${locale}/booking`} className="rounded-full bg-clinic-teal-mid px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-clinic-teal-dark">
            {dict.nav.booking}
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <Image src="/home/optimized/logo-drnik.webp" alt="Dr Nik logo" width={120} height={40} className="h-10 w-auto" />
          <div>
            <p className="text-xs font-semibold text-slate-700">{dict.footer.trustBadge}</p>
            <p className="text-xs text-slate-400">{dict.brand.tagline}</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
          <Link href={`/${locale}`} className="transition hover:text-clinic-teal">
            {dict.nav.home}
          </Link>
          <div className="group relative">
            <Link href={`/${locale}/services`} className="flex items-center gap-1 transition hover:text-clinic-teal">
              {dict.nav.services} <span className="text-xs opacity-40">▾</span>
            </Link>
            <div className="invisible absolute start-0 top-full z-50 mt-2 w-56 rounded-2xl bg-white p-2 opacity-0 shadow-xl ring-1 ring-slate-100 transition-all group-hover:visible group-hover:opacity-100">
              {dict.nav.serviceCategories.map((cat) => (
                <a
                  key={cat.href}
                  href={`/${locale}${cat.href}`}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-clinic-teal-light hover:text-clinic-teal-dark"
                >
                  {cat.label}
                </a>
              ))}
            </div>
          </div>
          <Link href={`/${locale}/about`} className="transition hover:text-clinic-teal">
            {dict.nav.doctor}
          </Link>
          <Link href={`/${locale}/gallery`} className="transition hover:text-clinic-teal">
            {dict.nav.gallery}
          </Link>
          <Link href={`/${locale}/fresh`} className="transition hover:text-clinic-teal">
            {dict.nav.fresh}
          </Link>
          <Link href={`/${locale}/contact`} className="transition hover:text-clinic-teal">
            {dict.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {locales.map((targetLocale) => {
            const isActive = targetLocale === locale;

            return (
              <a
                key={targetLocale}
                href={getLocalizedPath(targetLocale)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {localeInfo[targetLocale].nativeLabel}
              </a>
            );
          })}
          <Link
            href={`/${locale}/booking`}
            className="hidden rounded-full bg-clinic-teal-mid px-4 py-2 text-sm font-semibold text-white transition hover:bg-clinic-teal-dark sm:inline-flex"
          >
            {dict.nav.booking}
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="inline-flex rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          >
            <span className="text-sm font-semibold">{isMobileMenuOpen ? "×" : "≡"}</span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
      <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-sm font-medium text-slate-700">
            <a href={`/${locale}/booking`} className="mb-1 rounded-xl bg-clinic-teal-mid px-4 py-3 text-center font-semibold text-white transition hover:bg-clinic-teal-dark">
              {dict.nav.booking}
            </a>
            <Link href={`/${locale}`} className="rounded-lg px-3 py-2 transition hover:bg-slate-100">
              {dict.nav.home}
            </Link>
            <Link href={`/${locale}/services`} className="rounded-lg px-3 py-2 transition hover:bg-slate-100">
              {dict.nav.services}
            </Link>
            {dict.nav.serviceCategories.map((cat) => (
              <a key={cat.href} href={`/${locale}${cat.href}`} className="rounded-lg px-6 py-2 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                {cat.label}
              </a>
            ))}
            <Link href={`/${locale}/about`} className="rounded-lg px-3 py-2 transition hover:bg-slate-100">
              {dict.nav.doctor}
            </Link>
            <Link href={`/${locale}/gallery`} className="rounded-lg px-3 py-2 transition hover:bg-slate-100">
              {dict.nav.gallery}
            </Link>
            <Link href={`/${locale}/fresh`} className="rounded-lg px-3 py-2 transition hover:bg-slate-100">
              {dict.nav.fresh}
            </Link>
            <Link href={`/${locale}/contact`} className="rounded-lg px-3 py-2 transition hover:bg-slate-100">
              {dict.nav.contact}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
