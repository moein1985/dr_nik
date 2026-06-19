export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type Appointment = {
  id: string;
  createdByUserId: string;
  doctorUserId?: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  requestedAt: Date;
  serviceName: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: Date;
};
