import type { DoctorServiceRepository, DoctorServiceItem } from "../infrastructure/doctor-service.repository";

export class ListForDoctorUseCase {
  constructor(private readonly repository: DoctorServiceRepository) {}

  async execute(doctorUserId: string): Promise<DoctorServiceItem[]> {
    return this.repository.findActiveByDoctor(doctorUserId);
  }
}
