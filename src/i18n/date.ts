import type { Locale } from "@/i18n/config";
import { isValidJalaaliDate, toGregorian, toJalaali } from "jalaali-js";

export function formatLocalizedDate(locale: Locale, date: Date) {
  const localeTag =
    locale === "fa" ? "fa-IR-u-ca-persian" : locale === "ar" ? "ar-SA" : "en-US";

  return new Intl.DateTimeFormat(localeTag, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toDatetimeLocalValue(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function toJalaliDateString(date: Date) {
  const jalali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${jalali.jy}/${pad2(jalali.jm)}/${pad2(jalali.jd)}`;
}

export function parseGregorianDatetimeLocal(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function parseJalaliDateTime(dateValue: string, timeValue: string) {
  const match = dateValue.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);

  if (!match) {
    return null;
  }

  const jy = Number(match[1]);
  const jm = Number(match[2]);
  const jd = Number(match[3]);

  if (!isValidJalaaliDate(jy, jm, jd)) {
    return null;
  }

  const timeMatch = timeValue.trim().match(/^(\d{1,2}):(\d{2})$/);

  if (!timeMatch) {
    return null;
  }

  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  const gregorian = toGregorian(jy, jm, jd);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd, hours, minutes, 0, 0);
}
