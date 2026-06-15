import type { Appointment } from "../domain/appointment.entity";
import type { AppointmentRepository } from "../domain/appointment.repository";

export class ListMyAppointmentsUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(userId: string): Promise<Appointment[]> {
    return this.repository.listByCreator(userId);
  }
}
