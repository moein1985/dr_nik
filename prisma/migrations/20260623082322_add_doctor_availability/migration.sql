-- CreateTable
CREATE TABLE "public"."DoctorAvailability" (
    "id" TEXT NOT NULL,
    "doctorUserId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorAvailability_doctorUserId_weekday_isActive_idx" ON "public"."DoctorAvailability"("doctorUserId", "weekday", "isActive");

-- AddForeignKey
ALTER TABLE "public"."DoctorAvailability" ADD CONSTRAINT "DoctorAvailability_doctorUserId_fkey" FOREIGN KEY ("doctorUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
