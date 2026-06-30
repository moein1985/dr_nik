import type {
  AppointmentRepository,
  CreateAppointmentInput,
} from "../domain/appointment.repository";
import type { Appointment } from "../domain/appointment.entity";
import type { IsSlotValidUseCase } from "../../doctor-availability/application/is-slot-valid.use-case";
import type { WriteAuditUseCase } from "../../appointment-audit/application/write-audit.use-case";
import type { UserRole } from "@prisma/client";

export class CreateAppointmentUseCase {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly isSlotValid?: IsSlotValidUseCase,
    private readonly writeAudit?: WriteAuditUseCase
  ) {}

  async execute(input: CreateAppointmentInput, actorRole: UserRole): Promise<Appointment> {
    const now = new Date();
    const todayUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    if (input.requestedAt.getTime() < todayUtcMidnight) {
      throw new Error("Cannot book an appointment in the past");
    }

    if (input.doctorUserId && this.isSlotValid) {
      const isValid = await this.isSlotValid.execute(input.doctorUserId, input.requestedAt);
      if (!isValid) {
        throw new Error("The requested time slot is outside the doctor's working hours");
      }
    }

    if (input.doctorUserId) {
      const conflicting = await this.repository.findConflicting(input.doctorUserId, input.requestedAt);
      if (conflicting) {
        throw new Error("This time slot is already booked. Please choose another time.");
      }
    }

    const appointment = await this.repository.create(input);

    if (this.writeAudit) {
      await this.writeAudit.execute({
        appointmentId: appointment.id,
        action: "CREATED",
        actorUserId: input.createdByUserId,
        actorRole,
        after: appointment,
      });
    }

    return appointment;
  }
}
