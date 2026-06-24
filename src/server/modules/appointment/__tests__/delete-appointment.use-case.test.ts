import { describe, it, expect, beforeEach, vi } from "vitest";
import { DeleteAppointmentByStaffUseCase } from "../application/delete-appointment-by-staff.use-case";
import type { AppointmentRepository } from "../infrastructure/prisma-appointment.repository";
import type { WriteAuditUseCase } from "../../appointment-audit/application/write-audit.use-case";

describe("DeleteAppointmentByStaffUseCase", () => {
  let useCase: DeleteAppointmentByStaffUseCase;
  let mockRepository: any;
  let mockWriteAudit: any;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
    };
    mockWriteAudit = {
      execute: vi.fn(),
    };

    useCase = new DeleteAppointmentByStaffUseCase(
      mockRepository as unknown as AppointmentRepository,
      mockWriteAudit as unknown as WriteAuditUseCase,
    );
  });

  it("should delete appointment successfully", async () => {
    const appointment = {
      id: "apt-1",
      status: "PENDING",
      createdByUserId: "user-1",
      patientName: "John Doe",
      patientPhone: "1234567890",
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findById.mockResolvedValue(appointment);
    mockRepository.delete.mockResolvedValue(undefined);
    mockWriteAudit.execute.mockResolvedValue(undefined);

    await useCase.execute("apt-1", "staff-1", "STAFF");

    expect(mockRepository.findById).toHaveBeenCalledWith("apt-1");
    expect(mockRepository.delete).toHaveBeenCalledWith("apt-1");
    expect(mockWriteAudit.execute).toHaveBeenCalledWith({
      appointmentId: "apt-1",
      action: "DELETED",
      actorUserId: "staff-1",
      actorRole: "STAFF",
      beforeJson: expect.any(String),
    });
  });

  it("should throw error when appointment not found", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute("apt-1", "staff-1", "STAFF")
    ).rejects.toThrow("Appointment not found");

    expect(mockRepository.delete).not.toHaveBeenCalled();
    expect(mockWriteAudit.execute).not.toHaveBeenCalled();
  });
});
