import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  SMTP_FROM: z.string().email().default("no-reply@clinicdrnik.com"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  STAFF_NOTIFICATION_EMAIL: z.string().email(),
  DEFAULT_SUPER_ADMIN_USERNAME: z.string().default("superadmin"),
  DEFAULT_SUPER_ADMIN_PASSWORD: z.string().min(8).default("SuperAdmin123!"),
  DEFAULT_ADMIN_USERNAME: z.string().default("admin"),
  DEFAULT_ADMIN_PASSWORD: z.string().min(6).default("Admin123!"),
  DEFAULT_STAFF_USERNAME: z.string().default("staff"),
  DEFAULT_STAFF_PASSWORD: z.string().min(6).default("Staff123!"),
  DEFAULT_STAFF_EMAIL: z.string().email().default("staff@drnikclinic.local"),
  OTP_TTL_MINUTES: z.coerce.number().int().min(1).default(5),
  SMS_PROVIDER: z.enum(["mock", "kavenegar"]).default("mock"),
  KAVENEGAR_API_KEY: z.string().optional(),
  KAVENEGAR_TEMPLATE: z.string().default("verify"),
  SESSION_COOKIE_NAME: z.string().default("drnik_session"),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).default(24),
  SESSION_COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(1).default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(40),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(10),
  LOGIN_LOCKOUT_MAX_ATTEMPTS: z.coerce.number().int().min(1).default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().min(1).default(15),
  ENABLE_SMOKE_ROUTES: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  STAFF_NOTIFICATION_EMAIL: process.env.STAFF_NOTIFICATION_EMAIL,
  DEFAULT_SUPER_ADMIN_USERNAME: process.env.DEFAULT_SUPER_ADMIN_USERNAME,
  DEFAULT_SUPER_ADMIN_PASSWORD: process.env.DEFAULT_SUPER_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME: process.env.DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD,
  DEFAULT_STAFF_USERNAME: process.env.DEFAULT_STAFF_USERNAME,
  DEFAULT_STAFF_PASSWORD: process.env.DEFAULT_STAFF_PASSWORD,
  DEFAULT_STAFF_EMAIL: process.env.DEFAULT_STAFF_EMAIL,
  OTP_TTL_MINUTES: process.env.OTP_TTL_MINUTES,
  SMS_PROVIDER: process.env.SMS_PROVIDER,
  KAVENEGAR_API_KEY: process.env.KAVENEGAR_API_KEY,
  KAVENEGAR_TEMPLATE: process.env.KAVENEGAR_TEMPLATE,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_TTL_HOURS: process.env.SESSION_TTL_HOURS,
  SESSION_COOKIE_SECURE: process.env.SESSION_COOKIE_SECURE,
  RATE_LIMIT_WINDOW_SECONDS: process.env.RATE_LIMIT_WINDOW_SECONDS,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
  AUTH_RATE_LIMIT_MAX_REQUESTS: process.env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  LOGIN_LOCKOUT_MAX_ATTEMPTS: process.env.LOGIN_LOCKOUT_MAX_ATTEMPTS,
  LOGIN_LOCKOUT_MINUTES: process.env.LOGIN_LOCKOUT_MINUTES,
  ENABLE_SMOKE_ROUTES: process.env.ENABLE_SMOKE_ROUTES,
});
