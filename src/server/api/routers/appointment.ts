import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
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
});

const appointmentStatusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);

async function resolveNotificationRecipients() {
  const users = await services.auth.listUsers.execute();
  const recipients = users
    .filter(
      (user) =>
        user.isActive &&
        (user.role === "STAFF" || user.role === "ADMIN" || user.role === "SUPER_ADMIN"),
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
      });

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

  list: staffProcedure.query(async () => {
    return services.appointment.list.execute();
  }),

  createByStaff: staffProcedure
    .input(createAppointmentInput)
    .mutation(async ({ ctx, input }) => {
      const limit = services.security.rateLimiter.check(
        `appointment:create-staff:${ctx.userId}:${ctx.ip}`,
        services.env.RATE_LIMIT_MAX_REQUESTS,
        services.env.RATE_LIMIT_WINDOW_SECONDS,
      );

      if (!limit.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
      }

      const appointment = await services.appointment.create.execute({
        ...input,
        createdByUserId: ctx.userId,
      });

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

  updateStatus: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: appointmentStatusSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return services.appointment.updateStatus.execute(input.id, input.status);
    }),

  deleteByStaff: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      await services.appointment.deleteByStaff.execute(input.id);
      return { ok: true };
    }),

  updateByStaff: staffProcedure
    .input(updateByStaffInput)
    .mutation(async ({ input }) => {
      return services.appointment.updateByStaff.execute(input);
    }),
});
