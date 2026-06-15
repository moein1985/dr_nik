import { z } from "zod";
import { createTRPCRouter, publicProcedure, staffProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/shared/prisma-client";

function safeVideoQuery<T>(handler: () => Promise<T>): Promise<T> {
  return handler().catch((error) => {
    console.warn("Video query failed, returning an empty result set.", error);
    return [] as T;
  });
}

export const videoRouter = createTRPCRouter({
  getByDoctorSlug: publicProcedure
    .input(
      z.object({
        doctorSlug: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      return safeVideoQuery(() =>
        prisma.video.findMany({
          where: { doctorSlug: input.doctorSlug },
          orderBy: { createdAt: "desc" },
        })
      );
    }),

  create: staffProcedure
    .input(
      z.object({
        title: z.string().min(1),
        url: z.string().min(1),
        coverImage: z.string().optional(),
        doctorSlug: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.video.create({
        data: {
          title: input.title,
          url: input.url,
          coverImage: input.coverImage || null,
          doctorSlug: input.doctorSlug,
        },
      });
    }),

  delete: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.video.delete({
        where: { id: input.id },
      });
    }),
});
