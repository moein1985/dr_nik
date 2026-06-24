import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  appointmentWriteProcedure,
  createTRPCRouter,
  patientProcedure,
  staffProcedure,
} from "@/server/api/trpc";
import { services } from "@/server/shared/service-container";

const createAppointmentInput = z.object({
  patientName: z.string().min(2),
  patientPhone: z.string().min(7),
  doctorName: z.string().min(2),
  requestedAt: z.coerce.date(),
  serviceName: z.string().min(2),
  notes: z.string().max(1000).optional(),
  doctorUserId: z.string().uuid().optional(),
});
const createByStaffInput = createAppointmentInput.extend({
  doctorUserId: z.string().uuid().optional(),
});

const appointmentStatusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);
const staffListInput = z.object({
  doctorUserId: z.string().uuid().optional(),
});

async function resolveNotificationRecipients() {
  const users = await services.auth.listUsers.execute();
  const recipients = users
    .filter(
      (user) =>
        user.isActive &&
        (user.role === "STAFF" || user.role === "DOCTOR" || user.role === "ADMIN" || user.role === "SUPER_ADMIN"),
    )
    .map((user) => user.email?.trim().toLowerCase())
    .filter((email): email is string => Boolean(email));

  const uniqueRecipients = Array.from(new Set(recipients));

  if (services.env.STAFF_NOTIFICATION_EMAIL) {
    uniqueRecipients.push(services.env.STAFF_NOTIFICATION_EMAIL.trim().toLowerCase());
  }

  return Array.from(new Set(uniqueRecipients)).join(",");
}

const updateByStaffInput = z.object({
  id: z.string().uuid(),
  doctorUserId: z.string().uuid().optional(),
  patientName: z.string().min(2),
  patientPhone: z.string().min(7),
  doctorName: z.string().min(2),
  requestedAt: z.coerce.date(),
  serviceName: z.string().min(2),
  notes: z.string().max(1000).optional(),
});

