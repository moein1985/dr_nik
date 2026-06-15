# طرح جامع پیاده‌سازی سامانه نوبت‌دهی کلینیک دکتر نیک

تاریخ: ۱۴۰۵/۰۳/۰۳  
نسخه: ۱.۰

---

## ۱. وضعیت فعلی (Baseline)

### معماری موجود
- **فریم‌ورک**: Next.js 15 — App Router، سه locale: `fa` / `ar` / `en`
- **Backend**: tRPC روی `/api/trpc`، Session-based auth (cookie)
- **ذخیره‌سازی**: **In-Memory** — تمام داده‌ها با restart Docker از بین می‌روند
  - `InMemoryUserRepository`
  - `InMemoryAppointmentRepository`
  - `InMemorySessionRepository`
  - `InMemoryPasswordResetRepository`
  - ⚠️ کانتینر PostgreSQL در `docker-compose.vps.yml` موجود است ولی **استفاده نمی‌شود**
- **نقش‌ها (فعلی)**: `PATIENT` | `STAFF` | `ADMIN`

### مشکلات شناسایی‌شده

| # | مشکل | فایل | اولویت |
|---|------|------|--------|
| 1 | بعد از login در `/booking` هیچ redirectی نیست | `booking-auth-panel.tsx` | بالا |
| 2 | فرم نوبت بیمار نام و شماره را از session پر نمی‌کند | `patient-dashboard-panel.tsx` | بالا |
| 3 | `ar` locale تقویم میلادی بدون بومی‌سازی دارد | `appointment-date-time-input.tsx` | متوسط |
| 4 | نقش SUPER_ADMIN وجود ندارد | `user.entity.ts` | بالا |
| 5 | داده‌ها in-memory هستند (پاک می‌شوند) | `service-container.ts` | بالا |

---

## ۲. معماری هدف

### ۲.۱ سلسله‌مراتب نقش‌ها

```
SUPER_ADMIN
├── ایجاد کاربر ADMIN
├── همه دسترسی‌های ADMIN
└── مشاهده گزارش کلی

ADMIN
├── ایجاد کاربر STAFF
├── مدیریت کاربران (فعال/غیرفعال، تغییر نقش)
├── همه دسترسی‌های STAFF
└── مشاهده همه نوبت‌ها + گزارش

STAFF (کارمند کلینیک)
├── ایجاد نوبت برای بیمار
├── ویرایش نوبت
├── حذف نوبت
├── تغییر وضعیت نوبت (PENDING → CONFIRMED / CANCELLED)
└── جستجو و فیلتر نوبت‌ها

PATIENT (بیمار)
├── ثبت نوبت برای خودش
├── لغو نوبت خودش
└── مشاهده تاریخچه نوبت‌هایش
```

### ۲.۲ مسیر کاربر (User Journey)

```
صفحه اصلی  →  دکمه "رزرو نوبت"  →  /[locale]/booking
                                         │
                            ┌────────────┼────────────┐
                         ثبت‌نام        ورود        فراموشی رمز
                            │            │
                     redirect بر اساس نقش پس از ورود:
                            │
                ┌───────────┼───────────┬───────────┐
           PATIENT       STAFF        ADMIN    SUPER_ADMIN
              │            │            │           │
         /patient       /staff       /admin   /super-admin
```

### ۲.۳ صفحات و دسترسی‌ها

| مسیر | دسترسی | محتوا |
|------|---------|-------|
| `/[locale]/booking` | عمومی | فرم auth (ثبت‌نام/ورود/فراموشی) |
| `/[locale]/patient` | PATIENT | ثبت نوبت + لیست نوبت‌هایم |
| `/[locale]/staff` | STAFF, ADMIN, SUPER_ADMIN | تقویم + CRUD نوبت‌ها |
| `/[locale]/admin` | ADMIN, SUPER_ADMIN | staff + مدیریت کاربران |
| `/[locale]/super-admin` | SUPER_ADMIN | admin + ایجاد کاربر ADMIN |

---

## ۳. تقویم‌های سه‌زبانه

### `fa` — شمسی (جلالی)
- **ورودی تاریخ**: دو input جداگانه: `YYYY/MM/DD` (متن) + `HH:MM` (ساعت)
- **تبدیل**: `parseJalaliDateTime` موجود در `src/i18n/date.ts`
- **نمایش**: `formatLocalizedDate` با `fa-IR-u-ca-persian`

### `en` — میلادی
- **ورودی**: `<input type="datetime-local">` بومی مرورگر
- **نمایش**: `formatLocalizedDate` با `en-US`

