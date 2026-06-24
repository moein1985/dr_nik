import { describe, it, expect, beforeEach, vi } from "vitest";
import { DoctorServiceRepository } from "../infrastructure/doctor-service.repository";
import type { PrismaClient } from "@prisma/client";

describe("DoctorServiceRepository", () => {
  let repository: DoctorServiceRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      doctorService: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
    };
    repository = new DoctorServiceRepository(mockPrisma as unknown as PrismaClient);
  });

  it("should find services by doctor", async () => {
    const mockServices = [
      { id: "service-1", serviceKey: "consultation", serviceLabel: "Consultation", doctorUserId: "doctor-1", isActive: true },
      { id: "service-2", serviceKey: "surgery", serviceLabel: "Surgery", doctorUserId: "doctor-1", isActive: true },
    ];

    mockPrisma.doctorService.findMany.mockResolvedValue(mockServices);

    const result = await repository.findByDoctor("doctor-1");

    expect(result).toEqual(mockServices);
    expect(mockPrisma.doctorService.findMany).toHaveBeenCalledWith({
      where: { doctorUserId: "doctor-1" },
      orderBy: { serviceLabel: "asc" },
    });
  });

  it("should find active services by doctor", async () => {
    const mockServices = [
      { id: "service-1", serviceKey: "consultation", serviceLabel: "Consultation", doctorUserId: "doctor-1", isActive: true },
    ];

    mockPrisma.doctorService.findMany.mockResolvedValue(mockServices);

    const result = await repository.findActiveByDoctor("doctor-1");

    expect(result).toEqual(mockServices);
    expect(mockPrisma.doctorService.findMany).toHaveBeenCalledWith({
      where: { doctorUserId: "doctor-1", isActive: true },
      orderBy: { serviceLabel: "asc" },
    });
  });

  it("should delete all services for doctor", async () => {
    mockPrisma.doctorService.deleteMany.mockResolvedValue({ count: 2 });

    await repository.deleteAllForDoctor("doctor-1");

    expect(mockPrisma.doctorService.deleteMany).toHaveBeenCalledWith({
      where: { doctorUserId: "doctor-1" },
    });
  });

  it("should create many services", async () => {
    const services = [
      { doctorUserId: "doctor-1", serviceKey: "consultation", serviceLabel: "Consultation", isActive: true },
      { doctorUserId: "doctor-1", serviceKey: "surgery", serviceLabel: "Surgery", isActive: true },
    ];

    mockPrisma.doctorService.createMany.mockResolvedValue({ count: 2 });

    await repository.createMany(services);

    expect(mockPrisma.doctorService.createMany).toHaveBeenCalledWith({
      data: services,
    });
  });
});
