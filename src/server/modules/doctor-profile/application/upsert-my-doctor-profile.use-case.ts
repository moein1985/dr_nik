import type { DoctorProfile, UpsertDoctorProfileInput } from "../domain/doctor-profile.entity";
import type { DoctorProfileRepository } from "../domain/doctor-profile.repository";

export class UpsertMyDoctorProfileUseCase {
  constructor(private readonly repository: DoctorProfileRepository) {}

  async execute(userId: string, input: UpsertDoctorProfileInput): Promise<DoctorProfile> {
    return this.repository.upsertByUserId(userId, input);
  }
}
