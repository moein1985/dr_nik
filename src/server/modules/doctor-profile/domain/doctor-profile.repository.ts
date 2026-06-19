import type { DoctorProfile, UpsertDoctorProfileInput } from "./doctor-profile.entity";

export interface DoctorProfileRepository {
  findByUserId(userId: string): Promise<DoctorProfile | null>;
  upsertByUserId(userId: string, input: UpsertDoctorProfileInput): Promise<DoctorProfile>;
}
