import { describe, it, expect, beforeEach, vi } from "vitest";
import { DoctorServiceRepository } from "../infrastructure/doctor-service.repository";
import type { PrismaClient } from "@prisma/client";

describe("DoctorServiceRepository", () => {
  let repository: DoctorServiceRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      doctorService: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    repository = new DoctorServiceRepository(mockPrisma as unknown as PrismaClient);
  });

  it("should create a doctor service", async () => {
    const input = {
      doctorUserId: "doctor-1",
      serviceName: "Consultation",
      price: 100000,
      duration: 30,
    };

    const mockService = {
      id: "service-1",
      ...input,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.doctorService.create.mockResolvedValue(mockService);

    const result = await repository.create(input);

    expect(result).toEqual(mockService);
    expect(mockPrisma.doctorService.create).toHaveBeenCalledWith({
      data: input,
    });
  });

  it("should list services by doctor", async () => {
    const mockServices = [
      { id: "service-1", serviceName: "Consultation" },
      { id: "service-2", serviceName: "Surgery" },
    ];

    mockPrisma.doctorService.findMany.mockResolvedValue(mockServices);

    const result = await repository.findByDoctorId("doctor-1");

    expect(result).toEqual(mockServices);
    expect(mockPrisma.doctorService.findMany).toHaveBeenCalledWith({
      where: { doctorUserId: "doctor-1" },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should find service by id", async () => {
    const mockService = {
      id: "service-1",
      serviceName: "Consultation",
      price: 100000,
    };

    mockPrisma.doctorService.findUnique.mockResolvedValue(mockService);

    const result = await repository.findById("service-1");

    expect(result).toEqual(mockService);
    expect(mockPrisma.doctorService.findUnique).toHaveBeenCalledWith({
      where: { id: "service-1" },
    });
  });

  it("should update service", async () => {
    const input = {
      id: "service-1",
      price: 150000,
      duration: 45,
    };

    const mockService = {
      id: "service-1",
      serviceName: "Consultation",
      price: 150000,
      duration: 45,
    };

    mockPrisma.doctorService.update.mockResolvedValue(mockService);

    const result = await repository.update(input);

    expect(result).toEqual(mockService);
    expect(mockPrisma.doctorService.update).toHaveBeenCalled();
  });

  it("should delete service", async () => {
    mockPrisma.doctorService.delete.mockResolvedValue({ id: "service-1" });

    await repository.delete("service-1");

    expect(mockPrisma.doctorService.delete).toHaveBeenCalledWith({
      where: { id: "service-1" },
    });
  });
});
