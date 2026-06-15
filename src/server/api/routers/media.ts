import { z } from "zod";
import { createTRPCRouter, publicProcedure, staffProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/shared/prisma-client";

const mediaStatusSchema = z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]);

function safeMediaQuery<T>(handler: () => Promise<T>): Promise<T> {
  return handler().catch((error) => {
    console.warn("Media query failed, returning an empty result set.", error);
    return [] as T;
  });
}

export const mediaRouter = createTRPCRouter({
  getApproved: publicProcedure.query(async () => {
    return safeMediaQuery(() =>
      prisma.media.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      })
    );
  }),

  getPending: staffProcedure.query(async () => {
    return safeMediaQuery(() =>
      prisma.media.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      })
    );
  }),

  getAll: staffProcedure.query(async () => {
    return safeMediaQuery(() =>
      prisma.media.findMany({
        orderBy: { createdAt: "desc" },
      })
    );
  }),

  create: staffProcedure
    .input(
      z.object({
        title: z.string().min(1),
        url: z.string().min(1),
        category: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.media.create({
        data: {
          title: input.title,
          url: input.url,
          category: input.category,
          status: "PENDING",
        },
      });
    }),

  updateStatus: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: mediaStatusSchema,
      })
    )
    .mutation(async ({ input }) => {
      return prisma.media.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
