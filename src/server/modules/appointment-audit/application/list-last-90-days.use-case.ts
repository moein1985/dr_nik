import type { AppointmentAuditRepository, AuditLogEntry, AuditLogFilters } from "../infrastructure/appointment-audit.repository";

export class ListLast90DaysUseCase {
  constructor(private repository: AppointmentAuditRepository) {}

  async execute(filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
    return this.repository.listLast90Days(filters);
  }
}
