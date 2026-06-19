import type { DoctorStaffAssignment as PrismaDoctorStaffAssignment, PrismaClient } from "@prisma/client";
import type { DoctorStaffAssignment } from "../domain/doctor-staff-assignment.entity";
import type { DoctorStaffAssignmentRepository } from "../domain/doctor-staff-assignment.repository";

const toDomain = (item: PrismaDoctorStaffAssignment): DoctorStaffAssignment => ({
  id: item.id,
  doctorUserId: item.doctorUserId,
  staffUserId: item.staffUserId,
  isActive: item.isActive,
  assignedAt: item.assignedAt,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export class PrismaDoctorStaffAssignmentRepository implements DoctorStaffAssignmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listByDoctorUserId(doctorUserId: string): Promise<DoctorStaffAssignment[]> {
    const items = await this.prisma.doctorStaffAssignment.findMany({
      where: { doctorUserId, isActive: true },
      orderBy: { assignedAt: "desc" },
    });

    return items.map(toDomain);
  }

  async listByStaffUserId(staffUserId: string): Promise<DoctorStaffAssignment[]> {
    const items = await this.prisma.doctorStaffAssignment.findMany({
      where: { staffUserId, isActive: true },
      orderBy: { assignedAt: "desc" },
    });

    return items.map(toDomain);
  }

  async upsertActive(doctorUserId: string, staffUserId: string): Promise<DoctorStaffAssignment> {
    const item = await this.prisma.doctorStaffAssignment.upsert({
      where: {
        doctorUserId_staffUserId: {
          doctorUserId,
          staffUserId,
        },
      },
      create: {
        doctorUserId,
        staffUserId,
        isActive: true,
      },
      update: {
        isActive: true,
      },
    });

    return toDomain(item);
  }

  async deactivate(doctorUserId: string, staffUserId: string): Promise<void> {
    await this.prisma.doctorStaffAssignment.updateMany({
      where: {
        doctorUserId,
        staffUserId,
      },
      data: {
        isActive: false,
      },
    });
  }

  async isActiveAssignment(doctorUserId: string, staffUserId: string): Promise<boolean> {
    const item = await this.prisma.doctorStaffAssignment.findUnique({
      where: {
        doctorUserId_staffUserId: {
          doctorUserId,
          staffUserId,
        },
      },
      select: { isActive: true },
    });

    return item?.isActive === true;
  }
}
