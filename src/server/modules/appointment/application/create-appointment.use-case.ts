import type {
  AppointmentRepository,
  CreateAppointmentInput,
} from "../domain/appointment.repository";
import type { Appointment } from "../domain/appointment.entity";

export class CreateAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    return this.repository.create(input);
  }
}
