import { NextResponse } from "next/server";
import { services } from "@/server/shared/service-container";

export async function POST() {
  if (!services.env.ENABLE_SMOKE_ROUTES) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  await services.staffEmail.notify.execute({
    to: services.env.STAFF_NOTIFICATION_EMAIL,
    subject: "Smoke Test: Staff Notification",
    html: "<p>This is a smoke email from Dr Nik clinic app.</p>",
  });

  return NextResponse.json({ ok: true });
}
