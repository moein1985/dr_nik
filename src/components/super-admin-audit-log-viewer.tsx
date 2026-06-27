"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getTRPCClient } from "@/trpc/client";

type AuditLogViewerProps = {
  locale: Locale;
};

const actionLabels: Record<string, { fa: string; en: string; ar: string }> = {
  CREATED: { fa: "ایجاد شد", en: "Created", ar: "تم الإنشاء" },
  UPDATED: { fa: "ویرایش شد", en: "Updated", ar: "تم التحديث" },
  CANCELLED: { fa: "لغو شد", en: "Cancelled", ar: "تم الإلغاء" },
  STATUS_CHANGED: { fa: "وضعیت تغییر کرد", en: "Status Changed", ar: "تم تغيير الحالة" },
  DELETED: { fa: "حذف شد", en: "Deleted", ar: "تم الحذف" },
};

const getActionLabel = (action: string, locale: string): string => {
  const label = actionLabels[action];
  if (!label) return action;
  return label[locale as keyof typeof label] ?? action;
};

const roleLabels: Record<string, { fa: string; en: string; ar: string }> = {
  PATIENT: { fa: "بیمار", en: "Patient", ar: "مريض" },
  STAFF: { fa: "کارمند", en: "Staff", ar: "موظف" },
  DOCTOR: { fa: "پزشک", en: "Doctor", ar: "طبيب" },
  SUPER_ADMIN: { fa: "سوپرادمین", en: "Super Admin", ar: "مشرف عام" },
};

type AuditLog = {
  id: string;
  appointmentId: string | null;
  action: string;
  actorUserId: string;
  actorRole: string;
  beforeJson: string | null;
  afterJson: string | null;
  createdAt: Date;
};

