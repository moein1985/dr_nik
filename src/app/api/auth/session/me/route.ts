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

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = getCookieValue(cookieHeader, services.env.SESSION_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const session = await services.auth.session.resolve.execute(token);

  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const user = await services.auth.getPublicUser.execute(session.userId);

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user });
}
