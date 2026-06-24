"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getTRPCClient } from "@/trpc/client";

type Props = {
  locale: Locale;
};

type Slot = {
  weekday: number;
  startMinute: number;
  endMinute: number;
  isActive: boolean;
};

const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const WEEKDAYS_FA = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];

function getCopy(locale: Locale) {
  if (locale === "en") {
    return {
      title: "Working Hours Schedule",
      subtitle: "Define your weekly availability. Patients and staff can only book appointments during these time slots.",
      addSlotButton: "Add Time Slot",
      saveButton: "Save Schedule",
      from: "From",
      to: "To",
      active: "Active",
      inactive: "Inactive",
      removeButton: "Remove",
      loading: "Loading...",
      saveSuccess: "Schedule saved successfully.",
      noSlots: "No time slots defined yet. Add your first slot to get started.",
      hint: "Times are in 24-hour format (e.g., 08:00 to 14:00).",
      errorSlotEndTime: "Error in slot {slot}: End time must be after start time",
      errorSaving: "Error saving schedule",
    };
  }

  if (locale === "ar") {
    return {
      title: "جدول ساعات العمل",
      subtitle: "حدد توفرك الأسبوعي. يمكن للمرضى والموظفين حجز المواعيد فقط خلال هذه الفترات الزمنية.",
      addSlotButton: "إضافة فترة زمنية",
      saveButton: "حفظ الجدول",
      from: "من",
      to: "إلى",
      active: "نشط",
      inactive: "غير نشط",
      removeButton: "إزالة",
      loading: "جاري التحميل...",
      saveSuccess: "تم حفظ الجدول بنجاح.",
      noSlots: "لم يتم تحديد أي فترات زمنية بعد. أضف أول فترة للبدء.",
      hint: "الأوقات بتنسيق 24 ساعة (مثال: 08:00 إلى 14:00).",
      errorSlotEndTime: "خطأ في الفتحة {slot}: يجب أن يكون وقت النهاية بعد وقت البدء",
      errorSaving: "خطأ في حفظ الجدول",
    };
  }

  return {
    title: "برنامه ساعات کاری",
    subtitle: "بازه‌های کاری هفتگی خود را تعریف کنید. بیماران و منشی‌ها فقط در این بازه‌ها می‌توانند نوبت رزرو کنند.",
    addSlotButton: "افزودن بازه زمانی",
    saveButton: "ذخیره برنامه",
    from: "از",
    to: "تا",
    active: "فعال",
    inactive: "غیرفعال",
    removeButton: "حذف",
    loading: "در حال بارگذاری...",
    saveSuccess: "برنامه با موفقیت ذخیره شد.",
    noSlots: "هنوز بازه زمانی تعریف نشده. اولین بازه را اضافه کنید.",
    hint: "زمان‌ها به فرمت ۲۴ ساعته هستند (مثال: 08:00 تا 14:00).",
    errorSlotEndTime: "خطا در بازه {slot}: ساعت پایان باید بعد از ساعت شروع باشد",
    errorSaving: "خطا در ذخیره برنامه",
  };
}

function getWeekdayName(weekday: number, locale: Locale): string {
  if (locale === "en") return WEEKDAYS_EN[weekday] ?? `Day ${weekday}`;
  if (locale === "ar") return WEEKDAYS_AR[weekday] ?? `يوم ${weekday}`;
  return WEEKDAYS_FA[weekday] ?? `روز ${weekday}`;
}

function minuteToTime(minute: number): string {
  const hours = Math.floor(minute / 60);
  const mins = minute % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function timeToMinute(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (mins ?? 0);
}

export function DoctorAvailabilityManager({ locale }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const copy = getCopy(locale);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const data = await trpc.doctorAvailability.getMy.query();
        setSlots(data as Slot[]);
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [trpc]);

  function addSlot() {
    setSlots((prev) => [
      ...prev,
      { weekday: 0, startMinute: 480, endMinute: 840, isActive: true },
    ]);
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, updates: Partial<Slot>) {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, ...updates } : slot))
    );
  }

  async function save() {
    setMessage("");
    
    // Validate time slots
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (slot && slot.startMinute >= slot.endMinute) {
        const errorMsg = copy.errorSlotEndTime.replace("{slot}", String(i + 1));
        setMessage(errorMsg);
        return;
      }
    }
    
    try {
      await trpc.doctorAvailability.setMy.mutate({ slots });
      setMessage(copy.saveSuccess);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.errorSaving ?? "Error saving schedule");
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
      <p className="mt-1 text-xs text-slate-500">{copy.hint}</p>

      <div className="mt-5 space-y-3">
        {slots.length === 0 ? (
          <p className="text-sm text-slate-600">{copy.noSlots}</p>
        ) : (
          slots.map((slot, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto_auto_auto_auto]"
            >
              <select
                value={slot.weekday}
                onChange={(e) => updateSlot(index, { weekday: Number(e.target.value) })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <option key={day} value={day}>
                    {getWeekdayName(day, locale)}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">{copy.from}</span>
                <input
                  type="time"
                  value={minuteToTime(slot.startMinute)}
                  onChange={(e) => updateSlot(index, { startMinute: timeToMinute(e.target.value) })}
                  className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                />
              </label>

              <label className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">{copy.to}</span>
                <input
                  type="time"
                  value={minuteToTime(slot.endMinute)}
                  onChange={(e) => updateSlot(index, { endMinute: timeToMinute(e.target.value) })}
                  className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                />
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={slot.isActive}
                  onChange={(e) => updateSlot(index, { isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-xs font-semibold text-slate-700">
                  {slot.isActive ? copy.active : copy.inactive}
                </span>
              </label>

              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white"
              >
                {copy.removeButton}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={addSlot}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
        >
          {copy.addSlotButton}
        </button>
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white"
        >
          {copy.saveButton}
        </button>
      </div>

      {message && <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>}
    </section>
  );
}
