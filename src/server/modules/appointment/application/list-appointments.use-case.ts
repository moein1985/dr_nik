import type { Appointment } from "../domain/appointment.entity";
import type { AppointmentRepository } from "../domain/appointment.repository";

export class ListAppointmentsUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(): Promise<Appointment[]> {
    return this.repository.list();
  }
}