export const appointmentRouter = createTRPCRouter({
  createMy: patientProcedure
    .input(createAppointmentInput)
    .mutation(async ({ ctx, input }) => {
      const limit = services.security.rateLimiter.check(
        `appointment:create-my:${ctx.userId}:${ctx.ip}`,
        services.env.RATE_LIMIT_MAX_REQUESTS,
        services.env.RATE_LIMIT_WINDOW_SECONDS,
      );

      if (!limit.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
      }

      const appointment = await services.appointment.create.execute({
        ...input,
        createdByUserId: ctx.userId,
        doctorUserId: input.doctorUserId || undefined,
      }, ctx.userRole);

      const recipients = await resolveNotificationRecipients();
      await services.staffEmail.notify.execute({
        to: recipients,
        subject: "نوبت جدید ثبت شد",
        html: `
          <h2>نوبت جدید کلینیک زیبایی دکتر نیک</h2>
          <p><strong>نام بیمار:</strong> ${appointment.patientName}</p>
          <p><strong>شماره تماس:</strong> ${appointment.patientPhone}</p>
          <p><strong>پزشک:</strong> ${appointment.doctorName}</p>
          <p><strong>خدمت:</strong> ${appointment.serviceName}</p>
          <p><strong>زمان درخواستی:</strong> ${appointment.requestedAt.toISOString()}</p>
        `,
      });

      return appointment;
    }),

  listMy: patientProcedure.query(async ({ ctx }) => {
    return services.appointment.listMy.execute(ctx.userId);
  }),

  cancelMy: patientProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return services.appointment.cancelMy.execute(input.id, ctx.userId);
    }),

  list: staffProcedure.input(staffListInput.optional()).query(async ({ ctx, input }) => {
    if (ctx.userRole === "SUPER_ADMIN") {
      return services.appointment.list.execute();
    }

    if (ctx.userRole === "DOCTOR" || ctx.userRole === "ADMIN") {
      return services.appointment.listByDoctorIds.execute([ctx.userId]);
    }

    const scopes = await services.doctorStaffAssignment.listDoctorsForStaff.execute(ctx.userId);
    const allowedDoctorIds = scopes.map((user) => user.id);

    if (allowedDoctorIds.length === 0) {
      return [];
    }

    if (input?.doctorUserId && !allowedDoctorIds.includes(input.doctorUserId)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Not assigned to this doctor" });
    }

    const doctorIds = input?.doctorUserId ? [input.doctorUserId] : allowedDoctorIds;
    return services.appointment.listByDoctorIds.execute(doctorIds);
  }),

  createByStaff: appointmentWriteProcedure
    .input(createByStaffInput)
    .mutation(async ({ ctx, input }) => {
      const limit = services.security.rateLimiter.check(
        `appointment:create-staff:${ctx.userId}:${ctx.ip}`,
        services.env.RATE_LIMIT_MAX_REQUESTS,
        services.env.RATE_LIMIT_WINDOW_SECONDS,
      );

      if (!limit.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
      }

      const inputDoctorUserId = input.doctorUserId;

      if (ctx.userRole === "STAFF") {
        if (!inputDoctorUserId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "doctorUserId is required for staff" });
        }

        const assigned = await services.doctorStaffAssignment.repository.isActiveAssignment(
          inputDoctorUserId,
          ctx.userId,
        );

        if (!assigned) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not assigned to this doctor" });
        }
      }

      const doctorUserId =
        ctx.userRole === "DOCTOR" || ctx.userRole === "ADMIN" ? ctx.userId : inputDoctorUserId;

      const appointment = await services.appointment.create.execute({
        patientName: input.patientName,
        patientPhone: input.patientPhone,
        doctorName: input.doctorName,
        requestedAt: input.requestedAt,
        serviceName: input.serviceName,
        notes: input.notes,
        createdByUserId: ctx.userId,
        doctorUserId,
      }, ctx.userRole);

      const recipients = await resolveNotificationRecipients();
      await services.staffEmail.notify.execute({
        to: recipients,
        subject: "نوبت جدید توسط کارکنان ثبت شد",
        html: `
          <h2>ثبت نوبت توسط کارکنان</h2>
          <p><strong>نام بیمار:</strong> ${appointment.patientName}</p>
          <p><strong>شماره تماس:</strong> ${appointment.patientPhone}</p>
          <p><strong>پزشک:</strong> ${appointment.doctorName}</p>
          <p><strong>خدمت:</strong> ${appointment.serviceName}</p>
          <p><strong>زمان درخواستی:</strong> ${appointment.requestedAt.toISOString()}</p>
        `,
      });

      return appointment;
    }),

  updateStatus: appointmentWriteProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: appointmentStatusSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return services.appointment.updateStatus.execute(input.id, input.status, ctx.userId, ctx.userRole);
    }),

  deleteByStaff: appointmentWriteProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.userRole === "STAFF") {
        const appointment = await services.appointment.findById.execute(input.id);
        if (!appointment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Appointment not found" });
        }

        if (!appointment.doctorUserId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Appointment is not scoped to a doctor" });
        }

        const canAccess = await services.doctorStaffAssignment.repository.isActiveAssignment(
          appointment.doctorUserId,
          ctx.userId,
        );

        if (!canAccess) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not assigned to this doctor" });
        }
      }

      await services.appointment.deleteByStaff.execute(input.id, ctx.userId, ctx.userRole);
      return { ok: true };
    }),

  updateByStaff: appointmentWriteProcedure
    .input(updateByStaffInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await services.appointment.findById.execute(input.id);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Appointment not found" });
      }

      const targetDoctorUserId =
        ctx.userRole === "DOCTOR" || ctx.userRole === "ADMIN"
          ? ctx.userId
          : (input.doctorUserId ?? existing.doctorUserId);

      if (ctx.userRole === "STAFF") {
        if (!targetDoctorUserId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Appointment is not scoped to a doctor" });
        }

        const canAccess = await services.doctorStaffAssignment.repository.isActiveAssignment(
          targetDoctorUserId,
          ctx.userId,
        );

        if (!canAccess) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not assigned to this doctor" });
        }
      }

      return services.appointment.updateByStaff.execute({
        id: input.id,
        doctorUserId: targetDoctorUserId,
        patientName: input.patientName,
        patientPhone: input.patientPhone,
        doctorName: input.doctorName,
        requestedAt: input.requestedAt,
        serviceName: input.serviceName,
        notes: input.notes,
      }, ctx.userId, ctx.userRole);
    }),
});
