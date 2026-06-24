import type { Appointment, AppointmentStatus } from "../domain/appointment.entity";
import type { AppointmentRepository } from "../domain/appointment.repository";
import type { WriteAuditUseCase } from "../../appointment-audit/application/write-audit.use-case";
import type { UserRole } from "@prisma/client";

export class UpdateAppointmentStatusUseCase {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly writeAudit?: WriteAuditUseCase
  ) {}

  async execute(appointmentId: string, status: AppointmentStatus, actorUserId: string, actorRole: UserRole): Promise<Appointment> {
    const before = await this.repository.findById(appointmentId);
    const appointment = await this.repository.updateStatus(appointmentId, status);

    if (this.writeAudit) {
      await this.writeAudit.execute({
        appointmentId: appointment.id,
        action: "STATUS_CHANGED",
        actorUserId,
        actorRole,
        before,
        after: appointment,
      });
    }

    return appointment;
  }
}
