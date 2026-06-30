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
    const requestedAt = new Date("2026-12-24T10:00:00Z");

    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([
      { id: "avail-1", doctorUserId: "doctor-1", weekday: 4, startMinute: 540, endMinute: 1020, isActive: true },
    ]);

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
    const requestedAt = new Date("2026-12-24T18:00:00Z");

    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([
      { id: "avail-1", doctorUserId: "doctor-1", weekday: 4, startMinute: 540, endMinute: 1020, isActive: true },
    ]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(false);
  });

  it("should use UTC methods for weekday extraction (Bug 4)", async () => {
    // 2026-12-24T22:00:00Z is Thursday 22:00 UTC
    // In Tehran timezone (UTC+3:30) this would be Friday 01:30 local
    // The old code used getDay() which would return Friday (5) in Tehran
    // The fix uses getUTCDay() which returns Thursday (4)
    const requestedAt = new Date("2026-12-24T22:00:00Z");

    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([
      { id: "avail-1", doctorUserId: "doctor-1", weekday: 4, startMinute: 1200, endMinute: 1380, isActive: true },
    ]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(true);
  });

  it("should use UTC hours for minute-of-day calculation (Bug 4)", async () => {
    // 2026-12-24T10:30:00Z → UTC hour=10, minute=30 → minuteOfDay=630
    // In Tehran (UTC+3:30) local hour would be 14:00 → minuteOfDay=840
    const requestedAt = new Date("2026-12-24T10:30:00Z");

    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([
      { id: "avail-1", doctorUserId: "doctor-1", weekday: 4, startMinute: 600, endMinute: 660, isActive: true },
    ]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(true);
  });

  it("should reject when weekday matches but UTC time is outside slot", async () => {
    // 2026-12-24T10:00:00Z → Thursday 10:00 UTC → minuteOfDay=600
    // Slot is 09:00-10:00 (540-600), end is exclusive so 600 >= 600 is false
    const requestedAt = new Date("2026-12-24T10:00:00Z");

    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([
      { id: "avail-1", doctorUserId: "doctor-1", weekday: 4, startMinute: 540, endMinute: 600, isActive: true },
    ]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(false);
  });

  it("should match when requested time is exactly at start minute", async () => {
    const requestedAt = new Date("2026-12-24T09:00:00Z");

    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([
      { id: "avail-1", doctorUserId: "doctor-1", weekday: 4, startMinute: 540, endMinute: 1020, isActive: true },
    ]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(true);
  });

  it("should match across multiple slots", async () => {
    const requestedAt = new Date("2026-12-24T14:00:00Z");

    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([
      { id: "avail-1", doctorUserId: "doctor-1", weekday: 4, startMinute: 540, endMinute: 720, isActive: true },
      { id: "avail-2", doctorUserId: "doctor-1", weekday: 4, startMinute: 780, endMinute: 1020, isActive: true },
    ]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(true);
  });

  it("should return false when weekday does not match any slot", async () => {
    // 2026-12-25 is Friday (weekday 5)
    const requestedAt = new Date("2026-12-25T10:00:00Z");

    mockRepository.findActiveSlotsForDoctor.mockResolvedValue([
      { id: "avail-1", doctorUserId: "doctor-1", weekday: 4, startMinute: 540, endMinute: 1020, isActive: true },
    ]);

    const result = await useCase.execute("doctor-1", requestedAt);

    expect(result).toBe(false);
  });
});
