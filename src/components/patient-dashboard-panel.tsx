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

type Doctor = {
  id: string;
  username: string;
  email: string;
};

export function PatientDashboardPanel({ dict, locale }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [message, setMessage] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [requestedAtIso, setRequestedAtIso] = useState("");
  const [notes, setNotes] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiImageUrl, setAiImageUrl] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiQuotaRemaining, setAiQuotaRemaining] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; role: string; content: string; createdAt: Date }>>([]);

  const quickServiceOptions = useMemo(
    () => [
      "فیشیال",
      "لیزر",
      "جوانسازی پوست",
      "تزریق بوتاکس",
      "کانتورینگ بدن",
    ],
    [],
  );

  const selectedDoctor = useMemo(() => doctors.find((d) => d.id === selectedDoctorId), [doctors, selectedDoctorId]);

  const upcomingAppointments = useMemo(
    () => appointments
      .map((item) => ({ ...item, requestedAt: new Date(item.requestedAt) }))
      .filter((item) => item.status !== "CANCELLED" && item.requestedAt.getTime() >= Date.now())
      .sort((left, right) => left.requestedAt.getTime() - right.requestedAt.getTime()),
    [appointments],
  );

  const nextAppointment = upcomingAppointments[0] ?? null;
  const isCreateFormReady = Boolean(
    patientName.trim() &&
    patientPhone.trim() &&
    serviceName.trim() &&
    selectedDoctorId &&
    requestedAtIso,
  );

  const matchedPortfolio = useMemo(
    () => (selectedDoctor ? getDoctorPortfolio(selectedDoctor.username, locale) : null),
    [selectedDoctor, locale],
  );

  async function loadChatHistory(doctorId: string) {
    if (!doctorId) {
      setChatHistory([]);
      return;
    }

    try {
      const history = await trpc.ai.getChatHistory.query({ doctorUserId: doctorId });
      setChatHistory(history);
    } catch {
      setChatHistory([]);
    }
  }

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

      const [list, doctorsList] = await Promise.all([
        trpc.appointment.listMy.query(),
        trpc.auth.listActiveDoctors.query(),
      ]);

      setAppointments(list as Appointment[]);
      setDoctors(doctorsList);

      if (doctorsList.length > 0 && !selectedDoctorId) {
        const firstDoctorId = doctorsList[0].id;
        setSelectedDoctorId(firstDoctorId);
        await loadChatHistory(firstDoctorId);
      }
    } catch {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  // Load chat history when doctor selection changes
  useEffect(() => {
    void loadChatHistory(selectedDoctorId);
  }, [selectedDoctorId]);

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

    if (!selectedDoctorId) {
      setMessage(dict.dashboard.chooseDoctorError);
      return;
    }

    if (!isCreateFormReady) {
      setMessage(dict.dashboard.submitDisabledHint);
      return;
    }

    try {
      await trpc.appointment.createMy.mutate({
        patientName,
        patientPhone,
        doctorName: selectedDoctor?.username ?? "دکتر",
        serviceName,
        requestedAt: new Date(requestedAtIso),
        notes: notes || undefined,
        doctorUserId: selectedDoctorId,
      });

      setMessage(dict.dashboard.createSuccess);
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

    if (aiQuotaRemaining <= 0) {
      setAiReply("شما قبلاً تمام سؤالات خود برای این پزشک را استفاده کرده‌اید.");
      return;
    }

    setAiLoading(true);
    setAiReply("");

    try {
      const response = await trpc.ai.createMessage.mutate({
        text: aiText,
        imageUrl: aiImageUrl.trim() || undefined,
        doctorUserId: selectedDoctorId || undefined,
      });

      setAiReply(response.reply);
      setAiQuotaRemaining(response.quotaRemaining ?? 0);
      setAiText("");
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
        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{dict.dashboard.upcomingAppointments}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{upcomingAppointments.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{dict.dashboard.nextAppointment}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {nextAppointment ? formatLocalizedDate(locale, nextAppointment.requestedAt) : dict.dashboard.noUpcomingAppointments}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{dict.dashboard.selectedDoctorSummary}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{selectedDoctor?.username ?? "-"}</p>
          </article>
        </div>

        <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.createTitle}</h2>
        <p className="mt-2 text-sm text-slate-500">{dict.dashboard.formRequiredHint}</p>
        <form onSubmit={submitCreate} className="mt-5 grid gap-3 md:grid-cols-2">
          <p className="md:col-span-2 text-xs font-semibold text-slate-500">{dict.dashboard.formStepPatientInfo}</p>
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
          <p className="md:col-span-2 mt-1 text-xs font-semibold text-slate-500">{dict.dashboard.formStepAppointmentInfo}</p>
          <input
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder={dict.dashboard.serviceName}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <div className="md:col-span-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">{dict.dashboard.quickServiceLabel}</span>
            {quickServiceOptions.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => setServiceName(service)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                {service}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
              aria-label="انتخاب دکتر"
              title="انتخاب دکتر برای نوبت"
              required
            >
              <option value="">انتخاب کنید</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.username}
                </option>
              ))}
            </select>
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
          <p className="md:col-span-2 mt-1 text-xs font-semibold text-slate-500">{dict.dashboard.formStepExtraInfo}</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={dict.dashboard.notes}
            className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2 text-sm"
            rows={3}
          />
          <button
            disabled={!isCreateFormReady}
            className="md:col-span-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {dict.dashboard.createButton}
          </button>
          {!isCreateFormReady && (
            <p className="md:col-span-2 text-xs text-amber-700">{dict.dashboard.submitDisabledHint}</p>
          )}
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
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{dict.dashboard.aiTitle}</h3>
          <p className="text-xs text-slate-400">
            {aiQuotaRemaining > 0 ? `${aiQuotaRemaining} سؤال باقی‌مانده` : "بدون سؤال باقی‌مانده"}
          </p>
        </div>
        <p className="mt-2 text-sm text-slate-300">{dict.dashboard.aiSubtitle}</p>
        <form onSubmit={submitAiDemo} className="mt-4 grid gap-3">
          <textarea
            value={aiText}
            onChange={(event) => setAiText(event.target.value)}
            placeholder={dict.dashboard.aiTextPlaceholder}
            disabled={aiQuotaRemaining <= 0}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            rows={3}
            required
          />
          <input
            type="url"
            value={aiImageUrl}
            onChange={(event) => setAiImageUrl(event.target.value)}
            placeholder={dict.dashboard.aiImageUrlPlaceholder}
            aria-label={dict.dashboard.aiImageUrlPlaceholder}
            disabled={aiQuotaRemaining <= 0}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          />
          <p className="text-xs text-slate-400">{dict.dashboard.aiImageHint}</p>
          <button
            type="submit"
            disabled={aiLoading || aiQuotaRemaining <= 0}
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
        {chatHistory.length > 0 && (
          <div className="mt-6 border-t border-slate-700 pt-4">
            <h4 className="text-xs font-semibold text-slate-400">تاریخچه گفتگو</h4>
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg px-3 py-2 text-xs ${
                    msg.role === "user"
                      ? "bg-cyan-900 text-cyan-100 ml-6"
                      : "bg-slate-800 text-slate-200 mr-6"
                  }`}
                >
                  <p className="line-clamp-3">{msg.content}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(msg.createdAt).toLocaleTimeString("fa-IR")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {message && <p className="text-sm font-medium text-slate-700">{message}</p>}
    </div>
  );
}
