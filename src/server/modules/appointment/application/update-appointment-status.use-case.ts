import type { Appointment, AppointmentStatus } from "../domain/appointment.entity";
import type { AppointmentRepository } from "../domain/appointment.repository";

export class UpdateAppointmentStatusUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(appointmentId: string, status: AppointmentStatus): Promise<Appointment> {
    return this.repository.updateStatus(appointmentId, status);
  }
}
