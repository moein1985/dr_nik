import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIp } from "@/server/security/request-ip";
import { services } from "@/server/shared/service-container";

const contactLeadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d{10,15})$/, "invalid phone"),
  message: z.string().trim().min(5).max(2000),
});

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const limit = services.security.rateLimiter.check(
    `contact-lead:${ip}`,
    services.env.RATE_LIMIT_MAX_REQUESTS,
    services.env.RATE_LIMIT_WINDOW_SECONDS,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = contactLeadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "invalid input" }, { status: 400 });
  }

  // Placeholder until CRM integration is connected.
  console.log("[contact-lead]", parsed.data);

  return NextResponse.json({ ok: true });
}
