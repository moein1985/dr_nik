"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import {
  parseGregorianDatetimeLocal,
  parseJalaliDateTime,
  toDatetimeLocalValue,
  toJalaliDateString,
} from "@/i18n/date";

type Props = {
  locale: Locale;
  dict: Dictionary;
  valueIso: string;
  onChangeIso: (nextValue: string) => void;
};

export function AppointmentDateTimeInput({ locale, dict, valueIso, onChangeIso }: Props) {
  const [jalaliDate, setJalaliDate] = useState("");
  const [jalaliTime, setJalaliTime] = useState("");
  const inputLang = locale === "ar" ? "ar-SA" : "en-US";

  const parsedDate = useMemo(() => {
    if (!valueIso) {
      return null;
    }

    const date = new Date(valueIso);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [valueIso]);

  useEffect(() => {
    if (locale !== "fa") {
      return;
    }

    if (!parsedDate) {
      setJalaliDate("");
      setJalaliTime("");
      return;
    }

    setJalaliDate(toJalaliDateString(parsedDate));
    setJalaliTime(`${String(parsedDate.getUTCHours()).padStart(2, "0")}:${String(parsedDate.getUTCMinutes()).padStart(2, "0")}`);
  }, [locale, parsedDate]);

  if (locale !== "fa") {
    return (
      <input
        type="datetime-local"
        lang={inputLang}
        dir={locale === "ar" ? "rtl" : "ltr"}
        value={parsedDate ? toDatetimeLocalValue(parsedDate) : ""}
        onChange={(event) => {
          const next = parseGregorianDatetimeLocal(event.target.value);
          onChangeIso(next ? next.toISOString() : "");
        }}
        aria-label={dict.dashboard.requestedAt}
        title={dict.dashboard.requestedAt}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        required
      />
    );
  }

  return (
    <div className="grid gap-2">
      <div className="grid gap-2 md:grid-cols-2">
        <JalaliDatePicker
          value={jalaliDate}
          onChange={(nextDate) => {
            setJalaliDate(nextDate);
            const parsed = parseJalaliDateTime(nextDate, jalaliTime);
            onChangeIso(parsed ? parsed.toISOString() : "");
          }}
          placeholder={dict.dashboard.jalaliDatePlaceholder}
        />
        <input
          type="time"
          value={jalaliTime}
          onChange={(event) => {
            const nextTime = event.target.value;
            setJalaliTime(nextTime);
            const parsed = parseJalaliDateTime(jalaliDate, nextTime);
            onChangeIso(parsed ? parsed.toISOString() : "");
          }}
          aria-label={dict.dashboard.jalaliTimeLabel}
          title={dict.dashboard.jalaliTimeLabel}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          required
        />
      </div>
      <p className="text-xs text-slate-500">{dict.dashboard.jalaliCalendarHint}</p>
      {!valueIso && <p className="text-xs text-rose-700">{dict.dashboard.invalidDateTime}</p>}
    </div>
  );
}
