import type { Appointment } from "../domain/appointment.entity";
import type { AppointmentRepository } from "../domain/appointment.repository";

export class FindAppointmentByIdUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  async execute(id: string): Promise<Appointment | null> {
    return this.appointments.findById(id);
  }
}
