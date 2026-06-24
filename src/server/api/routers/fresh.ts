import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  contentManagerProcedure,
} from "@/server/api/trpc";
import { services } from "@/server/shared/service-container";

const createPostInput = z.object({
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  mediaUrl: z.string().min(1),
  caption: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

const updatePostInput = z.object({
  id: z.string().uuid(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
  mediaUrl: z.string().min(1).optional(),
  caption: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const freshRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
    .query(async ({ input }) => {
      return services.fresh.listPosts.execute(input?.limit);
    }),

  listAll: contentManagerProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
    .query(async ({ input }) => {
      return services.fresh.listAllPosts.execute(input?.limit);
    }),

  getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    const post = await services.fresh.getPostDetails.execute(input.id);
    if (!post) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
    }
    return post;
  }),

  create: contentManagerProcedure.input(createPostInput).mutation(async ({ ctx, input }) => {
    return services.fresh.createPost.execute({
      ...input,
      authorUserId: ctx.userId,
    });
  }),

  update: contentManagerProcedure.input(updatePostInput).mutation(async ({ input }) => {
    return services.fresh.updatePost.execute(input);
  }),

  delete: contentManagerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await services.fresh.deletePost.execute(input.id);
      return { ok: true };
    }),

  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const limit = services.security.rateLimiter.check(
        `fresh:like:${ctx.userId}:${ctx.ip}`,
        services.env.RATE_LIMIT_MAX_REQUESTS,
        services.env.RATE_LIMIT_WINDOW_SECONDS,
      );

      if (!limit.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
      }

      return services.fresh.toggleLike.execute(input.postId, ctx.userId);
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        content: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const limit = services.security.rateLimiter.check(
        `fresh:comment:${ctx.userId}:${ctx.ip}`,
        services.env.RATE_LIMIT_MAX_REQUESTS,
        services.env.RATE_LIMIT_WINDOW_SECONDS,
      );

      if (!limit.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
      }

      return services.fresh.addComment.execute(input.postId, ctx.userId, input.content);
    }),

  updateComment: contentManagerProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        content: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ input }) => {
      return services.fresh.updateComment.execute(input.commentId, input.content);
    }),

  deleteComment: contentManagerProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await services.fresh.deleteComment.execute(input.commentId);
      return { ok: true };
    }),

  listAllComments: contentManagerProcedure
    .input(
      z.object({
        postId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ input }) => {
      return services.fresh.listAllComments.execute(input);
    }),
});
