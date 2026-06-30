-- CreateIndex
CREATE UNIQUE INDEX "Appointment_doctorUserId_requestedAt_active_key" ON "public"."Appointment"("doctorUserId", "requestedAt") WHERE "status" != 'CANCELLED';
