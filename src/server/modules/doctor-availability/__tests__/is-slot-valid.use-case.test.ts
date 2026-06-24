import { describe, it, expect, beforeEach, vi } from "vitest";
import { IsSlotValidUseCase } from "../application/is-slot-valid.use-case";

describe("IsSlotValidUseCase", () => {
  let useCase: IsSlotValidUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findByDoctorAndDay: vi.fn(),
    };

    useCase = new IsSlotValidUseCase(mockRepository);
  });

  it("should return true when slot is available", async () => {
    const requestedAt = new Date("2026-12-25T10:00:00Z");
    
    const mockAvailability = {
      id: "avail-1",
      doctorUserId: "doctor-1",
      dayOfWeek: 4, // Thursday
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    };

    mockRepository.findByDoctorAndDay.mockResolvedValue([mockAvailability]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(true);
    expect(mockRepository.findByDoctorAndDay).toHaveBeenCalledWith("doctor-1", 4);
  });

  it("should return false when no availability exists", async () => {
    const requestedAt = new Date("2026-12-25T10:00:00Z");
    
    mockRepository.findByDoctorAndDay.mockResolvedValue([]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(false);
  });

  it("should return false when time is outside availability window", async () => {
    const requestedAt = new Date("2026-12-25T18:00:00Z"); // 6 PM
    
    const mockAvailability = {
      id: "avail-1",
      doctorUserId: "doctor-1",
      dayOfWeek: 4,
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    };

    mockRepository.findByDoctorAndDay.mockResolvedValue([mockAvailability]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(false);
  });

  it("should return false when availability is inactive", async () => {
    const requestedAt = new Date("2026-12-25T10:00:00Z");
    
    const mockAvailability = {
      id: "avail-1",
      doctorUserId: "doctor-1",
      dayOfWeek: 4,
      startTime: "09:00",
      endTime: "17:00",
      isActive: false,
    };

    mockRepository.findByDoctorAndDay.mockResolvedValue([mockAvailability]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(false);
  });
});
