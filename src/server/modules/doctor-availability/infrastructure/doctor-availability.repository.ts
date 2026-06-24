import type { PrismaClient } from "@prisma/client";

export type DoctorAvailabilitySlot = {
  id: string;
  doctorUserId: string;
  weekday: number;
  startMinute: number;
  endMinute: number;
  isActive: boolean;
};

export type CreateSlotInput = {
  doctorUserId: string;
  weekday: number;
  startMinute: number;
  endMinute: number;
  isActive: boolean;
};

export class DoctorAvailabilityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByDoctor(doctorUserId: string): Promise<DoctorAvailabilitySlot[]> {
    return this.prisma.doctorAvailability.findMany({
      where: { doctorUserId },
      orderBy: [{ weekday: "asc" }, { startMinute: "asc" }],
    });
  }

  async findActiveSlotsForDoctor(doctorUserId: string): Promise<DoctorAvailabilitySlot[]> {
    return this.prisma.doctorAvailability.findMany({
      where: { doctorUserId, isActive: true },
      orderBy: [{ weekday: "asc" }, { startMinute: "asc" }],
    });
  }

  async deleteAllForDoctor(doctorUserId: string): Promise<void> {
    await this.prisma.doctorAvailability.deleteMany({
      where: { doctorUserId },
    });
  }

  async createMany(slots: CreateSlotInput[]): Promise<void> {
    await this.prisma.doctorAvailability.createMany({
      data: slots,
    });
  }
}
