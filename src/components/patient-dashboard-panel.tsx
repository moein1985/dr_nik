"use client";

import { useEffect, useMemo, useState } from "react";
import { AppointmentDateTimeInput } from "@/components/appointment-date-time-input";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";
import { formatLocalizedDate } from "@/i18n/date";
import { getTRPCClient } from "@/trpc/client";
import { getDoctorPortfolio } from "@/lib/doctor-portfolio-map";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

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

export function PatientDashboardPanel({ dict, locale }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [doctorName, setDoctorName] = useState<string>(dict.home.doctorName);
  const [serviceName, setServiceName] = useState("");
  const [requestedAtIso, setRequestedAtIso] = useState("");
  const [notes, setNotes] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiImageUrl, setAiImageUrl] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const matchedPortfolio = useMemo(
    () => (doctorName.trim() ? getDoctorPortfolio(doctorName, locale) : null),
    [doctorName, locale],
  );

  async function load() {
    setLoading(true);
    try {
      const me = await trpc.auth.me.query();
      const isPatient = me.role === "PATIENT";
      setAuthorized(isPatient);

      if (!isPatient) {
        setLoading(false);
        return;
      }

      const defaultName = me.username?.trim() ?? "";
      const defaultPhone = me.phoneNumber?.trim() ?? "";

      setProfileName(defaultName);
      setProfilePhone(defaultPhone);
      setPatientName((prev) => prev || defaultName);
      setPatientPhone((prev) => prev || defaultPhone);

      const list = await trpc.appointment.listMy.query();
      setAppointments(list as Appointment[]);
    } catch {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!requestedAtIso) {
      setMessage(dict.dashboard.invalidDateTime);
      return;
    }

    try {
      await trpc.appointment.createMy.mutate({
        patientName,
        patientPhone,
        doctorName,
        serviceName,
        requestedAt: new Date(requestedAtIso),
        notes: notes || undefined,
      });

      setMessage(dict.dashboard.createButton + " ✓");
      setPatientName(profileName);
      setPatientPhone(profilePhone);
      setServiceName("");
      setRequestedAtIso("");
      setNotes("");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    }
  }

  async function cancelAppointment(id: string) {
    setMessage("");
    try {
      await trpc.appointment.cancelMy.mutate({ id });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    }
  }

  async function submitAiDemo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!aiText.trim()) {
      return;
    }

    setAiLoading(true);
    setAiReply("");

    try {
      const response = await trpc.ai.createMessage.mutate({
        text: aiText,
        imageUrl: aiImageUrl.trim() || undefined,
      });

      setAiReply(response.reply);
    } catch (error) {
      setAiReply(error instanceof Error ? error.message : dict.auth.genericError);
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return <p className="mt-6 text-sm text-slate-600">{dict.dashboard.loading}</p>;
  }

  if (!authorized) {
    return <p className="mt-6 text-sm font-medium text-rose-700">{dict.dashboard.unauthorized}</p>;
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.createTitle}</h2>
        <form onSubmit={submitCreate} className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder={dict.dashboard.patientName}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            placeholder={dict.dashboard.patientPhone}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder={dict.dashboard.serviceName}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <div className="flex items-center gap-2">
            <input
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder={dict.dashboard.doctorName}
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <a
              href={matchedPortfolio ? `/${locale}/doctor-portfolio/${matchedPortfolio.slug}` : undefined}
              aria-label={matchedPortfolio ? `${dict.dashboard.viewDoctorPortfolio} (${matchedPortfolio.name})` : dict.dashboard.viewDoctorPortfolio}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                matchedPortfolio
                  ? "border-cyan-200 text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50"
                  : "pointer-events-none border-slate-200 text-slate-400 opacity-50"
              }`}
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                <path d="M1.25 10C2.92 6.67 6 4.58 10 4.58S17.08 6.67 18.75 10C17.08 13.33 14 15.42 10 15.42S2.92 13.33 1.25 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>{dict.dashboard.viewDoctorPortfolio}</span>
            </a>
          </div>
          <AppointmentDateTimeInput
            locale={locale}
            dict={dict}
            valueIso={requestedAtIso}
            onChangeIso={setRequestedAtIso}
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={dict.dashboard.notes}
            className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2 text-sm"
            rows={3}
          />
          <button className="md:col-span-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
            {dict.dashboard.createButton}
          </button>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.listTitle}</h2>
        {appointments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">{dict.dashboard.noAppointments}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {appointments.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">{item.patientName}</p>
                <p className="text-xs text-slate-600">{dict.dashboard.doctorName}: {item.doctorName}</p>
                <p className="text-xs text-slate-600">{item.serviceName}</p>
                <p className="mt-1 text-xs text-slate-500">{formatLocalizedDate(locale, new Date(item.requestedAt))}</p>
                <p className="mt-1 text-xs text-slate-500">{dict.dashboard.statusLabel}: {item.status}</p>
                <button
                  type="button"
                  onClick={() => cancelAppointment(item.id)}
                  className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {dict.dashboard.cancelButton}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-slate-950 p-6 text-white ring-1 ring-slate-800 lg:p-8">
        <h3 className="text-xl font-bold">{dict.dashboard.aiTitle}</h3>
        <p className="mt-2 text-sm text-slate-300">{dict.dashboard.aiSubtitle}</p>
        <form onSubmit={submitAiDemo} className="mt-4 grid gap-3">
          <textarea
            value={aiText}
            onChange={(event) => setAiText(event.target.value)}
            placeholder={dict.dashboard.aiTextPlaceholder}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            rows={3}
            required
          />
          <input
            type="url"
            value={aiImageUrl}
            onChange={(event) => setAiImageUrl(event.target.value)}
            placeholder={dict.dashboard.aiImageUrlPlaceholder}
            aria-label={dict.dashboard.aiImageUrlPlaceholder}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
          <p className="text-xs text-slate-400">{dict.dashboard.aiImageHint}</p>
          <button
            type="submit"
            disabled={aiLoading}
            className="w-fit rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {aiLoading ? "..." : dict.dashboard.aiSendButton}
          </button>
        </form>
        {aiReply && (
          <p className="mt-4 rounded-xl bg-slate-900 px-3 py-2 text-sm text-slate-100">
            {dict.dashboard.aiReplyLabel}: {aiReply}
          </p>
        )}
      </section>

      {message && <p className="text-sm font-medium text-slate-700">{message}</p>}
    </div>
  );
}
