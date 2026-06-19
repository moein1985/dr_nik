import type { UserRepository } from "@/server/modules/auth/domain/user.repository";
import type { DoctorStaffAssignment } from "../domain/doctor-staff-assignment.entity";
import type { DoctorStaffAssignmentRepository } from "../domain/doctor-staff-assignment.repository";

export class AssignStaffToDoctorUseCase {
  constructor(
    private readonly assignments: DoctorStaffAssignmentRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(doctorUserId: string, staffUserId: string): Promise<DoctorStaffAssignment> {
    const doctor = await this.users.findById(doctorUserId);
    if (!doctor || (doctor.role !== "DOCTOR" && doctor.role !== "ADMIN")) {
      throw new Error("Doctor user not found");
    }

    const staff = await this.users.findById(staffUserId);
    if (!staff || staff.role !== "STAFF") {
      throw new Error("Staff user not found");
    }

    if (!staff.isActive) {
      throw new Error("Staff user is inactive");
    }

    return this.assignments.upsertActive(doctorUserId, staffUserId);
  }
}
