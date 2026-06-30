"use client";

import { useEffect, useMemo, useState } from "react";
import { AppointmentDateTimeInput } from "@/components/appointment-date-time-input";
import { WeeklyCalendar } from "@/components/weekly-calendar";
import { ChangePasswordForm } from "@/components/change-password-form";
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
  requestedAt: Date;
  serviceName: string;
  notes?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
};

type StaffTab = "calendar" | "list" | "create" | "media-review";

type MediaItem = {
  id: string;
  title: string;
  url: string;
  category: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
};

type VideoItem = {
  id: string;
  title: string;
  url: string;
  coverImage?: string | null;
  doctorSlug: string;
  createdAt: Date;
};

type DoctorScope = {
  id: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
};

const getDoctorScopeLabel = (doctor: DoctorScope) =>
  doctor.username?.trim() || doctor.email?.trim() || doctor.phoneNumber?.trim() || doctor.id;

function getScopeCopy(locale: Locale) {
  if (locale === "en") {
    return {
      doctorScopeLabel: "Doctor scope",
      noDoctorScope: "No doctor scope is assigned to your account.",
      chooseDoctorFirst: "Please select a doctor scope first.",
    };
  }

  if (locale === "ar") {
    return {
      doctorScopeLabel: "نطاق الطبيب",
      noDoctorScope: "لا يوجد أي طبيب مخصص لحسابك.",
      chooseDoctorFirst: "يرجى اختيار نطاق طبيب أولاً.",
    };
  }

  return {
    doctorScopeLabel: "دامنه پزشک",
    noDoctorScope: "هیچ پزشکی برای حساب شما تخصیص داده نشده است.",
    chooseDoctorFirst: "ابتدا یک دامنه پزشک انتخاب کنید.",
  };
}

