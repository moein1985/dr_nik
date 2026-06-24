import { DoctorAvailabilityRepository } from "../infrastructure/doctor-availability.repository";
import { ListByDoctorUseCase } from "../application/list-by-doctor.use-case";
import { ReplaceForDoctorUseCase } from "../application/replace-for-doctor.use-case";
import { IsSlotValidUseCase } from "../application/is-slot-valid.use-case";
import type { PrismaClient } from "@prisma/client";

export class DoctorAvailabilityService {
  public readonly listByDoctor: ListByDoctorUseCase;
  public readonly replaceForDoctor: ReplaceForDoctorUseCase;
  public readonly isSlotValid: IsSlotValidUseCase;

  constructor(prisma: PrismaClient) {
    const repository = new DoctorAvailabilityRepository(prisma);
    this.listByDoctor = new ListByDoctorUseCase(repository);
    this.replaceForDoctor = new ReplaceForDoctorUseCase(repository);
    this.isSlotValid = new IsSlotValidUseCase(repository);
  }
}
