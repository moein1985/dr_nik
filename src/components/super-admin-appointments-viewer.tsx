"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";
import { formatLocalizedDate } from "@/i18n/date";
import { getTRPCClient } from "@/trpc/client";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

type Appointment = {
  id: string;
  doctorUserId?: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  requestedAt: Date | string;
  serviceName: string;
  notes?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
};

function getCopy(locale: Locale) {
  if (locale === "en") {
    return {
      title: "Appointments Overview",
      subtitle: "Read-only view of all clinic appointments. Super admins cannot create, edit, or delete appointments.",
      readOnlyBadge: "Read-only",
      loading: "Loading...",
    };
  }

  if (locale === "ar") {
    return {
      title: "نظرة عامة على المواعيد",
      subtitle: "عرض للقراءة فقط لجميع مواعيد العيادة. لا يمكن للمشرف العام إنشاء أو تعديل أو حذف المواعيد.",
      readOnlyBadge: "للقراءة فقط",
      loading: "جاري التحميل...",
    };
  }

  return {
    title: "نمای کلی نوبت‌ها",
    subtitle: "نمای فقط‌خواندنی همه‌ی نوبت‌های کلینیک. سوپرادمین اجازه‌ی ایجاد، ویرایش یا حذف نوبت را ندارد.",
    readOnlyBadge: "فقط خواندنی",
    loading: "در حال بارگذاری...",
  };
}

function getStatusLabel(dict: Dictionary, status: Appointment["status"]) {
  if (status === "PENDING") {
    return dict.dashboard.statusPending;
  }

  if (status === "CONFIRMED") {
    return dict.dashboard.statusConfirmed;
  }

  return dict.dashboard.statusCancelled;
}

function getStatusClasses(status: Appointment["status"]) {
  if (status === "CONFIRMED") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "CANCELLED") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
}

export function SuperAdminAppointmentsViewer({ dict, locale }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const copy = getCopy(locale);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Appointment["status"]>("ALL");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const list = (await trpc.appointment.list.query()) as Appointment[];
        if (!cancelled) {
          setAppointments(list);
        }
      } catch {
        if (!cancelled) {
          setAppointments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [trpc]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return appointments
      .filter((item) => (statusFilter === "ALL" ? true : item.status === statusFilter))
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          item.patientName.toLowerCase().includes(normalizedSearch) ||
          item.patientPhone.toLowerCase().includes(normalizedSearch) ||
          item.doctorName.toLowerCase().includes(normalizedSearch) ||
          item.serviceName.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((left, right) => new Date(right.requestedAt).getTime() - new Date(left.requestedAt).getTime());
  }, [appointments, searchTerm, statusFilter]);

  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold text-slate-900">{copy.title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {copy.readOnlyBadge}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{copy.subtitle}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={dict.dashboard.searchPlaceholder}
          aria-label={dict.dashboard.searchPlaceholder}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "ALL" | Appointment["status"])}
          aria-label={dict.dashboard.statusLabel}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="ALL">{dict.dashboard.filterAll}</option>
          <option value="PENDING">{dict.dashboard.statusPending}</option>
          <option value="CONFIRMED">{dict.dashboard.statusConfirmed}</option>
          <option value="CANCELLED">{dict.dashboard.statusCancelled}</option>
        </select>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-600">{copy.loading}</p>
      ) : filteredAppointments.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">{dict.dashboard.noAppointments}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredAppointments.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{item.patientName}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(item.status)}`}>
                  {getStatusLabel(dict, item.status)}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {item.patientPhone} | {dict.dashboard.doctorName}: {item.doctorName}
              </p>
              <p className="text-xs text-slate-600">{item.serviceName}</p>
              <p className="mt-1 text-xs text-slate-500">
                {formatLocalizedDate(locale, new Date(item.requestedAt))}
              </p>
              {item.notes && (
                <p className="mt-1 text-xs text-slate-500">
                  {dict.dashboard.notes}: {item.notes}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
