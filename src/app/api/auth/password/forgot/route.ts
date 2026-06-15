import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIp } from "@/server/security/request-ip";
import { services } from "@/server/shared/service-container";

const phoneRegex = /^(\+?\d{10,15})$/;

const schema = z.object({
  phoneNumber: z.string().trim().regex(phoneRegex),
});

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const limit = services.security.rateLimiter.check(
    `auth-forgot-route:${ip}`,
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

  await services.auth.forgotPassword.execute(parsed.data);
  return NextResponse.json({ ok: true });
}
