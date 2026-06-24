import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdateAppointmentStatusUseCase } from "../application/update-appointment-status.use-case";
import type { AppointmentRepository } from "../infrastructure/prisma-appointment.repository";
import type { WriteAuditUseCase } from "../../appointment-audit/application/write-audit.use-case";

describe("UpdateAppointmentStatusUseCase", () => {
  let useCase: UpdateAppointmentStatusUseCase;
  let mockRepository: any;
  let mockWriteAudit: any;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };
    mockWriteAudit = {
      execute: vi.fn(),
    };

    useCase = new UpdateAppointmentStatusUseCase(
      mockRepository as unknown as AppointmentRepository,
      mockWriteAudit as unknown as WriteAuditUseCase,
    );
  });

  it("should update appointment status successfully", async () => {
    const oldAppointment = {
      id: "apt-1",
      status: "PENDING",
      createdByUserId: "user-1",
      patientName: "John Doe",
      patientPhone: "1234567890",
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedAppointment = {
      ...oldAppointment,
      status: "CONFIRMED",
    };

    mockRepository.findById.mockResolvedValue(oldAppointment);
    mockRepository.updateStatus.mockResolvedValue(updatedAppointment);
    mockWriteAudit.execute.mockResolvedValue(undefined);

    const result = await useCase.execute("apt-1", "CONFIRMED", "staff-1", "STAFF");

    expect(mockRepository.findById).toHaveBeenCalledWith("apt-1");
    expect(mockRepository.updateStatus).toHaveBeenCalledWith("apt-1", "CONFIRMED");
    expect(mockWriteAudit.execute).toHaveBeenCalledWith({
      appointmentId: "apt-1",
      action: "STATUS_CHANGED",
      actorUserId: "staff-1",
      actorRole: "STAFF",
      beforeJson: expect.any(String),
      afterJson: expect.any(String),
    });
    expect(result).toEqual(updatedAppointment);
  });

  it("should throw error when appointment not found", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute("apt-1", "CONFIRMED", "staff-1", "STAFF")
    ).rejects.toThrow("Appointment not found");

    expect(mockRepository.updateStatus).not.toHaveBeenCalled();
    expect(mockWriteAudit.execute).not.toHaveBeenCalled();
  });
});
