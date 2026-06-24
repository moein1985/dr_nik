import type { PrismaClient } from "@prisma/client";
import { AppointmentAuditRepository } from "../infrastructure/appointment-audit.repository";
import { WriteAuditUseCase } from "../application/write-audit.use-case";
import { ListLast90DaysUseCase } from "../application/list-last-90-days.use-case";

export class AppointmentAuditService {
  public readonly writeAudit: WriteAuditUseCase;
  public readonly listLast90Days: ListLast90DaysUseCase;

  constructor(prisma: PrismaClient) {
    const repository = new AppointmentAuditRepository(prisma);
    this.writeAudit = new WriteAuditUseCase(repository);
    this.listLast90Days = new ListLast90DaysUseCase(repository);
  }
}
