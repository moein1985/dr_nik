-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'DOCTOR';

-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "doctorUserId" TEXT;

-- CreateTable
CREATE TABLE "public"."DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aboutMe" TEXT,
    "credentials" TEXT,
    "acceptedInsurances" TEXT,
    "workingHours" TEXT,
    "specialties" TEXT,
    "services" TEXT,
    "branchAddress" TEXT,
    "experience" TEXT,
    "extraNotes" TEXT,
    "aiProfileContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorStaffAssignment" (
    "id" TEXT NOT NULL,
    "doctorUserId" TEXT NOT NULL,
    "staffUserId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorStaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatSession" (
    "id" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "doctorUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "public"."DoctorProfile"("userId");

-- CreateIndex
CREATE INDEX "DoctorStaffAssignment_doctorUserId_isActive_idx" ON "public"."DoctorStaffAssignment"("doctorUserId", "isActive");

-- CreateIndex
CREATE INDEX "DoctorStaffAssignment_staffUserId_isActive_idx" ON "public"."DoctorStaffAssignment"("staffUserId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorStaffAssignment_doctorUserId_staffUserId_key" ON "public"."DoctorStaffAssignment"("doctorUserId", "staffUserId");

-- CreateIndex
CREATE INDEX "ChatSession_patientUserId_idx" ON "public"."ChatSession"("patientUserId");

-- CreateIndex
CREATE INDEX "ChatSession_doctorUserId_idx" ON "public"."ChatSession"("doctorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_patientUserId_doctorUserId_key" ON "public"."ChatSession"("patientUserId", "doctorUserId");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_role_idx" ON "public"."ChatMessage"("sessionId", "role");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "public"."ChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "Appointment_doctorUserId_idx" ON "public"."Appointment"("doctorUserId");

-- AddForeignKey
ALTER TABLE "public"."DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_doctorUserId_fkey" FOREIGN KEY ("doctorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorStaffAssignment" ADD CONSTRAINT "DoctorStaffAssignment_doctorUserId_fkey" FOREIGN KEY ("doctorUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorStaffAssignment" ADD CONSTRAINT "DoctorStaffAssignment_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_doctorUserId_fkey" FOREIGN KEY ("doctorUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
