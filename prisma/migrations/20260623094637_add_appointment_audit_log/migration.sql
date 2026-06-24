-- CreateTable
CREATE TABLE "public"."AppointmentAuditLog" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT,
    "action" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorRole" "public"."UserRole" NOT NULL,
    "beforeJson" TEXT,
    "afterJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppointmentAuditLog_createdAt_idx" ON "public"."AppointmentAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AppointmentAuditLog_appointmentId_idx" ON "public"."AppointmentAuditLog"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentAuditLog_actorUserId_idx" ON "public"."AppointmentAuditLog"("actorUserId");

-- AddForeignKey
ALTER TABLE "public"."AppointmentAuditLog" ADD CONSTRAINT "AppointmentAuditLog_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
