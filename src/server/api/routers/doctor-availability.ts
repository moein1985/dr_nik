import { z } from "zod";
import { createTRPCRouter, doctorProcedure, publicProcedure } from "@/server/api/trpc";
import { services } from "@/server/shared/service-container";

const slotSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(0).max(1439),
  isActive: z.boolean(),
});

export const doctorAvailabilityRouter = createTRPCRouter({
  getMy: doctorProcedure.query(async ({ ctx }) => {
    return services.doctorAvailability.listByDoctor.execute(ctx.userId);
  }),

  setMy: doctorProcedure
    .input(z.object({ slots: z.array(slotSchema) }))
    .mutation(async ({ ctx, input }) => {
      await services.doctorAvailability.replaceForDoctor.execute({
        doctorUserId: ctx.userId,
        slots: input.slots,
      });
      return { success: true };
    }),

  getByDoctor: publicProcedure
    .input(z.object({ doctorUserId: z.string() }))
    .query(async ({ input }) => {
      return services.doctorAvailability.listByDoctor.execute(input.doctorUserId);
    }),
});
