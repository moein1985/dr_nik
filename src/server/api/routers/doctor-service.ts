import { z } from "zod";
import { createTRPCRouter, publicProcedure, superAdminProcedure } from "@/server/api/trpc";
import { services } from "@/server/shared/service-container";

const serviceItemSchema = z.object({
  serviceKey: z.string(),
  serviceLabel: z.string(),
  isActive: z.boolean(),
});

export const doctorServiceRouter = createTRPCRouter({
  listForDoctor: publicProcedure
    .input(z.object({ doctorUserId: z.string() }))
    .query(async ({ input }) => {
      return services.doctorService.listForDoctor.execute(input.doctorUserId);
    }),

  setForDoctor: superAdminProcedure
    .input(
      z.object({
        doctorUserId: z.string(),
        services: z.array(serviceItemSchema),
      })
    )
    .mutation(async ({ input }) => {
      await services.doctorService.setForDoctor.execute({
        doctorUserId: input.doctorUserId,
        services: input.services,
      });
      return { success: true };
    }),
});
