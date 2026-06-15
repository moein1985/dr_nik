import { randomUUID } from "node:crypto";
import type { Appointment, AppointmentStatus } from "../domain/appointment.entity";
import type {
  AppointmentRepository,
  CreateAppointmentInput,
} from "../domain/appointment.repository";

export class InMemoryAppointmentRepository implements AppointmentRepository {
  private readonly appointments: Appointment[] = [];

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const appointment: Appointment = {
      id: randomUUID(),
      createdByUserId: input.createdByUserId,
      patientName: input.patientName,
      patientPhone: input.patientPhone,
      doctorName: input.doctorName,
      requestedAt: input.requestedAt,
      serviceName: input.serviceName,
      notes: input.notes,
      status: "PENDING",
      createdAt: new Date(),
    };

    this.appointments.push(appointment);

    return appointment;
  }

  async list(): Promise<Appointment[]> {
    return [...this.appointments].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async listByCreator(createdByUserId: string): Promise<Appointment[]> {
    return this.appointments
      .filter((item) => item.createdByUserId === createdByUserId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async cancelByCreator(id: string, createdByUserId: string): Promise<Appointment> {
    const target = this.appointments.find(
      (item) => item.id === id && item.createdByUserId === createdByUserId,
    );

    if (!target) {
      throw new Error("Appointment not found for this user");
    }

    target.status = "CANCELLED";
    return target;
  }

  async delete(id: string): Promise<void> {
    const index = this.appointments.findIndex((item) => item.id === id);

    if (index < 0) {
      throw new Error("Appointment not found");
    }

    this.appointments.splice(index, 1);
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const target = this.appointments.find((item) => item.id === id);

    if (!target) {
      throw new Error("Appointment not found");
    }

    target.status = status;
    return target;
  }

  async updateByStaff(input: {
    id: string;
    patientName: string;
    patientPhone: string;
    doctorName: string;
    requestedAt: Date;
    serviceName: string;
    notes?: string;
  }): Promise<Appointment> {
    const target = this.appointments.find((item) => item.id === input.id);

    if (!target) {
      throw new Error("Appointment not found");
    }

    target.patientName = input.patientName;
    target.patientPhone = input.patientPhone;
    target.doctorName = input.doctorName;
    target.requestedAt = input.requestedAt;
    target.serviceName = input.serviceName;
    target.notes = input.notes;

    return target;
  }
}
