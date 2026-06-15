import { NextResponse } from "next/server";
import { z } from "zod";
import { MockSmsSender } from "@/server/modules/auth/infrastructure/mock-sms.sender";
import { services } from "@/server/shared/service-container";

const querySchema = z.object({
  phoneNumber: z.string().trim().regex(/^(\+?\d{10,15})$/),
});

export async function GET(request: Request) {
  if (!services.env.ENABLE_SMOKE_ROUTES) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  if (!(services.auth.smsSender instanceof MockSmsSender)) {
    return NextResponse.json({ ok: false, message: "Mock SMS is disabled" }, { status: 400 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ phoneNumber: url.searchParams.get("phoneNumber") ?? "" });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid phoneNumber" }, { status: 400 });
  }

  const otpCode = services.auth.smsSender.getLatestOtp(parsed.data.phoneNumber);

  if (!otpCode) {
    return NextResponse.json({ ok: false, message: "OTP not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, otpCode });
}
