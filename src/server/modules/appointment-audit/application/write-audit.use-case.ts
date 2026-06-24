import type { UserRole } from "@prisma/client";
import type { AppointmentAuditRepository } from "../infrastructure/appointment-audit.repository";

export class WriteAuditUseCase {
  constructor(private repository: AppointmentAuditRepository) {}

  async execute(data: {
    appointmentId?: string;
    action: string;
    actorUserId: string;
    actorRole: UserRole;
    before?: any;
    after?: any;
  }): Promise<void> {
    await this.repository.create({
      appointmentId: data.appointmentId,
      action: data.action,
      actorUserId: data.actorUserId,
      actorRole: data.actorRole,
      beforeJson: data.before ? JSON.stringify(data.before) : undefined,
      afterJson: data.after ? JSON.stringify(data.after) : undefined,
    });
  }
}
