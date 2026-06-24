import type { PrismaClient } from "@prisma/client";

export type DoctorServiceItem = {
  id: string;
  doctorUserId: string;
  serviceKey: string;
  serviceLabel: string;
  isActive: boolean;
};

export type CreateServiceInput = {
  doctorUserId: string;
  serviceKey: string;
  serviceLabel: string;
  isActive: boolean;
};

export class DoctorServiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByDoctor(doctorUserId: string): Promise<DoctorServiceItem[]> {
    return this.prisma.doctorService.findMany({
      where: { doctorUserId },
      orderBy: { serviceLabel: "asc" },
    });
  }

  async findActiveByDoctor(doctorUserId: string): Promise<DoctorServiceItem[]> {
    return this.prisma.doctorService.findMany({
      where: { doctorUserId, isActive: true },
      orderBy: { serviceLabel: "asc" },
    });
  }

  async deleteAllForDoctor(doctorUserId: string): Promise<void> {
    await this.prisma.doctorService.deleteMany({
      where: { doctorUserId },
    });
  }

  async createMany(services: CreateServiceInput[]): Promise<void> {
    await this.prisma.doctorService.createMany({
      data: services,
    });
  }
}
