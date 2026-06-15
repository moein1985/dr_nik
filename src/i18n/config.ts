export const locales = ["fa", "en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fa";

export const rtlLocales: Locale[] = ["fa", "ar"];

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export const localeInfo: Record<
  Locale,
  { dir: "rtl" | "ltr"; label: string; nativeLabel: string }
> = {
  fa: { dir: "rtl", label: "Persian", nativeLabel: "فارسی" },
  en: { dir: "ltr", label: "English", nativeLabel: "English" },
  ar: { dir: "rtl", label: "Arabic", nativeLabel: "العربية" },
};
