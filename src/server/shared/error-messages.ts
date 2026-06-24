/**
 * Server-side error messages
 * These are used in backend operations and don't have access to client-side i18n
 */

export const AI_ERROR_MESSAGES = {
  DEFAULT_DOCTOR_NAME: "دکتر",
  NO_RESPONSE: "پاسخی از سرویس هوش مصنوعی دریافت نشد. لطفا دوباره تلاش کنید.",
  ASSISTANT_DISABLED: "دستیار هوش مصنوعی در حال حاضر غیرفعال است. لطفا با پذیرش کلینیک تماس بگیرید.",
  NOT_CONFIGURED: "تنظیمات دستیار هوش مصنوعی کامل نیست. لطفا از سوپرادمین بخواهید API Key را ثبت کند.",
  QUOTA_EXCEEDED: (limit: number) => `شما قبلاً ${limit} سؤال برای این دکتر پرسیده‌اید. لطفا برای سؤالات بیشتر با کلینیک تماس بگیرید.`,
  CONNECTION_FAILED: (status: number) => `ارتباط با سرویس هوش مصنوعی برقرار نشد (${status}). لطفا بعدا دوباره تلاش کنید.`,
  TIMEOUT: "پاسخ از سرویس هوش مصنوعی با تاخیر مواجه شد. لطفا دوباره تلاش کنید یا با پشتیبانی کلینیک تماس بگیرید.",
  GENERAL_ERROR: "ارتباط با سرویس هوش مصنوعی برقرار نشد. لطفا دوباره تلاش کنید.",
} as const;

export const APPOINTMENT_EMAIL_TEMPLATES = {
  SUBJECT: "نوبت جدید ثبت شد",
  PATIENT_SUBJECT: "نوبت جدید کلینیک زیبایی دکتر نیک",
  STAFF_SUBJECT: "نوبت جدید توسط کارکنان ثبت شد",
  STAFF_TITLE: "ثبت نوبت توسط کارکنان",
  PATIENT_BODY: (appointment: { patientName: string; patientPhone: string; doctorName: string; serviceName: string; requestedAt: Date }) => `
    <h2>نوبت جدید کلینیک زیبایی دکتر نیک</h2>
    <p><strong>نام بیمار:</strong> ${appointment.patientName}</p>
    <p><strong>شماره تماس:</strong> ${appointment.patientPhone}</p>
    <p><strong>پزشک:</strong> ${appointment.doctorName}</p>
    <p><strong>خدمت:</strong> ${appointment.serviceName}</p>
    <p><strong>زمان درخواستی:</strong> ${appointment.requestedAt.toISOString()}</p>
  `,
  STAFF_BODY: (appointment: { patientName: string; patientPhone: string; doctorName: string; serviceName: string; requestedAt: Date }) => `
    <h2>ثبت نوبت توسط کارکنان</h2>
    <p><strong>نام بیمار:</strong> ${appointment.patientName}</p>
    <p><strong>شماره تماس:</strong> ${appointment.patientPhone}</p>
    <p><strong>پزشک:</strong> ${appointment.doctorName}</p>
    <p><strong>خدمت:</strong> ${appointment.serviceName}</p>
    <p><strong>زمان درخواستی:</strong> ${appointment.requestedAt.toISOString()}</p>
  `,
} as const;

export const AUTH_MESSAGES = {
  DEFAULT_DOCTOR_NAME: "دکتر",
} as const;
