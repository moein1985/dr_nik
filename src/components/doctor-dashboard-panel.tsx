"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { getTRPCClient } from "@/trpc/client";
import { DoctorAvailabilityManager } from "@/components/doctor-availability-manager";
import { ChangePasswordForm } from "@/components/change-password-form";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

type DoctorProfile = {
  aboutMe?: string;
  credentials?: string;
  acceptedInsurances?: string;
  workingHours?: string;
  specialties?: string;
  services?: string;
  branchAddress?: string;
  experience?: string;
  extraNotes?: string;
  aiProfileContext?: string;
};

type StaffUser = {
  id: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
};

const getStaffLabel = (user: StaffUser) =>
  user.username?.trim() || user.email?.trim() || user.phoneNumber?.trim() || user.id;

function getCopy(locale: Locale) {
  if (locale === "en") {
    return {
      sectionTitle: "Doctor Profile",
      sectionSubtitle: "Complete your professional profile. This data will later power doctor-specific AI orchestration.",
      saveButton: "Save Profile",
      loading: "Loading...",
      unauthorized: "You need doctor-level access to view this panel.",
      saveSuccess: "Profile saved successfully.",
      aboutMe: "About Me",
      credentials: "Credentials",
      acceptedInsurances: "Accepted Insurances",
      workingHours: "Working Hours",
      specialties: "Specialties",
      services: "Services",
      branchAddress: "Address / Branch",
      experience: "Experience",
      extraNotes: "Extra Notes",
      aiProfileContext: "AI Assistant Context",
      fieldHint: "You can write one item per line.",
      aiHint: "This text is used as doctor-specific context for AI responses.",
      staffAccessTitle: "Staff Access",
      staffAccessSubtitle: "Select your secretaries from existing staff users created by super admin.",
      allStaffTitle: "All Available Staff",
      assignedStaffTitle: "Assigned Staff",
      assignButton: "Assign",
      unassignButton: "Remove Access",
      noStaffFound: "No active staff user found.",
      noAssignedStaff: "No staff is assigned to your account yet.",
      assignSuccess: "Staff assigned successfully.",
      unassignSuccess: "Staff access removed successfully.",
      processing: "Processing...",
      assignedBadge: "Assigned",
    };
  }

  if (locale === "ar") {
    return {
      sectionTitle: "ملف الطبيب",
      sectionSubtitle: "أكمل ملفك المهني. سيتم استخدام هذه البيانات لاحقًا لضبط مساعد الذكاء الاصطناعي الخاص بكل طبيب.",
      saveButton: "حفظ الملف",
      loading: "جاري التحميل...",
      unauthorized: "تحتاج إلى صلاحية طبيب لعرض هذه اللوحة.",
      saveSuccess: "تم حفظ الملف بنجاح.",
      aboutMe: "نبذة عني",
      credentials: "المؤهلات",
      acceptedInsurances: "التأمينات المقبولة",
      workingHours: "ساعات العمل",
      specialties: "التخصصات",
      services: "الخدمات",
      branchAddress: "العنوان / الفرع",
      experience: "الخبرة",
      extraNotes: "ملاحظات إضافية",
      aiProfileContext: "سياق مساعد الذكاء الاصطناعي",
      fieldHint: "يمكنك كتابة كل عنصر في سطر منفصل.",
      aiHint: "يستخدم هذا النص كسياق خاص بالطبيب في ردود الذكاء الاصطناعي.",
      staffAccessTitle: "صلاحيات الطاقم",
      staffAccessSubtitle: "اختر السكرتارية الخاصة بك من قائمة الموظفين الذين أنشأهم المشرف العام.",
      allStaffTitle: "جميع الموظفين المتاحين",
      assignedStaffTitle: "الموظفون المرتبطون بك",
      assignButton: "ربط",
      unassignButton: "إزالة الصلاحية",
      noStaffFound: "لا يوجد موظف نشط متاح حالياً.",
      noAssignedStaff: "لم يتم ربط أي موظف بحسابك حتى الآن.",
      assignSuccess: "تم ربط الموظف بنجاح.",
      unassignSuccess: "تمت إزالة صلاحية الموظف بنجاح.",
      processing: "جارٍ التنفيذ...",
      assignedBadge: "مرتبط",
    };
  }

  return {
    sectionTitle: "پروفایل پزشک",
    sectionSubtitle: "پروفایل حرفه ای خود را تکمیل کنید. این داده ها بعدا برای تنظیم دستیار هوش مصنوعی اختصاصی پزشک استفاده می شوند.",
    saveButton: "ذخیره پروفایل",
    loading: "در حال بارگذاری...",
    unauthorized: "برای مشاهده این پنل نیاز به دسترسی پزشک دارید.",
    saveSuccess: "پروفایل با موفقیت ذخیره شد.",
    aboutMe: "درباره من",
    credentials: "مدارک",
    acceptedInsurances: "بیمه های قابل قبول",
    workingHours: "ساعت کاری",
    specialties: "تخصص ها",
    services: "خدمات",
    branchAddress: "آدرس / شعبه",
    experience: "تجربه",
    extraNotes: "توضیحات تکمیلی",
    aiProfileContext: "کانتکست دستیار هوش مصنوعی",
    fieldHint: "می توانید هر مورد را در یک خط جدا وارد کنید.",
    aiHint: "این متن به عنوان کانتکست اختصاصی پزشک در پاسخ های هوش مصنوعی استفاده می شود.",
    staffAccessTitle: "دسترسی منشی ها",
    staffAccessSubtitle: "منشی های خود را از بین کاربران staff موجود که توسط سوپر ادمین ساخته شده اند انتخاب کنید.",
    allStaffTitle: "همه منشی های موجود",
    assignedStaffTitle: "منشی های متصل به شما",
    assignButton: "اتصال",
    unassignButton: "حذف دسترسی",
    noStaffFound: "هیچ کاربر staff فعالی یافت نشد.",
    noAssignedStaff: "هنوز هیچ منشی به حساب شما متصل نشده است.",
    assignSuccess: "منشی با موفقیت متصل شد.",
    unassignSuccess: "دسترسی منشی با موفقیت حذف شد.",
    processing: "در حال انجام...",
    assignedBadge: "متصل",
  };
}

