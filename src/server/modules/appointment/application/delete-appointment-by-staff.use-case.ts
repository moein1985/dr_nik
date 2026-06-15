import type { AppointmentRepository } from "../domain/appointment.repository";

export class DeleteAppointmentByStaffUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(appointmentId: string): Promise<void> {
    await this.repository.delete(appointmentId);
  }
}
