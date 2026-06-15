import type { Appointment } from "../domain/appointment.entity";
import type { AppointmentRepository } from "../domain/appointment.repository";

export class CancelMyAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(appointmentId: string, userId: string): Promise<Appointment> {
    return this.repository.cancelByCreator(appointmentId, userId);
  }
}
