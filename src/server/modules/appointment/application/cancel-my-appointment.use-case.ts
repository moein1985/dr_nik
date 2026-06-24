import type { Appointment } from "../domain/appointment.entity";
import type { AppointmentRepository } from "../domain/appointment.repository";
import type { WriteAuditUseCase } from "../../appointment-audit/application/write-audit.use-case";
import type { UserRole } from "@prisma/client";

export class CancelMyAppointmentUseCase {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly writeAudit?: WriteAuditUseCase
  ) {}

  async execute(appointmentId: string, userId: string): Promise<Appointment> {
    const appointments = await this.repository.listByCreator(userId);
    const target = appointments.find((item) => item.id === appointmentId);

    if (!target) {
      throw new Error("Appointment not found for this user");
    }

    const msUntilAppointment = target.requestedAt.getTime() - Date.now();
    const cancelWindowMs = 24 * 60 * 60 * 1000;

    if (msUntilAppointment < cancelWindowMs) {
      throw new Error("Appointments can only be cancelled at least 24 hours before the scheduled time");
    }

    const appointment = await this.repository.cancelByCreator(appointmentId, userId);

    if (this.writeAudit) {
      await this.writeAudit.execute({
        appointmentId: appointment.id,
        action: "CANCELLED",
        actorUserId: userId,
        actorRole: "PATIENT" as UserRole,
        before: target,
        after: appointment,
      });
    }

    return appointment;
  }
}
