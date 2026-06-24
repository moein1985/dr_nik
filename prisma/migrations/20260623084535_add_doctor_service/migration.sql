-- CreateTable
CREATE TABLE "public"."DoctorService" (
    "id" TEXT NOT NULL,
    "doctorUserId" TEXT NOT NULL,
    "serviceKey" TEXT NOT NULL,
    "serviceLabel" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorService_doctorUserId_isActive_idx" ON "public"."DoctorService"("doctorUserId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorService_doctorUserId_serviceKey_key" ON "public"."DoctorService"("doctorUserId", "serviceKey");

-- AddForeignKey
ALTER TABLE "public"."DoctorService" ADD CONSTRAINT "DoctorService_doctorUserId_fkey" FOREIGN KEY ("doctorUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
