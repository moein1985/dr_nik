import { z } from "zod";
import { createTRPCRouter, patientProcedure } from "@/server/api/trpc";

export const aiRouter = createTRPCRouter({
  createMessage: patientProcedure
    .input(
      z.object({
        text: z.string().trim().min(2).max(1000),
        imageUrl: z.string().trim().url().optional(),
      }),
    )
    .mutation(({ input }) => {
      const hasImage = Boolean(input.imageUrl);
      const reply = hasImage
        ? "پیام و تصویر شما دریافت شد. درخواست برای بررسی و پیگیری تیم کلینیک ثبت شده است."
        : "پیام شما دریافت شد. تیم کلینیک در سریع‌ترین زمان ممکن آن را بررسی و پیگیری خواهد کرد.";

      return {
        reply,
        queueStatus: "RECEIVED" as const,
      };
    }),
});
