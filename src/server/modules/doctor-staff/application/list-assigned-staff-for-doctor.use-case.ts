import type { PublicUser } from "@/server/modules/auth/domain/user.entity";
import { toPublicUser } from "@/server/modules/auth/domain/user.entity";
import type { UserRepository } from "@/server/modules/auth/domain/user.repository";
import type { DoctorStaffAssignmentRepository } from "../domain/doctor-staff-assignment.repository";

export class ListAssignedStaffForDoctorUseCase {
  constructor(
    private readonly assignments: DoctorStaffAssignmentRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(doctorUserId: string): Promise<PublicUser[]> {
    const rows = await this.assignments.listByDoctorUserId(doctorUserId);
    const result: PublicUser[] = [];

    for (const row of rows) {
      const user = await this.users.findById(row.staffUserId);
      if (user && user.role === "STAFF" && user.isActive) {
        result.push(toPublicUser(user));
      }
    }

    return result;
  }
}
