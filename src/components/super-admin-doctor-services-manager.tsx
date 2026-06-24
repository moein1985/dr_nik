"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getTRPCClient } from "@/trpc/client";
import { getDictionary } from "@/i18n/dictionary";

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
  { key: "consultation" },
  { key: "botox" },
  { key: "filler" },
  { key: "laser" },
  { key: "skin-care" },
  { key: "hair-removal" },
  { key: "facial" },
  { key: "body-contouring" },
] as const;

export function SuperAdminDoctorServicesManager({ locale }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const dict = getDictionary(locale);
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
            const keyMap: Record<string, keyof typeof dict.doctorServices.services> = {
              "consultation": "consultation",
              "botox": "botox",
              "filler": "filler",
              "laser": "laser",
              "skin-care": "skinCare",
              "hair-removal": "hairRemoval",
              "facial": "facial",
              "body-contouring": "bodyContouring",
            };
            const dictKey = keyMap[s.key] || "consultation";
            return {
              serviceKey: s.key,
              serviceLabel: dict.doctorServices.services[dictKey],
              isActive: existing?.isActive ?? false,
            };
          })
        );
      } catch {
        setServices(
          AVAILABLE_SERVICES.map((s) => {
            const keyMap: Record<string, keyof typeof dict.doctorServices.services> = {
              "consultation": "consultation",
              "botox": "botox",
              "filler": "filler",
              "laser": "laser",
              "skin-care": "skinCare",
              "hair-removal": "hairRemoval",
              "facial": "facial",
              "body-contouring": "bodyContouring",
            };
            const dictKey = keyMap[s.key] || "consultation";
            return {
              serviceKey: s.key,
              serviceLabel: dict.doctorServices.services[dictKey],
              isActive: false,
            };
          })
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
      setMessage(dict.doctorServices.saveSuccess);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.doctorServices.errorSaving ?? "Error saving services");
    }
  }

  if (loading) {
    return (
      <section className="mb-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
        <p className="text-sm text-slate-600">{dict.doctorServices.loading}</p>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
      <h2 className="text-2xl font-bold text-slate-900">{dict.doctorServices.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{dict.doctorServices.subtitle}</p>

      <div className="mt-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">{dict.doctorServices.selectDoctor}</span>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{dict.doctorServices.selectPlaceholder}</option>
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
            <h3 className="text-sm font-semibold text-slate-900">{dict.doctorServices.availableServices}</h3>
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
            {dict.doctorServices.saveButton}
          </button>
        </>
      )}

      {message && <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>}
    </section>
  );
}
