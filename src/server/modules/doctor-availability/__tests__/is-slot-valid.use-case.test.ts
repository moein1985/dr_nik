import { describe, it, expect, beforeEach, vi } from "vitest";
import { IsSlotValidUseCase } from "../application/is-slot-valid.use-case";

describe("IsSlotValidUseCase", () => {
  let useCase: IsSlotValidUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findActiveSlotsForDoctor: vi.fn(),
    };

    useCase = new IsSlotValidUseCase(mockRepository);
  });

  it("should return true when slot is available", async () => {
    // Use a date that's guaranteed to be Thursday (2026-12-24 is Thursday)
    const requestedAt = new Date("2026-12-24T10:00:00Z");
    
    const mockAvailability = {
      id: "avail-1",
      doctorUserId: "doctor-1",
      weekday: 4, // Thursday
      startMinute: 540, // 09:00
      endMinute: 1020, // 17:00
      isActive: true,
    };

    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([mockAvailability]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(true);
    expect(mockRepository.findActiveSlotsForDoctor).toHaveBeenCalledWith("doctor-1");
  });

  it("should return false when no availability exists", async () => {
    const requestedAt = new Date("2026-12-24T10:00:00Z");
    
    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(false);
  });

  it("should return false when time is outside availability window", async () => {
    const requestedAt = new Date("2026-12-24T18:00:00Z"); // 6 PM on Thursday
    
    const mockAvailability = {
      id: "avail-1",
      doctorUserId: "doctor-1",
      weekday: 4,
      startMinute: 540, // 09:00
      endMinute: 1020, // 17:00
      isActive: true,
    };

    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([mockAvailability]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(false);
  });

});
