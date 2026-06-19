import type { Appointment } from "../domain/appointment.entity";
import type { AppointmentRepository } from "../domain/appointment.repository";

export class ListAppointmentsByDoctorIdsUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  async execute(doctorUserIds: string[]): Promise<Appointment[]> {
    return this.appointments.listByDoctorIds(doctorUserIds);
  }
}
