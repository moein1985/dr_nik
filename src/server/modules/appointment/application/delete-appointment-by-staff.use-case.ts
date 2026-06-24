import type { AppointmentRepository } from "../domain/appointment.repository";
import type { WriteAuditUseCase } from "../../appointment-audit/application/write-audit.use-case";
import type { UserRole } from "@prisma/client";

export class DeleteAppointmentByStaffUseCase {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly writeAudit?: WriteAuditUseCase
  ) {}

  async execute(appointmentId: string, actorUserId: string, actorRole: UserRole): Promise<void> {
    const before = await this.repository.findById(appointmentId);
    await this.repository.delete(appointmentId);

    if (this.writeAudit && before) {
      await this.writeAudit.execute({
        appointmentId,
        action: "DELETED",
        actorUserId,
        actorRole,
        before,
      });
    }
  }
}
