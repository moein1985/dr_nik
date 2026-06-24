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
      afterJson: JSON.stringify({ status: "PENDING" }),
    };

    const mockAudit = {
      id: "audit-1",
      ...input,
      beforeJson: null,
      createdAt: new Date(),
    };

    mockRepository.create.mockResolvedValue(mockAudit);

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });

  it("should write audit log for UPDATED action with before/after", async () => {
    const input = {
      appointmentId: "apt-2",
      action: "UPDATED" as const,
      actorUserId: "staff-1",
      actorRole: "STAFF" as const,
      beforeJson: JSON.stringify({ status: "PENDING" }),
      afterJson: JSON.stringify({ status: "CONFIRMED" }),
    };

    const mockAudit = {
      id: "audit-2",
      ...input,
      createdAt: new Date(),
    };

    mockRepository.create.mockResolvedValue(mockAudit);

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });

  it("should write audit log for DELETED action", async () => {
    const input = {
      appointmentId: "apt-3",
      action: "DELETED" as const,
      actorUserId: "staff-1",
      actorRole: "STAFF" as const,
      beforeJson: JSON.stringify({ status: "PENDING" }),
    };

    const mockAudit = {
      id: "audit-3",
      ...input,
      afterJson: null,
      createdAt: new Date(),
    };

    mockRepository.create.mockResolvedValue(mockAudit);

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });

  it("should write audit log for STATUS_CHANGED action", async () => {
    const input = {
      appointmentId: "apt-4",
      action: "STATUS_CHANGED" as const,
      actorUserId: "doctor-1",
      actorRole: "DOCTOR" as const,
      beforeJson: JSON.stringify({ status: "PENDING" }),
      afterJson: JSON.stringify({ status: "CONFIRMED" }),
    };

    mockRepository.create.mockResolvedValue({ id: "audit-4", ...input });

    await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });
});
