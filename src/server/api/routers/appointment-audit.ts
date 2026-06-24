import { z } from "zod";
import { createTRPCRouter, superAdminProcedure } from "@/server/api/trpc";
import { services } from "@/server/shared/service-container";

const listFiltersSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  actorUserId: z.string().uuid().optional(),
  action: z.string().optional(),
  appointmentId: z.string().uuid().optional(),
});

export const appointmentAuditRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listFiltersSchema.optional())
    .query(async ({ input }) => {
      return services.appointmentAudit.listLast90Days.execute(input ?? {});
    }),
});