### `ar` — میلادی با اعداد عربی
- **ورودی**: `<input type="datetime-local">` (همان en)
- **نمایش**: `formatLocalizedDate` با `ar-SA` — اعداد و ماه‌ها به عربی
- ⚠️ فعلاً میلادی می‌ماند (هجری قمری نیاز به کتابخانه خارجی دارد)

---

## ۴. پلان پیاده‌سازی — مرحله به مرحله

### فاز ۱ — نقش SUPER_ADMIN و Bootstrap

#### ۴.۱.۱ تغییر `UserRole` type
**فایل**: `src/server/modules/auth/domain/user.entity.ts`
```ts
// قبل:
export type UserRole = "PATIENT" | "STAFF" | "ADMIN";

// بعد:
export type UserRole = "PATIENT" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
```

#### ۴.۱.۲ `ensure-default-super-admin.use-case.ts` (فایل جدید)
**مسیر**: `src/server/modules/auth/application/ensure-default-super-admin.use-case.ts`
- مشابه `ensure-default-admin.use-case.ts` ولی role = `"SUPER_ADMIN"`

#### ۴.۱.۳ متغیرهای محیطی جدید
**فایل**: `src/server/config/env.ts`
```ts
DEFAULT_SUPER_ADMIN_USERNAME: z.string().default("superadmin"),
DEFAULT_SUPER_ADMIN_PASSWORD: z.string().min(8).default("SuperAdmin123!"),
```

#### ۴.۱.۴ Bootstrap در service-container
**فایل**: `src/server/shared/service-container.ts`
- افزودن `ensureDefaultSuperAdmin.execute(...)` در startup
- افزودن `createAdmin` use-case (مشابه `createStaff` ولی role=`"ADMIN"`)

#### ۴.۱.۵ tRPC procedures
**فایل**: `src/server/api/trpc.ts`
```ts
export const superAdminProcedure = requireRole(["SUPER_ADMIN"]);
// همچنین staffProcedure و adminProcedure باید SUPER_ADMIN را هم بپذیرند:
export const staffProcedure = requireRole(["STAFF", "ADMIN", "SUPER_ADMIN"]);
export const adminProcedure = requireRole(["ADMIN", "SUPER_ADMIN"]);
```

#### ۴.۱.۶ Auth router — mutation جدید
**فایل**: `src/server/api/routers/auth.ts`
```ts
createAdmin: superAdminProcedure
  .input(createStaffInput)
  .mutation(async ({ input }) => {
    return services.auth.createAdmin.execute({ ...input });
  }),

setUserRole: adminProcedure
  .input(z.object({
    userId: z.string().uuid(),
    role: z.enum(["PATIENT", "STAFF", "ADMIN"]), // SUPER_ADMIN از UI قابل تنظیم نیست
  }))
```

#### ۴.۱.۷ Docker Compose — env var جدید
**فایل**: `docker-compose.vps.yml`
```yaml
environment:
  DEFAULT_SUPER_ADMIN_USERNAME: superadmin
  DEFAULT_SUPER_ADMIN_PASSWORD: "Clinic@SuperAdmin2026!"
```

---

### فاز ۲ — رفع ۳ مشکل اصلی

#### ۴.۲.۱ Redirect بعد از login
**فایل**: `src/components/booking-auth-panel.tsx`

```ts
// در onLoginSubmit پس از setIsLoggedIn(true):
const rolePaths: Record<string, string> = {
  PATIENT: "patient",
  STAFF: "staff",
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin",
};
const path = rolePaths[json.user.role] ?? "patient";
window.location.href = `/${locale}/${path}`;
```

#### ۴.۲.۲ پیش‌پر کردن فرم بیمار از session
**فایل**: `src/components/patient-dashboard-panel.tsx`

```ts
// در تابع load():
const me = await trpc.auth.me.query();
// me.phoneNumber را به patientPhone ست کن
setPatientPhone(me.phoneNumber ?? "");
// me.username یا displayName را به patientName ست کن (اگر وجود داشت)
```

#### ۴.۲.۳ تقویم عربی
**فایل**: `src/components/appointment-date-time-input.tsx`

```tsx
// فعلاً ar همان Gregorian datetime-local می‌گیرد (مثل en)
// اما نمایش تاریخ با Intl عربی خواهد بود:
// formatLocalizedDate("ar", date) → "٢٤ مايو ٢٠٢٦، ١٠:٣٠ ص"
```

---

### فاز ۳ — صفحه و پنل SUPER_ADMIN

#### ۴.۳.۱ صفحه جدید
**فایل**: `src/app/[locale]/super-admin/page.tsx`
- مشابه `admin/page.tsx` ولی عنوان و subtitle متفاوت
- از `SuperAdminDashboardPanel` استفاده می‌کند

