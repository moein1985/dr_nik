import { DoctorServiceRepository } from "../infrastructure/doctor-service.repository";
import { ListForDoctorUseCase } from "../application/list-for-doctor.use-case";
import { SetForDoctorUseCase } from "../application/set-for-doctor.use-case";
import type { PrismaClient } from "@prisma/client";

export class DoctorServiceService {
  public readonly listForDoctor: ListForDoctorUseCase;
  public readonly setForDoctor: SetForDoctorUseCase;

  constructor(prisma: PrismaClient) {
    const repository = new DoctorServiceRepository(prisma);
    this.listForDoctor = new ListForDoctorUseCase(repository);
    this.setForDoctor = new SetForDoctorUseCase(repository);
  }
}
