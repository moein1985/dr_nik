import { describe, it, expect, beforeEach, vi } from "vitest";
import { WriteAuditUseCase } from "../application/write-audit.use-case";

describe("WriteAuditUseCase", () => {
  let useCase: WriteAuditUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
    };

    useCase = new WriteAuditUseCase(mockRepository);
  });

  it("should write audit log for CREATED action", async () => {
    const input = {
      appointmentId: "apt-1",
      action: "CREATED" as const,
      actorUserId: "user-1",
      actorRole: "PATIENT" as const,
      after: { status: "PENDING" },
    };

    const mockAudit = {
      id: "audit-1",
      ...input,
      beforeJson: undefined,
      afterJson: JSON.stringify({ status: "PENDING" }),
      createdAt: new Date(),
    };

    mockRepository.create.mockResolvedValue(mockAudit);

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      appointmentId: "apt-1",
      action: "CREATED",
      actorUserId: "user-1",
      actorRole: "PATIENT",
      beforeJson: undefined,
      afterJson: JSON.stringify({ status: "PENDING" }),
    });
  });

  it("should write audit log for UPDATED action with before/after", async () => {
    const input = {
      appointmentId: "apt-2",
      action: "UPDATED" as const,
      actorUserId: "staff-1",
      actorRole: "STAFF" as const,
      before: { status: "PENDING" },
      after: { status: "CONFIRMED" },
    };

    const mockAudit = {
      id: "audit-2",
      ...input,
      createdAt: new Date(),
    };

    mockRepository.create.mockResolvedValue(mockAudit);

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      appointmentId: "apt-2",
      action: "UPDATED",
      actorUserId: "staff-1",
      actorRole: "STAFF",
      beforeJson: JSON.stringify({ status: "PENDING" }),
      afterJson: JSON.stringify({ status: "CONFIRMED" }),
    });
  });

  it("should write audit log for DELETED action", async () => {
    const input = {
      appointmentId: "apt-3",
      action: "DELETED" as const,
      actorUserId: "staff-1",
      actorRole: "STAFF" as const,
      before: { status: "PENDING" },
    };

    const mockAudit = {
      id: "audit-3",
      ...input,
      afterJson: undefined,
      createdAt: new Date(),
    };

    mockRepository.create.mockResolvedValue(mockAudit);

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      appointmentId: "apt-3",
      action: "DELETED",
      actorUserId: "staff-1",
      actorRole: "STAFF",
      beforeJson: JSON.stringify({ status: "PENDING" }),
      afterJson: undefined,
    });
  });

  it("should write audit log for STATUS_CHANGED action", async () => {
    const input = {
      appointmentId: "apt-4",
      action: "STATUS_CHANGED" as const,
      actorUserId: "doctor-1",
      actorRole: "DOCTOR" as const,
      before: { status: "PENDING" },
      after: { status: "CONFIRMED" },
    };

    mockRepository.create.mockResolvedValue({ id: "audit-4", ...input });

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      appointmentId: "apt-4",
      action: "STATUS_CHANGED",
      actorUserId: "doctor-1",
      actorRole: "DOCTOR",
      beforeJson: JSON.stringify({ status: "PENDING" }),
      afterJson: JSON.stringify({ status: "CONFIRMED" }),
    });
  });
});
