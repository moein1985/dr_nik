import { NextResponse } from "next/server";
import { services } from "@/server/shared/service-container";

function getCookieValue(cookieHeader: string, cookieName: string): string | undefined {
  const pairs = cookieHeader.split(";").map((item) => item.trim());
  const match = pairs.find((item) => item.startsWith(`${cookieName}=`));

  if (!match) {
    return undefined;
  }

  return decodeURIComponent(match.slice(cookieName.length + 1));
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = getCookieValue(cookieHeader, services.env.SESSION_COOKIE_NAME);

  if (token) {
    await services.auth.session.revoke.execute(token);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(services.env.SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: services.env.SESSION_COOKIE_SECURE,
    path: "/",
    maxAge: 0,
  });

  return response;
}
