import type { DoctorAvailabilityRepository, DoctorAvailabilitySlot } from "../infrastructure/doctor-availability.repository";

export class ListByDoctorUseCase {
  constructor(private readonly repository: DoctorAvailabilityRepository) {}

  async execute(doctorUserId: string): Promise<DoctorAvailabilitySlot[]> {
    return this.repository.findByDoctor(doctorUserId);
  }
}
