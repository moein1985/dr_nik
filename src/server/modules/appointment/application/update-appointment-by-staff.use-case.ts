import type { Appointment } from "../domain/appointment.entity";
import type { AppointmentRepository } from "../domain/appointment.repository";
import type { IsSlotValidUseCase } from "../../doctor-availability/application/is-slot-valid.use-case";
import type { WriteAuditUseCase } from "../../appointment-audit/application/write-audit.use-case";
import type { UserRole } from "@prisma/client";

export type UpdateAppointmentByStaffInput = {
  id: string;
  doctorUserId?: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  serviceName: string;
  requestedAt: Date;
  notes?: string;
};

export class UpdateAppointmentByStaffUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly isSlotValid?: IsSlotValidUseCase,
    private readonly writeAudit?: WriteAuditUseCase
  ) {}

  async execute(input: UpdateAppointmentByStaffInput, actorUserId: string, actorRole: UserRole): Promise<Appointment> {
    const before = await this.appointments.findById(input.id);
    if (input.doctorUserId && this.isSlotValid) {
      const isValid = await this.isSlotValid.execute(input.doctorUserId, input.requestedAt);
      if (!isValid) {
        throw new Error("The requested time slot is outside the doctor's working hours");
      }
    }

    if (input.doctorUserId) {
      const conflicting = await this.appointments.findConflicting(input.doctorUserId, input.requestedAt, input.id);
      if (conflicting) {
        throw new Error("This time slot is already booked. Please choose another time.");
      }
    }

    const appointment = await this.appointments.updateByStaff(input);

    if (this.writeAudit) {
      await this.writeAudit.execute({
        appointmentId: appointment.id,
        action: "UPDATED",
        actorUserId,
        actorRole,
        before,
        after: appointment,
      });
    }

    return appointment;
  }
}
