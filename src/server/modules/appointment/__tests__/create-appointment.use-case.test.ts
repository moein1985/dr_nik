import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateAppointmentUseCase } from "../application/create-appointment.use-case";
import type { AppointmentRepository } from "../infrastructure/appointment.repository";
import type { IsSlotValidUseCase } from "../../doctor-availability/application/is-slot-valid.use-case";
import type { WriteAuditUseCase } from "../../appointment-audit/application/write-audit.use-case";

describe("CreateAppointmentUseCase", () => {
  let useCase: CreateAppointmentUseCase;
  let mockRepository: any;
  let mockIsSlotValid: any;
  let mockWriteAudit: any;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
    };
    mockIsSlotValid = {
      execute: vi.fn(),
    };
    mockWriteAudit = {
      execute: vi.fn(),
    };

    useCase = new CreateAppointmentUseCase(
      mockRepository as unknown as AppointmentRepository,
      mockIsSlotValid as unknown as IsSlotValidUseCase,
      mockWriteAudit as unknown as WriteAuditUseCase,
    );
  });

  it("should create appointment when slot is valid", async () => {
    const input = {
      createdByUserId: "user-1",
      doctorUserId: "doctor-1",
      patientName: "John Doe",
      patientPhone: "1234567890",
      doctorName: "Dr. Smith",
      requestedAt: new Date("2026-12-25T10:00:00Z"),
      serviceName: "Consultation",
    };

    const mockAppointment = {
      id: "apt-1",
      ...input,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockIsSlotValid.execute.mockResolvedValue(true);
    mockRepository.create.mockResolvedValue(mockAppointment);
    mockWriteAudit.execute.mockResolvedValue(undefined);

    const result = await useCase.execute(input, "PATIENT");

    expect(mockIsSlotValid.execute).toHaveBeenCalledWith("doctor-1", input.requestedAt);
    expect(mockRepository.create).toHaveBeenCalledWith(input);
    expect(mockWriteAudit.execute).toHaveBeenCalledWith({
      appointmentId: "apt-1",
      action: "CREATED",
      actorUserId: "user-1",
      actorRole: "PATIENT",
      afterJson: expect.any(String),
    });
    expect(result).toEqual(mockAppointment);
  });

  it("should throw error when slot is invalid", async () => {
    const input = {
      createdByUserId: "user-1",
      doctorUserId: "doctor-1",
      patientName: "John Doe",
      patientPhone: "1234567890",
      doctorName: "Dr. Smith",
      requestedAt: new Date("2026-12-25T10:00:00Z"),
      serviceName: "Consultation",
    };

    mockIsSlotValid.execute.mockResolvedValue(false);

    await expect(useCase.execute(input, "PATIENT")).rejects.toThrow("Requested time slot is not available");
    expect(mockRepository.create).not.toHaveBeenCalled();
    expect(mockWriteAudit.execute).not.toHaveBeenCalled();
  });

  it("should skip slot validation when doctorUserId is not provided", async () => {
    const input = {
      createdByUserId: "user-1",
      patientName: "John Doe",
      patientPhone: "1234567890",
      doctorName: "Dr. Smith",
      requestedAt: new Date("2026-12-25T10:00:00Z"),
      serviceName: "Consultation",
    };

    const mockAppointment = {
      id: "apt-1",
      ...input,
      doctorUserId: null,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.create.mockResolvedValue(mockAppointment);
    mockWriteAudit.execute.mockResolvedValue(undefined);

    const result = await useCase.execute(input, "STAFF");

    expect(mockIsSlotValid.execute).not.toHaveBeenCalled();
    expect(mockRepository.create).toHaveBeenCalled();
    expect(result).toEqual(mockAppointment);
  });
});