export function DoctorDashboardPanel({ dict, locale }: Props) {
  const trpc = useMemo(() => getTRPCClient(), []);
  const copy = getCopy(locale);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");
  const [staffActionLoadingId, setStaffActionLoadingId] = useState<string | null>(null);
  const [form, setForm] = useState<DoctorProfile>({});
  const [assignableStaff, setAssignableStaff] = useState<StaffUser[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<StaffUser[]>([]);

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const me = await trpc.auth.me.query();
      const isDoctor = me.role === "DOCTOR" || me.role === "SUPER_ADMIN";
      setAuthorized(isDoctor);

      if (!isDoctor) {
        setLoading(false);
        return;
      }

      const profile = await trpc.auth.getMyDoctorProfile.query();
      const [allStaff, myStaff] = await Promise.all([
        trpc.auth.listAssignableStaff.query(),
        trpc.auth.listMyAssignedStaff.query(),
      ]);

      setAssignableStaff(allStaff as StaffUser[]);
      setAssignedStaff(myStaff as StaffUser[]);

      if (profile) {
        setForm({
          aboutMe: profile.aboutMe ?? "",
          credentials: profile.credentials ?? "",
          acceptedInsurances: profile.acceptedInsurances ?? "",
          workingHours: profile.workingHours ?? "",
          specialties: profile.specialties ?? "",
          services: profile.services ?? "",
          branchAddress: profile.branchAddress ?? "",
          experience: profile.experience ?? "",
          extraNotes: profile.extraNotes ?? "",
          aiProfileContext: profile.aiProfileContext ?? "",
        });
      }
    } catch {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function updateField<K extends keyof DoctorProfile>(key: K, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      await trpc.auth.upsertMyDoctorProfile.mutate({
        aboutMe: form.aboutMe?.trim() || undefined,
        credentials: form.credentials?.trim() || undefined,
        acceptedInsurances: form.acceptedInsurances?.trim() || undefined,
        workingHours: form.workingHours?.trim() || undefined,
        specialties: form.specialties?.trim() || undefined,
        services: form.services?.trim() || undefined,
        branchAddress: form.branchAddress?.trim() || undefined,
        experience: form.experience?.trim() || undefined,
        extraNotes: form.extraNotes?.trim() || undefined,
        aiProfileContext: form.aiProfileContext?.trim() || undefined,
      });

      setMessage(copy.saveSuccess);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    }
  }

  async function assignStaff(staffUserId: string) {
    setStaffActionLoadingId(staffUserId);
    setMessage("");

    try {
      await trpc.auth.assignStaffToMe.mutate({ staffUserId });
      setMessage(copy.assignSuccess);
      const myStaff = await trpc.auth.listMyAssignedStaff.query();
      setAssignedStaff(myStaff as StaffUser[]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    } finally {
      setStaffActionLoadingId(null);
    }
  }

  async function unassignStaff(staffUserId: string) {
    setStaffActionLoadingId(staffUserId);
    setMessage("");

    try {
      await trpc.auth.unassignStaffFromMe.mutate({ staffUserId });
      setMessage(copy.unassignSuccess);
      const myStaff = await trpc.auth.listMyAssignedStaff.query();
      setAssignedStaff(myStaff as StaffUser[]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : dict.auth.genericError);
    } finally {
      setStaffActionLoadingId(null);
    }
  }

  if (loading) {
    return <p className="mt-6 text-sm text-slate-600">{copy.loading}</p>;
  }

  if (!authorized) {
    return <p className="mt-6 text-sm font-medium text-rose-700">{copy.unauthorized}</p>;
  }

  const assignedStaffIds = new Set(assignedStaff.map((item) => item.id));

  return (
    <>
      <DoctorAvailabilityManager locale={locale} />
      <ChangePasswordForm locale={locale} />

      <section className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200 lg:p-8">
        <h2 className="text-2xl font-bold text-slate-900">{copy.sectionTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{copy.sectionSubtitle}</p>

      <form onSubmit={submit} className="mt-5 grid gap-4">
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-700">{copy.aboutMe}</span>
          <textarea
            value={form.aboutMe ?? ""}
            onChange={(event) => updateField("aboutMe", event.target.value)}
            rows={4}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-700">{copy.credentials}</span>
          <textarea
            value={form.credentials ?? ""}
            onChange={(event) => updateField("credentials", event.target.value)}
            rows={4}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-700">{copy.acceptedInsurances}</span>
          <textarea
            value={form.acceptedInsurances ?? ""}
            onChange={(event) => updateField("acceptedInsurances", event.target.value)}
            rows={3}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-700">{copy.workingHours}</span>
          <textarea
            value={form.workingHours ?? ""}
            onChange={(event) => updateField("workingHours", event.target.value)}
            rows={3}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <span className="text-xs text-slate-500">{copy.fieldHint}</span>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-700">{copy.specialties}</span>
            <textarea
              value={form.specialties ?? ""}
              onChange={(event) => updateField("specialties", event.target.value)}
              rows={3}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-700">{copy.services}</span>
            <textarea
              value={form.services ?? ""}
              onChange={(event) => updateField("services", event.target.value)}
              rows={3}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-700">{copy.branchAddress}</span>
          <textarea
            value={form.branchAddress ?? ""}
            onChange={(event) => updateField("branchAddress", event.target.value)}
            rows={3}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-700">{copy.experience}</span>
          <textarea
            value={form.experience ?? ""}
            onChange={(event) => updateField("experience", event.target.value)}
            rows={3}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-700">{copy.extraNotes}</span>
          <textarea
            value={form.extraNotes ?? ""}
            onChange={(event) => updateField("extraNotes", event.target.value)}
            rows={4}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-700">{copy.aiProfileContext}</span>
          <textarea
            value={form.aiProfileContext ?? ""}
            onChange={(event) => updateField("aiProfileContext", event.target.value)}
            rows={5}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <span className="text-xs text-slate-500">{copy.aiHint}</span>
        </label>

        <button
          type="submit"
          className="w-fit rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white"
        >
          {copy.saveButton}
        </button>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-xl font-bold text-slate-900">{copy.staffAccessTitle}</h3>
        <p className="mt-2 text-sm text-slate-600">{copy.staffAccessSubtitle}</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-900">{copy.allStaffTitle}</h4>
            {assignableStaff.length === 0 ? (
              <p className="mt-3 text-xs text-slate-600">{copy.noStaffFound}</p>
            ) : (
              <div className="mt-3 space-y-2">
                {assignableStaff.map((staff) => {
                  const isAssigned = assignedStaffIds.has(staff.id);
                  const disabled = isAssigned || staffActionLoadingId === staff.id;

                  return (
                    <div key={staff.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{getStaffLabel(staff)}</p>
                        {staff.email && <p className="text-[11px] text-slate-500">{staff.email}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void assignStaff(staff.id);
                        }}
                        disabled={disabled}
                        className="rounded-lg bg-cyan-700 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {staffActionLoadingId === staff.id ? copy.processing : (isAssigned ? copy.assignedBadge : copy.assignButton)}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-900">{copy.assignedStaffTitle}</h4>
            {assignedStaff.length === 0 ? (
              <p className="mt-3 text-xs text-slate-600">{copy.noAssignedStaff}</p>
            ) : (
              <div className="mt-3 space-y-2">
                {assignedStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{getStaffLabel(staff)}</p>
                      {staff.email && <p className="text-[11px] text-slate-500">{staff.email}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void unassignStaff(staff.id);
                      }}
                      disabled={staffActionLoadingId === staff.id}
                      className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {staffActionLoadingId === staff.id ? copy.processing : copy.unassignButton}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>

      {message && <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>}
      </section>
    </>
  );
}