#### ۴.۳.۲ کامپوننت جدید
**فایل**: `src/components/super-admin-dashboard-panel.tsx`
- شامل `AdminDashboardPanel` (ارث‌بری محتوا)
- اضافه: بخش "ایجاد کاربر مدیر (ADMIN)"
  - فرم: username + email + رمز + تکرار رمز
  - mutation: `trpc.auth.createAdmin`

---

### فاز ۴ — تقویم هفتگی Staff

#### ۴.۴.۱ کامپوننت `WeeklyCalendar`
**فایل**: `src/components/weekly-calendar.tsx`

ساختار UI:
```
┌──────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│      │  شنبه  │  یک‌شنبه│ دوشنبه │ سه‌شنبه │ چهارشنبه│ پنج‌شنبه│  جمعه  │
├──────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ ۸صبح │  [نوبت]│        │  [نوبت]│        │        │        │        │
│ ۹صبح │        │        │        │  [نوبت]│        │        │        │
│  ... │        │        │        │        │        │        │        │
└──────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
```

- **رنگ‌ها**: زرد = PENDING، سبز = CONFIRMED، قرمز/خاکستری = CANCELLED
- **کلیک روی نوبت**: مدال ویرایش وضعیت
- **ناوبری**: دکمه‌های "هفته قبل" / "هفته بعد"
- **locale-aware**: شروع هفته شنبه برای fa/ar، دوشنبه برای en

#### ۴.۴.۲ ادغام در StaffDashboardPanel
- تب‌بندی: "تقویم" | "لیست" | "نوبت جدید"

---

### فاز ۵ — اتصال به PostgreSQL (پایدارسازی داده)

> ⚠️ این فاز مهم‌ترین تغییر ساختاری است

#### ۴.۵.۱ Prisma Schema
**فایل**: `prisma/schema.prisma` (باید ایجاد شود)

```prisma
model User {
  id           String   @id @default(uuid())
  phoneNumber  String?  @unique
  username     String?  @unique
  email        String?  @unique
  role         UserRole @default(PATIENT)
  passwordHash String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  appointments Appointment[]
  sessions     Session[]
}

model Appointment {
  id              String            @id @default(uuid())
  createdByUserId String
  patientName     String
  patientPhone    String
  requestedAt     DateTime
  serviceName     String
  notes           String?
  status          AppointmentStatus @default(PENDING)
  createdAt       DateTime          @default(now())
  createdBy       User              @relation(fields: [createdByUserId], references: [id])
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model PasswordReset {
  id          String   @id @default(uuid())
  phoneNumber String
  otpHash     String
  expiresAt   DateTime
  createdAt   DateTime @default(now())
}

enum UserRole {
  PATIENT
  STAFF
  ADMIN
  SUPER_ADMIN
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
}
```

#### ۴.۵.۲ Repository‌های Prisma
- `PrismaUserRepository` → جایگزین `InMemoryUserRepository`
- `PrismaAppointmentRepository` → جایگزین `InMemoryAppointmentRepository`
- `PrismaSessionRepository` → جایگزین `InMemorySessionRepository`
- `PrismaPasswordResetRepository` → جایگزین `InMemoryPasswordResetRepository`

هر repository باید `interface` فعلی را implement کند (معماری Clean Architecture رعایت شده).

#### ۴.۵.۳ Migration
```bash
npx prisma migrate dev --name init
```

#### ۴.۵.۴ آپدیت service-container
```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const userRepository = new PrismaUserRepository(prisma);
// ...
```

---

## ۵. i18n — کلیدهای جدید

### fa.ts
```ts
dashboard: {
  // موجود
  superAdminTitle: "پنل مدیر ارشد",
  superAdminSubtitle: "ایجاد و مدیریت کاربران مدیریتی",
  createAdminTitle: "ایجاد کاربر مدیر",
  createAdminButton: "ایجاد مدیر",
  // تقویم
  calendarTitle: "تقویم نوبت‌ها",
  calendarPrevWeek: "هفته قبل",
  calendarNextWeek: "هفته بعد",
  calendarToday: "امروز",
  // وضعیت
  statusPending: "در انتظار تأیید",
  statusConfirmed: "تأیید شده",
  statusCancelled: "لغو شده",
  // نوبت
  appointmentDetails: "جزئیات نوبت",
  editAppointment: "ویرایش نوبت",
  deleteAppointment: "حذف نوبت",
  confirmDelete: "آیا مطمئن هستید؟",
  // خدمات
  serviceSelectLabel: "نوع خدمت را انتخاب کنید",
}
```

---

## ۶. ترتیب پیاده‌سازی

