import ar from "@/i18n/messages/ar";
import en from "@/i18n/messages/en";
import fa from "@/i18n/messages/fa";
import type { Locale } from "@/i18n/config";

const dictionaries = {
  fa,
  en,
  ar,
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
