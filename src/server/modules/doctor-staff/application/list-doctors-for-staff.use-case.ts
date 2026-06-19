import type { PublicUser } from "@/server/modules/auth/domain/user.entity";
import { toPublicUser } from "@/server/modules/auth/domain/user.entity";
import type { UserRepository } from "@/server/modules/auth/domain/user.repository";
import type { DoctorStaffAssignmentRepository } from "../domain/doctor-staff-assignment.repository";

export class ListDoctorsForStaffUseCase {
  constructor(
    private readonly assignments: DoctorStaffAssignmentRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(staffUserId: string): Promise<PublicUser[]> {
    const rows = await this.assignments.listByStaffUserId(staffUserId);
    const doctors: PublicUser[] = [];

    for (const row of rows) {
      const user = await this.users.findById(row.doctorUserId);
      if (user && (user.role === "DOCTOR" || user.role === "ADMIN") && user.isActive) {
        doctors.push(toPublicUser(user));
      }
    }

    return doctors;
  }
}
