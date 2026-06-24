import { describe, it, expect, beforeEach, vi } from "vitest";
import { ListAppointmentsUseCase } from "../application/list-appointments.use-case";

describe("ListAppointmentsUseCase", () => {
  let useCase: ListAppointmentsUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findByUserId: vi.fn(),
      findByDoctorId: vi.fn(),
    };

    useCase = new ListAppointmentsUseCase(mockRepository);
  });

  it("should list all appointments for super admin", async () => {
    const mockAppointments = [
      { id: "apt-1", status: "PENDING" },
      { id: "apt-2", status: "CONFIRMED" },
    ];

    mockRepository.findAll.mockResolvedValue(mockAppointments);

    const result = await useCase.execute("SUPER_ADMIN", "admin-1");

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockAppointments);
  });

  it("should list user appointments for patient", async () => {
    const mockAppointments = [
      { id: "apt-1", createdByUserId: "patient-1" },
    ];

    mockRepository.findByUserId.mockResolvedValue(mockAppointments);

    const result = await useCase.execute("PATIENT", "patient-1");

    expect(mockRepository.findByUserId).toHaveBeenCalledWith("patient-1");
    expect(result).toEqual(mockAppointments);
  });

  it("should list doctor appointments for doctor role", async () => {
    const mockAppointments = [
      { id: "apt-1", doctorUserId: "doctor-1" },
    ];

    mockRepository.findByDoctorId.mockResolvedValue(mockAppointments);

    const result = await useCase.execute("DOCTOR", "doctor-1");

    expect(mockRepository.findByDoctorId).toHaveBeenCalledWith("doctor-1");
    expect(result).toEqual(mockAppointments);
  });

  it("should list all appointments for staff", async () => {
    const mockAppointments = [
      { id: "apt-1" },
      { id: "apt-2" },
    ];

    mockRepository.findAll.mockResolvedValue(mockAppointments);

    const result = await useCase.execute("STAFF", "staff-1");

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockAppointments);
  });
});