export function StaffDashboardPanel({ dict, locale }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const scopeCopy = getScopeCopy(locale);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<"STAFF" | "DOCTOR" | "SUPER_ADMIN" | null>(null);
  const [doctorScopes, setDoctorScopes] = useState<DoctorScope[]>([]);
  const [selectedDoctorUserId, setSelectedDoctorUserId] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
  const [activeTab, setActiveTab] = useState<StaffTab>("calendar");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Appointment["status"]>("ALL");

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [doctorName, setDoctorName] = useState<string>(dict.home.doctorName);
  const [serviceName, setServiceName] = useState("");
  const [requestedAtIso, setRequestedAtIso] = useState("");
  const [notes, setNotes] = useState("");
  const [doctorServices, setDoctorServices] = useState<Array<{ serviceKey: string; serviceLabel: string; isActive: boolean }>>([]);
  
  // Media creation states
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCategory, setMediaCategory] = useState<string>(dict.pages.galleryCategories[0] || "قبل و بعد");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoCoverImage, setVideoCoverImage] = useState("");
  const [videoDoctorSlug, setVideoDoctorSlug] = useState("dr-nik");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPatientName, setEditPatientName] = useState("");
  const [editPatientPhone, setEditPatientPhone] = useState("");
  const [editDoctorUserId, setEditDoctorUserId] = useState("");
  const [editDoctorName, setEditDoctorName] = useState<string>("");
  const [editServiceName, setEditServiceName] = useState("");
  const [editRequestedAtIso, setEditRequestedAtIso] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesStatus = statusFilter === "ALL" || appointment.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${appointment.patientName} ${appointment.patientPhone} ${appointment.doctorName} ${appointment.serviceName}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [appointments, searchTerm, statusFilter]);

  async function loadVideosForSlug(doctorSlug: string) {
    try {
      const videoList = await trpc.video.getByDoctorSlug.query({ doctorSlug });
      setVideoItems(videoList as VideoItem[]);
    } catch (error) {
      console.warn("Failed to load portfolio videos", error);
      setVideoItems([]);
    }
  }

  function resolveSelectedDoctorName(doctorId: string, scopes: DoctorScope[] = doctorScopes): string {
    const target = scopes.find((item) => item.id === doctorId);
    return target ? getDoctorScopeLabel(target) : doctorName;
  }

  async function load(selectedDoctorId?: string) {
    setLoading(true);
    try {
      const me = await trpc.auth.me.query();
      const ok = me.role === "STAFF" || me.role === "DOCTOR" || me.role === "SUPER_ADMIN";
      setAuthorized(ok);
      setUserRole(ok ? (me.role as "STAFF" | "DOCTOR" | "SUPER_ADMIN") : null);

      if (!ok) {
        setLoading(false);
        return;
      }

      const scopes = await trpc.auth.listMyDoctorScopes.query();
      const nextScopes = scopes as DoctorScope[];
      setDoctorScopes(nextScopes);

      const candidateDoctorId = selectedDoctorId ?? selectedDoctorUserId;
      const activeDoctorId =
        (candidateDoctorId && nextScopes.some((item) => item.id === candidateDoctorId)
          ? candidateDoctorId
          : nextScopes[0]?.id) ?? "";

      setSelectedDoctorUserId(activeDoctorId);
      if (activeDoctorId) {
        setDoctorName(resolveSelectedDoctorName(activeDoctorId, nextScopes));
      }

      const list = await trpc.appointment.list.query(
        activeDoctorId ? { doctorUserId: activeDoctorId } : undefined,
      );
      setAppointments(list as Appointment[]);

      const mediaList = await trpc.media.getPending.query();
      setMediaItems(mediaList as MediaItem[]);

      await loadVideosForSlug("dr-nik");
    } catch {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!selectedDoctorUserId) {
      setDoctorServices([]);
      return;
    }

    const selected = doctorScopes.find((item) => item.id === selectedDoctorUserId);
    if (selected) {
      setDoctorName(getDoctorScopeLabel(selected));
    }

    void (async () => {
      try {
        const services = await trpc.doctorService.listForDoctor.query({ doctorUserId: selectedDoctorUserId });
        setDoctorServices(services as Array<{ serviceKey: string; serviceLabel: string; isActive: boolean }>);
      } catch {
        setDoctorServices([]);
      }
    })();
  }, [selectedDoctorUserId, doctorScopes, trpc]);

  async function handleDoctorScopeChange(doctorUserId: string) {
    setSelectedDoctorUserId(doctorUserId);
    setEditingId(null);
    setMessage("");
    await load(doctorUserId);
  }

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!requestedAtIso) {
      setMessage(dict.dashboard.invalidDateTime);
      return;
    }

    if (!selectedDoctorUserId) {
      setMessage(scopeCopy.chooseDoctorFirst);
      return;
    }

    try {
      await trpc.appointment.createByStaff.mutate({
        doctorUserId: selectedDoctorUserId,
        patientName,
        patientPhone,
        doctorName,
        serviceName,
        requestedAt: new Date(requestedAtIso),
        notes: notes || undefined,
      });

      setPatientName("");
      setPatientPhone("");
      setDoctorName(dict.home.doctorName);
      setServiceName("");
      setRequestedAtIso("");
      setNotes("");
      setActiveTab("calendar");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    }
  }

  async function updateStatus(id: string, status: Appointment["status"]) {
    try {
      await trpc.appointment.updateStatus.mutate({ id, status });
      await load(selectedDoctorUserId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    }
  }

  async function remove(id: string) {
    try {
      await trpc.appointment.deleteByStaff.mutate({ id });
      await load(selectedDoctorUserId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    }
  }

  async function handleCreateMedia(e: React.FormEvent) {
    e.preventDefault();
    try {
      await trpc.media.create.mutate({
        title: mediaTitle,
        url: mediaUrl,
        category: mediaCategory,
      });
      setMediaTitle("");
      setMediaUrl("");
      const mediaList = await trpc.media.getPending.query();
      setMediaItems(mediaList as MediaItem[]);
      setMessage(dict.dashboard.imageAddedSuccess);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : dict.dashboard.errorSavingImages);
    }
  }

  async function handleUpdateMediaStatus(id: string, status: "APPROVED" | "REJECTED") {
    try {
      await trpc.media.updateStatus.mutate({ id, status });
      const mediaList = await trpc.media.getPending.query();
      setMediaItems(mediaList as MediaItem[]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : dict.dashboard.errorUpdatingStatus);
    }
  }

  async function handleCreateVideo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      await trpc.video.create.mutate({
        title: videoTitle,
        url: videoUrl,
        coverImage: videoCoverImage || undefined,
        doctorSlug: videoDoctorSlug || "dr-nik",
      });

      const nextSlug = videoDoctorSlug.trim() || "dr-nik";
      setVideoDoctorSlug(nextSlug);
      setVideoTitle("");
      setVideoUrl("");
      setVideoCoverImage("");

      await loadVideosForSlug(nextSlug);
      setMessage(dict.dashboard.videoAddedSuccess);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : dict.dashboard.errorSavingVideo);
    }
  }

  async function handleDeleteVideo(id: string, doctorSlug: string) {
    try {
      await trpc.video.delete.mutate({ id });
      await loadVideosForSlug(doctorSlug);
      setMessage("ویدیو با موفقیت حذف شد.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : dict.dashboard.errorDeletingVideo);
    }
  }

  function startEdit(item: Appointment) {
    setActiveTab("list");
    setEditingId(item.id);
    setEditPatientName(item.patientName);
    setEditPatientPhone(item.patientPhone);
    setEditDoctorUserId(item.doctorUserId ?? selectedDoctorUserId);
    setEditDoctorName(item.doctorName);
    setEditServiceName(item.serviceName);
    setEditRequestedAtIso(new Date(item.requestedAt).toISOString());
    setEditNotes(item.notes ?? "");
  }

  function resetEdit() {
    setEditingId(null);
    setEditPatientName("");
    setEditPatientPhone("");
    setEditDoctorUserId("");
    setEditDoctorName("");
    setEditServiceName("");
    setEditRequestedAtIso("");
    setEditNotes("");
  }

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) {
      return;
    }

    if (!editRequestedAtIso) {
      setMessage(dict.dashboard.invalidDateTime);
      return;
    }

    if (!editDoctorUserId) {
      setMessage(scopeCopy.chooseDoctorFirst);
      return;
    }

    try {
      await trpc.appointment.updateByStaff.mutate({
        id: editingId,
        doctorUserId: editDoctorUserId,
        patientName: editPatientName,
        patientPhone: editPatientPhone,
        doctorName: editDoctorName,
        serviceName: editServiceName,
        requestedAt: new Date(editRequestedAtIso),
        notes: editNotes || undefined,
      });

      resetEdit();
      await load(selectedDoctorUserId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    }
  }

  function openCreateAt(date: Date) {
    const defaultTime = new Date(date);
    defaultTime.setUTCHours(9, 0, 0, 0);
    setRequestedAtIso(defaultTime.toISOString());
    setActiveTab("create");
  }

  if (loading) {
    return <p className="mt-6 text-sm text-slate-600">{dict.dashboard.loading}</p>;
  }

  if (!authorized) {
    return <p className="mt-6 text-sm font-medium text-rose-700">{dict.dashboard.unauthorized}</p>;
  }

  return (
    <div className="mt-8 space-y-8">
      <ChangePasswordForm locale={locale} />

      <section className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 lg:p-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "calendar" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {dict.dashboard.calendarTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "list" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {dict.dashboard.listTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "create" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {dict.dashboard.createTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("media-review")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "media-review" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {locale === "en" ? "Media Review" : locale === "ar" ? "مراجعة الصور" : "تایید مدیا"}
          </button>
        </div>

        <div className="mt-4 max-w-lg">
          <label className="mb-1 block text-xs font-semibold text-slate-700">{scopeCopy.doctorScopeLabel}</label>
          {doctorScopes.length === 0 ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {scopeCopy.noDoctorScope}
            </p>
          ) : (
            <select
              value={selectedDoctorUserId}
              onChange={(event) => {
                void handleDoctorScopeChange(event.target.value);
              }}
              title={scopeCopy.doctorScopeLabel}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              disabled={userRole === "DOCTOR"}
            >
              {doctorScopes.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {getDoctorScopeLabel(doctor)}
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      {activeTab === "calendar" && (
        <WeeklyCalendar
          locale={locale}
          dict={dict}
          appointments={appointments}
          onEdit={startEdit}
          onDelete={(id) => {
            void remove(id);
          }}
          onUpdateStatus={(id, status) => {
            void updateStatus(id, status);
          }}
          onCreateAt={openCreateAt}
        />
      )}

      {activeTab === "create" && (
        <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
          <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.createTitle}</h2>
          {selectedDoctorUserId && (
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-xs text-blue-800">
                {locale === "fa" 
                  ? "💡 توجه: دکتر انتخابی باید بازه‌های کاری خود را در پنل دکتر تعریف کرده باشد. نوبت‌ها فقط در روزها و ساعات تعریف‌شده قابل رزرو هستند."
                  : locale === "ar"
                  ? "💡 ملاحظة: يجب على الطبيب المحدد تحديد ساعات عمله في لوحة الطبيب. يمكن حجز المواعيد فقط في الأيام والأوقات المحددة."
                  : "💡 Note: The selected doctor must have defined their working hours in the doctor panel. Appointments can only be booked during defined days and times."}
              </p>
            </div>
          )}
          <form onSubmit={submitCreate} className="mt-5 grid gap-3 md:grid-cols-2">
            <input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder={dict.dashboard.patientName} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" required />
            <input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder={dict.dashboard.patientPhone} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" required />
            <input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder={dict.dashboard.doctorName} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" required />
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              required
              disabled={doctorServices.filter((s) => s.isActive).length === 0}
            >
              <option value="">
                {doctorServices.filter((s) => s.isActive).length === 0 ? dict.dashboard.noServicesForDoctor : dict.dashboard.selectService}
              </option>
              {doctorServices.filter((s) => s.isActive).map((service) => (
                <option key={service.serviceKey} value={service.serviceLabel}>
                  {service.serviceLabel}
                </option>
              ))}
            </select>
            <AppointmentDateTimeInput
              locale={locale}
              dict={dict}
              valueIso={requestedAtIso}
              onChangeIso={setRequestedAtIso}
            />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={dict.dashboard.notes} className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2 text-sm" rows={3} />
            <button className="md:col-span-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">{dict.dashboard.createButton}</button>
          </form>
        </section>
      )}

      {activeTab === "list" && (
        <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
          <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.listTitle}</h2>
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
          {filteredAppointments.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">{dict.dashboard.noAppointments}</p>
          ) : (
            <div className="mt-4 space-y-4">
              {(() => {
                const groupedByDate = filteredAppointments.reduce((acc, item) => {
                  const dateKey = new Date(item.requestedAt).toDateString();
                  if (!acc[dateKey]) {
                    acc[dateKey] = [];
                  }
                  acc[dateKey].push(item);
                  return acc;
                }, {} as Record<string, typeof filteredAppointments>);

                const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
                  new Date(b).getTime() - new Date(a).getTime()
                );

                return sortedDates.map((dateKey) => {
                  const dayAppointments = groupedByDate[dateKey];
                  if (!dayAppointments) return null;
                  const isBusyDay = dayAppointments.length >= 5;
                  const formattedDate = formatLocalizedDate(locale, new Date(dateKey));

                  return (
                    <div key={dateKey} className="rounded-2xl border border-slate-200 overflow-hidden">
                      <div className={`px-4 py-2 flex items-center justify-between ${isBusyDay ? 'bg-amber-50 border-b border-amber-200' : 'bg-slate-50 border-b border-slate-200'}`}>
                        <span className="text-sm font-semibold text-slate-900">{formattedDate}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${isBusyDay ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                          {dayAppointments.length} {locale === "en" ? "appointments" : locale === "ar" ? "مواعيد" : "نوبت"}
                        </span>
                      </div>
                      <div className="p-3 space-y-2">
                        {dayAppointments.map((item) => (
                          <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                            <p className="text-sm font-semibold text-slate-900">{item.patientName}</p>
                            <p className="text-xs text-slate-600">{item.patientPhone} | {dict.dashboard.doctorName}: {item.doctorName}</p>
                            <p className="text-xs text-slate-600">{item.serviceName}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatLocalizedDate(locale, new Date(item.requestedAt))}</p>
                            {item.notes && <p className="mt-1 text-xs text-slate-500">{dict.dashboard.notes}: {item.notes}</p>}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <button type="button" onClick={() => startEdit(item)} className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white">{dict.dashboard.editButton}</button>
                              <button type="button" onClick={() => updateStatus(item.id, "PENDING")} className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">{dict.dashboard.statusPending}</button>
                              <button type="button" onClick={() => updateStatus(item.id, "CONFIRMED")} className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">{dict.dashboard.statusConfirmed}</button>
                              <button type="button" onClick={() => updateStatus(item.id, "CANCELLED")} className="rounded-lg bg-amber-600 px-2 py-1 text-xs font-semibold text-white">{dict.dashboard.statusCancelled}</button>
                              <button type="button" onClick={() => remove(item.id)} className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white">{dict.dashboard.deleteButton}</button>
                            </div>

                            {editingId === item.id && (
                              <form onSubmit={submitEdit} className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 md:grid-cols-2">
                                <input value={editPatientName} onChange={(event) => setEditPatientName(event.target.value)} placeholder={dict.dashboard.patientName} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs" required />
                                <input value={editPatientPhone} onChange={(event) => setEditPatientPhone(event.target.value)} placeholder={dict.dashboard.patientPhone} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs" required />
                                <select
                                  value={editDoctorUserId}
                                  onChange={(event) => {
                                    const nextDoctorUserId = event.target.value;
                                    setEditDoctorUserId(nextDoctorUserId);
                                    setEditDoctorName(resolveSelectedDoctorName(nextDoctorUserId));
                                  }}
                                  aria-label={scopeCopy.doctorScopeLabel}
                                  title={scopeCopy.doctorScopeLabel}
                                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                                  disabled={userRole === "DOCTOR"}
                                >
                                  {doctorScopes.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                      {getDoctorScopeLabel(doctor)}
                                    </option>
                                  ))}
                                </select>
                                <input value={editDoctorName} onChange={(event) => setEditDoctorName(event.target.value)} placeholder={dict.dashboard.doctorName} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs" required />
                                <select
                                  value={editServiceName}
                                  onChange={(event) => setEditServiceName(event.target.value)}
                                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                                  required
                                  disabled={doctorServices.filter((s) => s.isActive).length === 0}
                                >
                                  <option value="">
                                    {doctorServices.filter((s) => s.isActive).length === 0 ? dict.dashboard.noServicesForDoctor : dict.dashboard.selectService}
                                  </option>
                                  {doctorServices.filter((s) => s.isActive).map((service) => (
                                    <option key={service.serviceKey} value={service.serviceLabel}>
                                      {service.serviceLabel}
                                    </option>
                                  ))}
                                </select>
                                <AppointmentDateTimeInput locale={locale} dict={dict} valueIso={editRequestedAtIso} onChangeIso={setEditRequestedAtIso} />
                                <textarea value={editNotes} onChange={(event) => setEditNotes(event.target.value)} placeholder={dict.dashboard.notes} className="md:col-span-2 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" rows={2} />
                                <div className="md:col-span-2 flex gap-2">
                                  <button type="submit" className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white">{dict.dashboard.saveButton}</button>
                                  <button type="button" onClick={resetEdit} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">{dict.dashboard.closeButton}</button>
                                </div>
                              </form>
                            )}
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </section>
      )}

      {activeTab === "media-review" && (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8">
          <h2 className="text-2xl font-bold text-slate-950 mb-6 border-b pb-3">
            {locale === "en" ? "Media Approval Panel" : locale === "ar" ? "لوحة مراجعة الصور" : "مدیریت و تایید تصاویر گالری"}
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            {locale === "en"
              ? "Pending items are the only ones shown here, so staff can approve or reject the next real assets without waiting for the public gallery to refresh."
              : locale === "ar"
                ? "يتم عرض العناصر المعلقة فقط هنا، حتى يتمكن الفريق من الموافقة أو الرفض دون انتظار تحديث المعرض العام."
                : "فقط آیتم‌های در انتظار در این بخش نمایش داده می‌شود تا تیم بتواند بدون انتظار بازسازی گالری عمومی، آن‌ها را تایید یا رد کند."}
          </p>

          <form onSubmit={handleCreateVideo} className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              {locale === "en" ? "Add Portfolio Video" : locale === "ar" ? "إضافة فيديو للملف الشخصي" : "ثبت ویدیو نمونه کار"}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs text-slate-600">
                <span className="mb-1 block font-semibold">{locale === "en" ? "Video Title" : locale === "ar" ? "عنوان الفيديو" : "عنوان ویدیو"}</span>
                <input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-slate-800" />
              </label>
              <label className="text-xs text-slate-600">
                <span className="mb-1 block font-semibold">{locale === "en" ? "Video URL" : locale === "ar" ? "رابط الفيديو" : "آدرس ویدیو"}</span>
                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-slate-800" />
              </label>
              <label className="text-xs text-slate-600">
                <span className="mb-1 block font-semibold">{locale === "en" ? "Cover Image" : locale === "ar" ? "صورة الغلاف" : "تصویر کاور"}</span>
                <input value={videoCoverImage} onChange={(e) => setVideoCoverImage(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-slate-800" placeholder="/home/optimized/hero-main.webp" />
              </label>
              <label className="text-xs text-slate-600">
                <span className="mb-1 block font-semibold">{locale === "en" ? "Doctor Slug" : locale === "ar" ? "اسم الطبيب المختصر" : "اسلاگ پزشک"}</span>
                <input value={videoDoctorSlug} onChange={(e) => setVideoDoctorSlug(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-slate-800" />
              </label>
            </div>
            <button className="mt-4 rounded-xl bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700 transition">
              {locale === "en" ? "Save Video" : locale === "ar" ? "حفظ الفيديو" : "ثبت ویدیو"}
            </button>
          </form>

          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-base font-bold text-slate-800">
              {locale === "en" ? "Existing Portfolio Videos" : locale === "ar" ? "الفيديوهات الحالية" : "ویدیوهای ثبت‌شده"}
            </h3>
            {videoItems.length === 0 ? (
              <p className="text-xs text-slate-500">{locale === "en" ? "No video entries exist yet for this doctor." : locale === "ar" ? "لا توجد فيديوهات بعد لهذا الطبيب." : "هنوز ویدیویی برای این پزشک ثبت نشده است."}</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {videoItems.map((video) => (
                  <article key={video.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                      {video.coverImage ? <img src={video.coverImage} alt={video.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">▶</div>}
                    </div>
                    <h4 className="mt-3 text-xs font-bold text-slate-800">{video.title}</h4>
                    <p className="mt-1 text-[10px] text-slate-500">{video.doctorSlug}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <a href={video.url} target="_blank" rel="noreferrer" className="inline-flex text-xs font-semibold text-cyan-700 hover:text-cyan-800">{locale === "en" ? "Open video" : locale === "ar" ? "فتح الفيديو" : "مشاهده ویدیو"}</a>
                      <button
                        type="button"
                        onClick={() => void handleDeleteVideo(video.id, video.doctorSlug)}
                        className="rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-rose-700"
                      >
                        {locale === "en" ? "Delete" : locale === "ar" ? "حذف" : "حذف"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Create Test Media Form */}
          <form onSubmit={handleCreateMedia} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              {locale === "en" ? "Add Clinic Photo" : locale === "ar" ? "إضافة صورة للعيادة" : "ثبت عکس جدید برای گالری کلینیک"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {locale === "en" ? "Photo Title" : locale === "ar" ? "عنوان الصورة" : "عنوان تصویر"}
                </label>
                <input
                  type="text"
                  required
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder={locale === "en" ? "e.g., Clinic Environment" : "مثال: محیط کلینیک"}
                  className="w-full text-slate-800 rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {locale === "en" ? "Image URL" : locale === "ar" ? "رابط الصورة" : "آدرس اینترنتی یا مسیر عکس"}
                </label>
                <input
                  type="text"
                  required
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="/home/optimized/hero-main.webp"
                  className="w-full text-slate-800 rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {locale === "en" ? "Category" : locale === "ar" ? "التصنيف" : "دسته‌بندی"}
                </label>
                <select
                  value={mediaCategory}
                  onChange={(e) => setMediaCategory(e.target.value)}
                  aria-label={locale === "en" ? "Category" : locale === "ar" ? "التصنيف" : "دسته‌بندی"}
                  title={locale === "en" ? "Category" : locale === "ar" ? "التصنيف" : "دسته‌بندی"}
                  className="w-full text-slate-850 rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {dict.pages.galleryCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="mt-4 rounded-xl bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700 transition">
              {locale === "en" ? "Save as Pending" : locale === "ar" ? "حفظ كمعلق" : "ثبت تصویر (در انتظار تایید)"}
            </button>
          </form>

          {/* Pending Media List */}
          <h3 className="text-base font-bold text-slate-800 mb-4">
            {locale === "en" ? "Pending Approvals" : locale === "ar" ? "الطلبات المعلقة" : "لیست موارد در انتظار تایید"}
          </h3>

          {mediaItems.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center">
              {locale === "en" ? "No assets waiting for action right now." : locale === "ar" ? "لا توجد ملفات في انتظار المراجعة." : "تصویری جهت بررسی وجود ندارد."}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {mediaItems.map((media) => (
                <article key={media.id} className="border border-slate-200 rounded-2xl p-3 bg-white shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="relative aspect-video w-full rounded-xl bg-slate-100 overflow-hidden border border-slate-100">
                      <img
                        src={media.url}
                        alt={media.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{media.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium inline-block bg-slate-100 px-2 py-0.5 rounded mt-1">
                        {media.category}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => void handleUpdateMediaStatus(media.id, "APPROVED")}
                      className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5 font-bold transition"
                    >
                      {locale === "en" ? "Approve" : locale === "ar" ? "موافق" : "تایید"}
                    </button>
                    <button
                      onClick={() => void handleUpdateMediaStatus(media.id, "REJECTED")}
                      className="flex-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs py-1.5 font-bold transition"
                    >
                      {locale === "en" ? "Reject" : locale === "ar" ? "رفض" : "عدم تایید"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {message && <p className="text-sm font-medium text-slate-700">{message}</p>}
    </div>
  );
}
