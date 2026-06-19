import type { DoctorProfile } from "../domain/doctor-profile.entity";
import type { DoctorProfileRepository } from "../domain/doctor-profile.repository";

export class GetMyDoctorProfileUseCase {
  constructor(private readonly repository: DoctorProfileRepository) {}

  async execute(userId: string): Promise<DoctorProfile | null> {
    return this.repository.findByUserId(userId);
  }
}
