import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIp } from "@/server/security/request-ip";
import { services } from "@/server/shared/service-container";

const leadSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d{10,15})$/, "invalid phone"),
});

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const limit = services.security.rateLimiter.check(
    `consultation-lead:${ip}`,
    services.env.RATE_LIMIT_MAX_REQUESTS,
    services.env.RATE_LIMIT_WINDOW_SECONDS,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "invalid phone" }, { status: 400 });
  }

  // Placeholder until CRM/OTP integration is connected.
  console.log("[consultation-lead]", parsed.data.phone);

  return NextResponse.json({ ok: true });
}