```
[فاز ۱] نقش و Bootstrap
    1. user.entity.ts → اضافه SUPER_ADMIN
    2. ensure-default-super-admin.use-case.ts → فایل جدید
    3. env.ts → env var جدید
    4. service-container.ts → bootstrap + createAdmin
    5. trpc.ts → superAdminProcedure + به‌روز STAFF/ADMIN procedures
    6. auth.ts router → createAdmin mutation
    
[فاز ۲] رفع ۳ مشکل
    7. booking-auth-panel.tsx → redirect بعد از login
    8. patient-dashboard-panel.tsx → پیش‌پر فرم از session
    9. appointment-date-time-input.tsx → Arabic locale
    
[فاز ۳] صفحه Super Admin
    10. super-admin/page.tsx → صفحه جدید
    11. super-admin-dashboard-panel.tsx → کامپوننت جدید
    12. i18n messages (fa/ar/en) → کلیدهای جدید

[فاز ۴] تقویم هفتگی Staff
    13. weekly-calendar.tsx → کامپوننت جدید
    14. staff-dashboard-panel.tsx → ادغام تقویم + tab view
    15. i18n → کلیدهای تقویم

[فاز ۵] PostgreSQL (مرحله بعدی - جداگانه)
    16. prisma/schema.prisma
    17. prisma repositories ×4
    18. service-container.ts → سوئیچ به Prisma
    19. Dockerfile → اضافه کردن prisma generate
    20. docker-compose.vps.yml → env var جدید super_admin
```

---

## ۷. نکات مهم فنی

### In-Memory vs Database
فاز ۱-۴ روی همان ذخیره‌سازی In-Memory کار می‌کنند. یعنی:
- بعد از deploy جدید، همه کاربران و نوبت‌ها پاک می‌شوند
- SUPER_ADMIN دوباره از env var bootstrap می‌شود
- نوبت‌های ثبت‌شده باقی نمی‌مانند

فاز ۵ (PostgreSQL) این مشکل را حل می‌کند.

### Jalali Calendar
کتابخانه `jalaali-js` در `package.json` بررسی شود. اگر وجود ندارد:
```bash
npm install jalaali-js
npm install -D @types/jalaali-js
```
فعلاً `parseJalaliDateTime` در `src/i18n/date.ts` پیاده‌سازی شده.

### Service Picker
به جای `<input type="text">` برای نام خدمت، لیست ثابت از خدمات کلینیک:
```ts
const CLINIC_SERVICES = {
  fa: ["فیلر لب", "فیلر صورت", "بوتاکس", "لیفت", "کانتورینگ بدن", "جوانسازی پوست", "دندانپزشکی زیبایی"],
  en: ["Lip Filler", "Face Filler", "Botox", "Lift", "Body Contouring", "Skin Rejuvenation", "Cosmetic Dentistry"],
  ar: ["حشو الشفاه", "حشو الوجه", "البوتوكس", "شد الوجه", "تخسيس الجسم", "تجديد شباب الجلد", "طب الأسنان التجميلي"],
}
```

### امنیت
- `SUPER_ADMIN` از UI قابل ساختن نیست — فقط از env var bootstrap می‌شود
- `setUserRole` در admin panel نمی‌تواند role را به `SUPER_ADMIN` تغییر دهد
- session token با `crypto.randomUUID()` ساخته می‌شود (موجود)
- rate limiting روی همه mutation‌های auth فعال است

---

## ۸. فایل‌های تأثیرپذیر (خلاصه)

### فایل‌های جدید
```
src/server/modules/auth/application/ensure-default-super-admin.use-case.ts
src/server/modules/auth/application/create-admin.use-case.ts
src/app/[locale]/super-admin/page.tsx
src/components/super-admin-dashboard-panel.tsx
src/components/weekly-calendar.tsx
```

### فایل‌های ویرایش‌شده
```
src/server/modules/auth/domain/user.entity.ts          (+SUPER_ADMIN)
src/server/config/env.ts                                (+super admin envs)
src/server/shared/service-container.ts                  (+bootstrap, +createAdmin)
src/server/api/trpc.ts                                  (+superAdminProcedure)
src/server/api/routers/auth.ts                          (+createAdmin mutation)
src/components/booking-auth-panel.tsx                   (+redirect after login)
src/components/patient-dashboard-panel.tsx              (+pre-fill from session)
src/components/appointment-date-time-input.tsx          (+Arabic locale)
src/components/staff-dashboard-panel.tsx                (+calendar tab)
src/i18n/messages/fa.ts                                 (+new keys)
src/i18n/messages/en.ts                                 (+new keys)
src/i18n/messages/ar.ts                                 (+new keys)
```
