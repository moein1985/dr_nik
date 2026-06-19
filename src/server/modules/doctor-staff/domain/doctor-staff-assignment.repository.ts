import type { DoctorStaffAssignment } from "./doctor-staff-assignment.entity";

export interface DoctorStaffAssignmentRepository {
  listByDoctorUserId(doctorUserId: string): Promise<DoctorStaffAssignment[]>;
  listByStaffUserId(staffUserId: string): Promise<DoctorStaffAssignment[]>;
  upsertActive(doctorUserId: string, staffUserId: string): Promise<DoctorStaffAssignment>;
  deactivate(doctorUserId: string, staffUserId: string): Promise<void>;
  isActiveAssignment(doctorUserId: string, staffUserId: string): Promise<boolean>;
}
