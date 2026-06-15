import type { Appointment } from "../domain/appointment.entity";
import type { AppointmentRepository } from "../domain/appointment.repository";

export type UpdateAppointmentByStaffInput = {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  serviceName: string;
  requestedAt: Date;
  notes?: string;
};

export class UpdateAppointmentByStaffUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  async execute(input: UpdateAppointmentByStaffInput): Promise<Appointment> {
    return this.appointments.updateByStaff(input);
  }
}
