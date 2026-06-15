"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";

type Appointment = {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  requestedAt: Date;
  serviceName: string;
  notes?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
};

type Props = {
  locale: Locale;
  dict: Dictionary;
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Appointment["status"]) => void;
  onCreateAt: (date: Date) => void;
};

function toLocaleTag(locale: Locale) {
  if (locale === "fa") {
    return "fa-IR-u-ca-persian";
  }

  if (locale === "ar") {
    return "ar-SA";
  }

  return "en-US";
}

function getWeekStart(date: Date, locale: Locale) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const targetWeekday = locale === "en" ? 1 : 6; // en: Monday, fa/ar: Saturday
  const currentWeekday = start.getDay();
  const diff = (currentWeekday - targetWeekday + 7) % 7;
  start.setDate(start.getDate() - diff);

  return start;
}

function addDays(date: Date, dayOffset: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + dayOffset);
  return result;
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function statusChipClass(status: Appointment["status"]) {
  if (status === "CONFIRMED") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "CANCELLED") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
}

export function WeeklyCalendar({
  locale,
  dict,
  appointments,
  onEdit,
  onDelete,
  onUpdateStatus,
  onCreateAt,
}: Props) {
  const [weekAnchor, setWeekAnchor] = useState(() => getWeekStart(new Date(), locale));

  const localeTag = toLocaleTag(locale);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekAnchor, index)),
    [weekAnchor],
  );

  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        weekday: "short",
        month: "2-digit",
        day: "2-digit",
      }),
    [localeTag],
  );

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [localeTag],
  );

  const groupedByDay = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};

    for (const appointment of appointments) {
      const date = new Date(appointment.requestedAt);
      const key = localDateKey(date);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push({
        ...appointment,
        requestedAt: date,
      });
    }

    for (const key of Object.keys(grouped)) {
      grouped[key].sort(
        (a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime(),
      );
    }

    return grouped;
  }, [appointments]);

  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.calendarTitle}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekAnchor((prev) => addDays(prev, -7))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            {dict.dashboard.calendarPrevWeek}
          </button>
          <button
            type="button"
            onClick={() => setWeekAnchor(getWeekStart(new Date(), locale))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            {dict.dashboard.calendarToday}
          </button>
          <button
            type="button"
            onClick={() => setWeekAnchor((prev) => addDays(prev, 7))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            {dict.dashboard.calendarNextWeek}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => {
          const key = localDateKey(day);
          const dayAppointments = groupedByDay[key] ?? [];

          return (
            <article key={key} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-700">{dayFormatter.format(day)}</p>
                <button
                  type="button"
                  onClick={() => onCreateAt(day)}
                  className="rounded-lg bg-cyan-700 px-2 py-1 text-[11px] font-semibold text-white"
                >
                  {dict.dashboard.calendarAddOnDay}
                </button>
              </div>

              {dayAppointments.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">{dict.dashboard.calendarEmptyDay}</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {dayAppointments.map((item) => (
                    <div key={item.id} className="rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold text-slate-800">{timeFormatter.format(new Date(item.requestedAt))}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusChipClass(item.status)}`}>
                          {item.status === "PENDING"
                            ? dict.dashboard.statusPending
                            : item.status === "CONFIRMED"
                              ? dict.dashboard.statusConfirmed
                              : dict.dashboard.statusCancelled}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-slate-900">{item.patientName}</p>
                      <p className="text-[11px] text-slate-600">{dict.dashboard.doctorName}: {item.doctorName}</p>
                      <p className="text-[11px] text-slate-600">{item.serviceName}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="rounded-md border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                        >
                          {dict.dashboard.editButton}
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, "CONFIRMED")}
                          className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white"
                        >
                          {dict.dashboard.statusConfirmed}
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, "CANCELLED")}
                          className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-semibold text-white"
                        >
                          {dict.dashboard.statusCancelled}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white"
                        >
                          {dict.dashboard.deleteButton}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