export function SuperAdminAuditLogViewer({ locale }: AuditLogViewerProps) {
  const [filters, setFilters] = useState({
    action: "",
    actorUserId: "",
    appointmentId: "",
  });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const trpc = getTRPCClient();
        const result = await trpc.appointmentAudit.list.query(
          filters.action || filters.actorUserId || filters.appointmentId
            ? {
                action: filters.action || undefined,
                actorUserId: filters.actorUserId || undefined,
                appointmentId: filters.appointmentId || undefined,
              }
            : undefined,
        );
        setLogs(result);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLogs();
  }, [filters]);

  const t = (key: string) => {
    const translations: Record<string, Record<Locale, string>> = {
      title: { fa: "لاگ ممیزی نوبت‌ها (۹۰ روز اخیر)", en: "Appointment Audit Log (Last 90 Days)", ar: "سجل تدقيق المواعيد (آخر 90 يومًا)" },
      filterAction: { fa: "فیلتر عملیات:", en: "Filter Action:", ar: "تصفية العملية:" },
      filterActor: { fa: "فیلتر کاربر (UUID):", en: "Filter User (UUID):", ar: "تصفية المستخدم (UUID):" },
      filterAppointment: { fa: "فیلتر نوبت (UUID):", en: "Filter Appointment (UUID):", ar: "تصفية الموعد (UUID):" },
      allActions: { fa: "همه عملیات", en: "All Actions", ar: "جميع العمليات" },
      clearFilters: { fa: "پاک کردن فیلترها", en: "Clear Filters", ar: "مسح الفلاتر" },
      loading: { fa: "در حال بارگذاری...", en: "Loading...", ar: "جاري التحميل..." },
      noLogs: { fa: "هیچ لاگی یافت نشد", en: "No logs found", ar: "لم يتم العثور على سجلات" },
      date: { fa: "تاریخ", en: "Date", ar: "التاريخ" },
      action: { fa: "عملیات", en: "Action", ar: "العملية" },
      actor: { fa: "کاربر", en: "User", ar: "المستخدم" },
      role: { fa: "نقش", en: "Role", ar: "الدور" },
      appointment: { fa: "نوبت", en: "Appointment", ar: "الموعد" },
      changes: { fa: "تغییرات", en: "Changes", ar: "التغييرات" },
      viewDetails: { fa: "مشاهده جزئیات", en: "View Details", ar: "عرض التفاصيل" },
      before: { fa: "قبل", en: "Before", ar: "قبل" },
      after: { fa: "بعد", en: "After", ar: "بعد" },
    };
    return translations[key]?.[locale] ?? key;
  };

  const handleClearFilters = () => {
    setFilters({ action: "", actorUserId: "", appointmentId: "" });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold">{t("title")}</h2>

      {/* Filters */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">{t("filterAction")}</label>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">{t("allActions")}</option>
            <option value="CREATED">{getActionLabel("CREATED", locale)}</option>
            <option value="UPDATED">{getActionLabel("UPDATED", locale)}</option>
            <option value="CANCELLED">{getActionLabel("CANCELLED", locale)}</option>
            <option value="STATUS_CHANGED">{getActionLabel("STATUS_CHANGED", locale)}</option>
            <option value="DELETED">{getActionLabel("DELETED", locale)}</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">{t("filterActor")}</label>
          <input
            type="text"
            value={filters.actorUserId}
            onChange={(e) => setFilters({ ...filters, actorUserId: e.target.value })}
            placeholder="UUID"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">{t("filterAppointment")}</label>
          <input
            type="text"
            value={filters.appointmentId}
            onChange={(e) => setFilters({ ...filters, appointmentId: e.target.value })}
            placeholder="UUID"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>
      </div>

      <button
        onClick={handleClearFilters}
        className="mb-4 rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
      >
        {t("clearFilters")}
      </button>

      {/* Logs Table */}
      {isLoading ? (
        <p className="text-center text-muted-foreground">{t("loading")}</p>
      ) : !logs || logs.length === 0 ? (
        <p className="text-center text-muted-foreground">{t("noLogs")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left text-sm font-semibold">{t("date")}</th>
                <th className="p-3 text-left text-sm font-semibold">{t("action")}</th>
                <th className="p-3 text-left text-sm font-semibold">{t("actor")}</th>
                <th className="p-3 text-left text-sm font-semibold">{t("role")}</th>
                <th className="p-3 text-left text-sm font-semibold">{t("appointment")}</th>
                <th className="p-3 text-left text-sm font-semibold">{t("changes")}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: AuditLog) => (
                <tr key={log.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 text-sm">{formatDate(log.createdAt)}</td>
                  <td className="p-3 text-sm">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        log.action === "CREATED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : log.action === "DELETED"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : log.action === "CANCELLED"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {actionLabels[log.action]?.[locale] ?? log.action}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-mono text-xs">{log.actorUserId.slice(0, 8)}...</td>
                  <td className="p-3 text-sm">{roleLabels[log.actorRole]?.[locale] ?? log.actorRole}</td>
                  <td className="p-3 text-sm font-mono text-xs">
                    {log.appointmentId ? `${log.appointmentId.slice(0, 8)}...` : "-"}
                  </td>
                  <td className="p-3 text-sm">
                    {log.beforeJson || log.afterJson ? (
                      <button
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className="text-primary hover:underline"
                      >
                        {expandedLog === log.id ? "▼" : "▶"} {t("viewDetails")}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Expanded Details */}
          {logs.map(
            (log: AuditLog) =>
              expandedLog === log.id && (
                <div key={`detail-${log.id}`} className="mt-4 rounded-md border bg-muted/20 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {log.beforeJson && (
                      <div>
                        <h4 className="mb-2 font-semibold">{t("before")}</h4>
                        <pre className="overflow-x-auto rounded bg-background p-3 text-xs">
                          {JSON.stringify(JSON.parse(log.beforeJson), null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.afterJson && (
                      <div>
                        <h4 className="mb-2 font-semibold">{t("after")}</h4>
                        <pre className="overflow-x-auto rounded bg-background p-3 text-xs">
                          {JSON.stringify(JSON.parse(log.afterJson), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
