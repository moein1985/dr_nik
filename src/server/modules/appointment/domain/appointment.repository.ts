import type { Appointment, AppointmentStatus } from "./appointment.entity";

export type CreateAppointmentInput = {
  createdByUserId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  requestedAt: Date;
  serviceName: string;
  notes?: string;
};

export interface AppointmentRepository {
  create(input: CreateAppointmentInput): Promise<Appointment>;
  list(): Promise<Appointment[]>;
  listByCreator(createdByUserId: string): Promise<Appointment[]>;
  cancelByCreator(id: string, createdByUserId: string): Promise<Appointment>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
  updateByStaff(input: {
    id: string;
    patientName: string;
    patientPhone: string;
    doctorName: string;
    requestedAt: Date;
    serviceName: string;
    notes?: string;
  }): Promise<Appointment>;
}
