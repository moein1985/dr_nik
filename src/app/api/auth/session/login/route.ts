import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIp } from "@/server/security/request-ip";
import { services } from "@/server/shared/service-container";

const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const ipRate = services.security.rateLimiter.check(
    `session-login:ip:${ip}`,
    services.env.AUTH_RATE_LIMIT_MAX_REQUESTS,
    services.env.RATE_LIMIT_WINDOW_SECONDS,
  );

  if (!ipRate.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(ipRate.retryAfterSeconds) } },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
  }

  const identifier = parsed.data.identifier.trim();
  const identifierRate = services.security.rateLimiter.check(
    `session-login:identifier:${identifier.toLowerCase()}`,
    services.env.AUTH_RATE_LIMIT_MAX_REQUESTS,
    services.env.RATE_LIMIT_WINDOW_SECONDS,
  );

  if (!identifierRate.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(identifierRate.retryAfterSeconds) } },
    );
  }

  const remainingLockSeconds = services.security.loginLockout.getRemainingLockSeconds(identifier);

  if (remainingLockSeconds > 0) {
    return NextResponse.json(
      { ok: false, message: "Too many failed login attempts. Account temporarily locked." },
      { status: 429, headers: { "Retry-After": String(remainingLockSeconds) } },
    );
  }

  try {
    await services.auth.bootstrapStatus();
    const result = await services.auth.login.execute(parsed.data);
    const session = await services.auth.session.create.execute({
      userId: result.user.id,
      userRole: result.user.role,
    });

    const response = NextResponse.json({ ok: true, user: result.user });
    response.cookies.set(services.env.SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: services.env.SESSION_COOKIE_SECURE,
      path: "/",
      maxAge: services.env.SESSION_TTL_HOURS * 60 * 60,
    });

    services.security.loginLockout.registerSuccess(identifier);

    return response;
  } catch (error) {
    const lockSeconds = services.security.loginLockout.registerFailure(identifier);
    const isLocked = lockSeconds > 0;
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json(
      { ok: false, message: isLocked ? "Too many failed login attempts. Account temporarily locked." : message },
      isLocked
        ? { status: 429, headers: { "Retry-After": String(lockSeconds) } }
        : { status: 401 },
    );
  }
}
