# پلن کاهش باگ - با جزئیات

این پلن برای کاهش باگ‌های پروژه dr_nik_clinic طراحی شده است.

---

## فاز 1: TypeScript Strict Mode

**هدف:** فعال کردن type checking سخت‌گیرانه برای کشف باگ‌ها در compile time

**اقدامات:**
1. ویرایش `tsconfig.json`:
   - `strict: true`
   - `noUncheckedIndexedAccess: true`
   - `exactOptionalPropertyTypes: true`
   - `noImplicitReturns: true`
   - `noFallthroughCasesInSwitch: true`

**فایل:** `tsconfig.json`

---

## فاز 2: ESLint Strict Rules

**هدف:** فعال کردن قوانین سخت‌گیرانه برای جلوگیری از anti-patterns

**اقدامات:**
1. ویرایش `.eslintrc.json`:
   - `@typescript-eslint/no-unsafe-assignment`
   - `@typescript-eslint/no-unsafe-call`
   - `@typescript-eslint/no-unsafe-member-access`
   - `@typescript-eslint/strict-boolean-expressions`
   - `@typescript-eslint/no-floating-promises`
   - `@typescript-eslint/no-misused-promises`
   - `no-console` (error level)

**فایل:** `.eslintrc.json`

---

## فاز 3: React Error Boundaries

**هدف:** جلوگیری از crash شدن کل app هنگام خطا

**اقدامات:**
1. ایجاد `src/components/error-boundary.tsx`:
   - Error boundary component با fallback UI
   - Logging خطاها

2. ویرایش `src/app/layout.tsx`:
   - Wrap کردن main app در Error Boundary

3. ویرایش dashboard components:
   - Wrap کردن critical sections

**فایل‌ها:**
- ایجاد: `src/components/error-boundary.tsx`
- ویرایش: `src/app/layout.tsx`, dashboard components

---

## فاز 4: Prisma Schema Constraints

**هدف:** اعمال محدودیت‌های دیتابیس برای جلوگیری از داده‌های نامعتبر

**اقدامات:**
1. بررسی `prisma/schema.prisma`:
   - اضافه کردن `@unique` برای فیلدهای منحصر به فرد
   - اضافه کردن `@default` برای فیلدهای ضروری
   - تنظیم `onDelete: Cascade` یا `Restrict` برای relations
   - اضافه کردن `@db.Check` برای business rules

**فایل:** `prisma/schema.prisma`

---

## فاز 5: Runtime Validation with Zod

**هدف:** اعتبارسنجی داده‌ها در runtime

**اقدامات:**
1. ایجاد `src/config/env.validation.ts`:
   - Zod schema برای environment variables
   - Validation در startup

2. ویرایش tRPC routers:
   - اضافه کردن output schemas
   - Validation قبل از ارسال به client

**فایل‌ها:**
- ایجاد: `src/config/env.validation.ts`
- ویرایش: `src/server/api/routers/*.ts`

---

## فاز 6: Structured Logging

**هدف:** لاگ‌برداری ساختاریافته برای debugging بهتر

**اقدامات:**
1. ایجاد `src/server/utils/logger.ts`:
   - استفاده از pino یا winston
   - تعریف log levels
   - اضافه کردن context (userId, requestId)

2. اضافه کردن logging به critical paths:
   - Authentication flows
   - Appointment operations
   - Error cases

**فایل‌ها:**
- ایجاد: `src/server/utils/logger.ts`
- ویرایش: routers و use cases

---

## فاز 7: Error Monitoring

**هدف:** مانیتورینگ خطاها در production

**اقدامات:**
1. نصب `@sentry/nextjs`
2. ایجاد `sentry.client.config.ts` و `sentry.server.config.ts`
3. اضافه کردن Sentry به Error Boundary
4. فعال کردن performance monitoring

**فایل‌ها:**
- ایجاد: `sentry.client.config.ts`, `sentry.server.config.ts`
- ویرایش: `src/components/error-boundary.tsx`, `package.json`

---

## فاز 8: Manual Testing Checklist

**هدف:** چک‌لیست تست دستی برای critical flows

**اقدامات:**
1. ایجاد `MANUAL_TESTING_CHECKLIST.md`:
   - لیست critical user flows
   - سناریوهای تست برای هر flow
   - Edge cases و error conditions

**فایل:** `MANUAL_TESTING_CHECKLIST.md`

---

## ترتیب اجرا

1. فاز 1 (TypeScript) - شروع از اینجا
2. فاز 2 (ESLint)
3. فاز 3 (Error Boundaries)
4. فاز 4 (Prisma)
5. فاز 5 (Zod)
6. فاز 6 (Logging)
7. فاز 7 (Sentry)
8. فاز 8 (Manual Testing)

---

## معیارهای موفقیت

- خطاهای TypeScript کاهش 50%
- ESLint warnings کمتر از 10
- بدون unhandled promise rejections
- بدون database constraint violations
- زمان رفع خطا کاهش 40%
