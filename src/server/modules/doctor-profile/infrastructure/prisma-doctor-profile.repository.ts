import type { DoctorProfile as PrismaDoctorProfile, PrismaClient } from "@prisma/client";
import type { DoctorProfile, UpsertDoctorProfileInput } from "../domain/doctor-profile.entity";
import type { DoctorProfileRepository } from "../domain/doctor-profile.repository";

const toDomainDoctorProfile = (profile: PrismaDoctorProfile): DoctorProfile => ({
  id: profile.id,
  userId: profile.userId,
  aboutMe: profile.aboutMe ?? undefined,
  credentials: profile.credentials ?? undefined,
  acceptedInsurances: profile.acceptedInsurances ?? undefined,
  workingHours: profile.workingHours ?? undefined,
  specialties: profile.specialties ?? undefined,
  services: profile.services ?? undefined,
  branchAddress: profile.branchAddress ?? undefined,
  experience: profile.experience ?? undefined,
  extraNotes: profile.extraNotes ?? undefined,
  aiProfileContext: profile.aiProfileContext ?? undefined,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

export class PrismaDoctorProfileRepository implements DoctorProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<DoctorProfile | null> {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    return profile ? toDomainDoctorProfile(profile) : null;
  }

  async upsertByUserId(userId: string, input: UpsertDoctorProfileInput): Promise<DoctorProfile> {
    const profile = await this.prisma.doctorProfile.upsert({
      where: { userId },
      create: {
        userId,
        aboutMe: input.aboutMe ?? null,
        credentials: input.credentials ?? null,
        acceptedInsurances: input.acceptedInsurances ?? null,
        workingHours: input.workingHours ?? null,
        specialties: input.specialties ?? null,
        services: input.services ?? null,
        branchAddress: input.branchAddress ?? null,
        experience: input.experience ?? null,
        extraNotes: input.extraNotes ?? null,
        aiProfileContext: input.aiProfileContext ?? null,
      },
      update: {
        aboutMe: input.aboutMe ?? null,
        credentials: input.credentials ?? null,
        acceptedInsurances: input.acceptedInsurances ?? null,
        workingHours: input.workingHours ?? null,
        specialties: input.specialties ?? null,
        services: input.services ?? null,
        branchAddress: input.branchAddress ?? null,
        experience: input.experience ?? null,
        extraNotes: input.extraNotes ?? null,
        aiProfileContext: input.aiProfileContext ?? null,
      },
    });

    return toDomainDoctorProfile(profile);
  }
}
