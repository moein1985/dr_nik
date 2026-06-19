import type { DoctorStaffAssignmentRepository } from "../domain/doctor-staff-assignment.repository";

export class UnassignStaffFromDoctorUseCase {
  constructor(private readonly assignments: DoctorStaffAssignmentRepository) {}

  async execute(doctorUserId: string, staffUserId: string): Promise<void> {
    await this.assignments.deactivate(doctorUserId, staffUserId);
  }
}
