import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateAppointmentUseCase } from "../application/create-appointment.use-case";

describe("CreateAppointmentUseCase", () => {
  let useCase: CreateAppointmentUseCase;
  let mockRepository: any;
  let mockIsSlotValid: any;
  let mockWriteAudit: any;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn().mockResolvedValue({
        id: "apt-1",
        patientName: "Test Patient",
        patientPhone: "+1234567890",
        doctorName: "Dr. Test",
        requestedAt: new Date("2026-07-01T10:00:00Z"),
        serviceName: "Checkup",
        status: "PENDING",
        createdByUserId: "user-1",
      }),
      findConflicting: vi.fn().mockResolvedValue(null),
    };
    mockIsSlotValid = {
      execute: vi.fn().mockResolvedValue(true),
    };
    mockWriteAudit = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new CreateAppointmentUseCase(mockRepository, mockIsSlotValid, mockWriteAudit);
  });

  it("should reject appointment in the past", async () => {
    const pastDate = new Date("2020-01-01T10:00:00Z");

    await expect(
      useCase.execute(
        {
          createdByUserId: "user-1",
          patientName: "Test",
          patientPhone: "+123",
          doctorName: "Dr",
          requestedAt: pastDate,
          serviceName: "Checkup",
        },
        "PATIENT" as any,
      ),
    ).rejects.toThrow("Cannot book an appointment in the past");

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it("should accept appointment for today", async () => {
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 0, 0));

    const result = await useCase.execute(
      {
        createdByUserId: "user-1",
        patientName: "Test",
        patientPhone: "+123",
        doctorName: "Dr",
        requestedAt: todayUtc,
        serviceName: "Checkup",
        doctorUserId: "doctor-1",
      },
      "PATIENT" as any,
    );

    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it("should accept appointment in the future", async () => {
    const futureDate = new Date("2026-12-24T10:00:00Z");

    const result = await useCase.execute(
      {
        createdByUserId: "user-1",
        patientName: "Test",
        patientPhone: "+123",
        doctorName: "Dr",
        requestedAt: futureDate,
        serviceName: "Checkup",
        doctorUserId: "doctor-1",
      },
      "PATIENT" as any,
    );

    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it("should check slot validity for future appointments with doctorUserId", async () => {
    const futureDate = new Date("2026-12-24T10:00:00Z");

    await useCase.execute(
      {
        createdByUserId: "user-1",
        patientName: "Test",
        patientPhone: "+123",
        doctorName: "Dr",
        requestedAt: futureDate,
        serviceName: "Checkup",
        doctorUserId: "doctor-1",
      },
      "PATIENT" as any,
    );

    expect(mockIsSlotValid.execute).toHaveBeenCalledWith("doctor-1", futureDate);
  });

  it("should reject when slot is outside working hours", async () => {
    mockIsSlotValid.execute.mockResolvedValue(false);

    const futureDate = new Date("2026-12-24T10:00:00Z");

    await expect(
      useCase.execute(
        {
          createdByUserId: "user-1",
          patientName: "Test",
          patientPhone: "+123",
          doctorName: "Dr",
          requestedAt: futureDate,
          serviceName: "Checkup",
          doctorUserId: "doctor-1",
        },
        "PATIENT" as any,
      ),
    ).rejects.toThrow("The requested time slot is outside the doctor's working hours");
  });

  it("should reject double-booking when same doctor already has appointment at same time", async () => {
    mockRepository.findConflicting.mockResolvedValue({
      id: "apt-existing",
      doctorUserId: "doctor-1",
      requestedAt: new Date("2026-12-24T10:00:00Z"),
      status: "PENDING",
    });

    const futureDate = new Date("2026-12-24T10:00:00Z");

    await expect(
      useCase.execute(
        {
          createdByUserId: "user-1",
          patientName: "Test",
          patientPhone: "+123",
          doctorName: "Dr",
          requestedAt: futureDate,
          serviceName: "Checkup",
          doctorUserId: "doctor-1",
        },
        "PATIENT" as any,
      ),
    ).rejects.toThrow("This time slot is already booked");

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it("should allow booking when conflicting appointment is cancelled", async () => {
    mockRepository.findConflicting.mockResolvedValue(null);

    const futureDate = new Date("2026-12-24T10:00:00Z");

    const result = await useCase.execute(
      {
        createdByUserId: "user-1",
        patientName: "Test",
        patientPhone: "+123",
        doctorName: "Dr",
        requestedAt: futureDate,
        serviceName: "Checkup",
        doctorUserId: "doctor-1",
      },
      "PATIENT" as any,
    );

    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it("should not check conflicts when doctorUserId is not provided", async () => {
    const futureDate = new Date("2026-12-24T10:00:00Z");

    await useCase.execute(
      {
        createdByUserId: "user-1",
        patientName: "Test",
        patientPhone: "+123",
        doctorName: "Dr",
        requestedAt: futureDate,
        serviceName: "Checkup",
      },
      "PATIENT" as any,
    );

    expect(mockRepository.findConflicting).not.toHaveBeenCalled();
  });
});
