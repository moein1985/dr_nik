import {
  Prisma,
  type Appointment as PrismaAppointment,
  type AppointmentStatus as PrismaAppointmentStatus,
  type PrismaClient,
} from "@prisma/client";
import type { Appointment, AppointmentStatus } from "../domain/appointment.entity";
import type { AppointmentRepository, CreateAppointmentInput } from "../domain/appointment.repository";

const toDomainAppointment = (appointment: PrismaAppointment): Appointment => ({
  id: appointment.id,
  createdByUserId: appointment.createdByUserId,
  doctorUserId: appointment.doctorUserId ?? undefined,
  patientName: appointment.patientName,
  patientPhone: appointment.patientPhone,
  doctorName: appointment.doctorName,
  requestedAt: appointment.requestedAt,
  serviceName: appointment.serviceName,
  notes: appointment.notes ?? undefined,
  status: appointment.status as AppointmentStatus,
  createdAt: appointment.createdAt,
});

const isNotFoundError = (error: unknown): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const created = await this.prisma.appointment.create({
      data: {
        createdByUserId: input.createdByUserId,
        doctorUserId: input.doctorUserId ?? null,
        patientName: input.patientName,
        patientPhone: input.patientPhone,
        doctorName: input.doctorName,
        requestedAt: input.requestedAt,
        serviceName: input.serviceName,
        notes: input.notes ?? null,
        status: "PENDING",
      },
    });

    return toDomainAppointment(created);
  }

  async list(): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
    });

    return appointments.map(toDomainAppointment);
  }

  async listByDoctorIds(doctorUserIds: string[]): Promise<Appointment[]> {
    if (doctorUserIds.length === 0) {
      return [];
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorUserId: {
          in: doctorUserIds,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return appointments.map(toDomainAppointment);
  }

  async listByCreator(createdByUserId: string): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { createdByUserId },
      orderBy: { createdAt: "desc" },
    });

    return appointments.map(toDomainAppointment);
  }

  async findById(id: string): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    return appointment ? toDomainAppointment(appointment) : null;
  }

  async cancelByCreator(id: string, createdByUserId: string): Promise<Appointment> {
    const updateResult = await this.prisma.appointment.updateMany({
      where: {
        id,
        createdByUserId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    if (updateResult.count === 0) {
      throw new Error("Appointment not found for this user");
    }

    const updated = await this.prisma.appointment.findUnique({ where: { id } });

    if (!updated) {
      throw new Error("Appointment not found for this user");
    }

    return toDomainAppointment(updated);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.appointment.delete({
        where: { id },
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new Error("Appointment not found");
      }

      throw error;
    }
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    try {
      const updated = await this.prisma.appointment.update({
        where: { id },
        data: {
          status: status as PrismaAppointmentStatus,
        },
      });

      return toDomainAppointment(updated);
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new Error("Appointment not found");
      }

      throw error;
    }
  }

  async updateByStaff(input: {
    id: string;
    doctorUserId?: string;
    patientName: string;
    patientPhone: string;
    doctorName: string;
    requestedAt: Date;
    serviceName: string;
    notes?: string;
  }): Promise<Appointment> {
    try {
      const updated = await this.prisma.appointment.update({
        where: { id: input.id },
        data: {
          doctorUserId: input.doctorUserId ?? null,
          patientName: input.patientName,
          patientPhone: input.patientPhone,
          doctorName: input.doctorName,
          requestedAt: input.requestedAt,
          serviceName: input.serviceName,
          notes: input.notes ?? null,
        },
      });

      return toDomainAppointment(updated);
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new Error("Appointment not found");
      }

      throw error;
    }
  }
}
