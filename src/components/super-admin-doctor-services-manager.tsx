"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getTRPCClient } from "@/trpc/client";

type Props = {
  locale: Locale;
};

type Doctor = {
  id: string;
  username?: string;
  email?: string;
};

type ServiceItem = {
  serviceKey: string;
  serviceLabel: string;
  isActive: boolean;
};

const AVAILABLE_SERVICES = [
  { key: "consultation", labelEn: "Consultation", labelAr: "استشارة", labelFa: "مشاوره" },
  { key: "botox", labelEn: "Botox", labelAr: "البوتوكس", labelFa: "بوتاکس" },
  { key: "filler", labelEn: "Filler", labelAr: "الفيلر", labelFa: "فیلر" },
  { key: "laser", labelEn: "Laser Treatment", labelAr: "علاج بالليزر", labelFa: "لیزر درمانی" },
  { key: "skin-care", labelEn: "Skin Care", labelAr: "العناية بالبشرة", labelFa: "مراقبت از پوست" },
  { key: "hair-removal", labelEn: "Hair Removal", labelAr: "إزالة الشعر", labelFa: "لیزر موهای زائد" },
  { key: "facial", labelEn: "Facial Treatment", labelAr: "علاج الوجه", labelFa: "فیشال" },
  { key: "body-contouring", labelEn: "Body Contouring", labelAr: "نحت الجسم", labelFa: "کانتورینگ بدن" },
];

function getCopy(locale: Locale) {
  if (locale === "en") {
    return {
      title: "Doctor Services Management",
      subtitle: "Assign available services to each doctor. Only assigned services will appear in appointment forms.",
      selectDoctor: "Select Doctor",
      noDoctor: "No doctor selected",
      noDoctors: "No doctors found",
      availableServices: "Available Services",
      saveButton: "Save Services",
      loading: "Loading...",
      saveSuccess: "Services saved successfully.",
      selectPlaceholder: "-- Select a doctor --",
    };
  }

  if (locale === "ar") {
    return {
      title: "إدارة خدمات الأطباء",
      subtitle: "تعيين الخدمات المتاحة لكل طبيب. ستظهر الخدمات المعينة فقط في نماذج الحجز.",
      selectDoctor: "اختر طبيب",
      noDoctor: "لم يتم اختيار طبيب",
      noDoctors: "لا يوجد أطباء",
      availableServices: "الخدمات المتاحة",
      saveButton: "حفظ الخدمات",
      loading: "جاري التحميل...",
      saveSuccess: "تم حفظ الخدمات بنجاح.",
      selectPlaceholder: "-- اختر طبيب --",
    };
  }

  return {
    title: "مدیریت خدمات پزشکان",
    subtitle: "خدمات مجاز هر پزشک را تعیین کنید. فقط خدمات تخصیص‌یافته در فرم نوبت نمایش داده می‌شوند.",
    selectDoctor: "انتخاب پزشک",
    noDoctor: "پزشکی انتخاب نشده",
    noDoctors: "پزشکی یافت نشد",
    availableServices: "خدمات موجود",
    saveButton: "ذخیره خدمات",
    loading: "در حال بارگذاری...",
    saveSuccess: "خدمات با موفقیت ذخیره شد.",
    selectPlaceholder: "-- انتخاب پزشک --",
  };
}

function getServiceLabel(service: typeof AVAILABLE_SERVICES[0], locale: Locale): string {
  if (locale === "en") return service.labelEn;
  if (locale === "ar") return service.labelAr;
  return service.labelFa;
}

export function SuperAdminDoctorServicesManager({ locale }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const copy = getCopy(locale);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const users = await trpc.auth.listUsers.query();
        const doctorUsers = users.filter((u) => u.role === "DOCTOR");
        setDoctors(doctorUsers as Doctor[]);
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [trpc]);

  useEffect(() => {
    if (!selectedDoctorId) {
      setServices([]);
      return;
    }

    void (async () => {
      try {
        const data = await trpc.doctorService.listForDoctor.query({ doctorUserId: selectedDoctorId });
        const existingServices = new Map(data.map((s) => [s.serviceKey, s]));

        setServices(
          AVAILABLE_SERVICES.map((s) => {
            const existing = existingServices.get(s.key);
            return {
              serviceKey: s.key,
              serviceLabel: getServiceLabel(s, locale),
              isActive: existing?.isActive ?? false,
            };
          })
        );
      } catch {
        setServices(
          AVAILABLE_SERVICES.map((s) => ({
            serviceKey: s.key,
            serviceLabel: getServiceLabel(s, locale),
            isActive: false,
          }))
        );
      }
    })();
  }, [selectedDoctorId, trpc, locale]);

  function toggleService(serviceKey: string) {
    setServices((prev) =>
      prev.map((s) => (s.serviceKey === serviceKey ? { ...s, isActive: !s.isActive } : s))
    );
  }

  async function save() {
    if (!selectedDoctorId) return;

    setMessage("");
    try {
      await trpc.doctorService.setForDoctor.mutate({
        doctorUserId: selectedDoctorId,
        services,
      });
      setMessage(copy.saveSuccess);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error saving services");
    }
  }

  if (loading) {
    return (
      <section className="mb-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
        <p className="text-sm text-slate-600">{copy.loading}</p>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
      <h2 className="text-2xl font-bold text-slate-900">{copy.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{copy.subtitle}</p>

      <div className="mt-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">{copy.selectDoctor}</span>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{copy.selectPlaceholder}</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.username || doctor.email || doctor.id}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedDoctorId && (
        <>
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900">{copy.availableServices}</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {services.map((service) => (
                <label
                  key={service.serviceKey}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={service.isActive}
                    onChange={() => toggleService(service.serviceKey)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-slate-900">{service.serviceLabel}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void save()}
            className="mt-5 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white"
          >
            {copy.saveButton}
          </button>
        </>
      )}

      {message && <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>}
    </section>
  );
}
