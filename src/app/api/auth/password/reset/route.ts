import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIp } from "@/server/security/request-ip";
import { services } from "@/server/shared/service-container";

const phoneRegex = /^(\+?\d{10,15})$/;

const schema = z
  .object({
    phoneNumber: z.string().trim().regex(phoneRegex),
    otpCode: z.string().trim().regex(/^\d{6}$/),
    newPassword: z.string().min(6),
    confirmNewPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const limit = services.security.rateLimiter.check(
    `auth-reset-route:${ip}`,
    services.env.AUTH_RATE_LIMIT_MAX_REQUESTS,
    services.env.RATE_LIMIT_WINDOW_SECONDS,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
  }

  try {
    await services.auth.resetPassword.execute({
      phoneNumber: parsed.data.phoneNumber,
      otpCode: parsed.data.otpCode,
      newPassword: parsed.data.newPassword,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reset failed";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
