ALTER TABLE "Appointment"
ADD COLUMN "doctorName" TEXT NOT NULL DEFAULT 'دکتر نیک';

ALTER TABLE "Appointment"
ALTER COLUMN "doctorName" DROP DEFAULT;
