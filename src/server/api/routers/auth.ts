import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  superAdminProcedure,
} from "@/server/api/trpc";
import { services } from "@/server/shared/service-container";

const phoneRegex = /^(\+?\d{10,15})$/;

const createPrivilegedUserInput = z
  .object({
    username: z.string().trim().min(3),
    email: z.string().trim().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const authRouter = createTRPCRouter({
  registerPatient: publicProcedure
    .input(
      z
        .object({
          phoneNumber: z.string().trim().regex(phoneRegex),
          password: z.string().min(6),
          confirmPassword: z.string().min(6),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const limit = services.security.rateLimiter.check(
        `auth:register:${ctx.ip}`,
        services.env.AUTH_RATE_LIMIT_MAX_REQUESTS,
        services.env.RATE_LIMIT_WINDOW_SECONDS,
      );

      if (!limit.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
      }

      return services.auth.registerPatient.execute({
        phoneNumber: input.phoneNumber,
        password: input.password,
      });
    }),

  login: publicProcedure
    .input(
      z.object({
        identifier: z.string().trim().min(3),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ipLimit = services.security.rateLimiter.check(
        `auth:login:ip:${ctx.ip}`,
        services.env.AUTH_RATE_LIMIT_MAX_REQUESTS,
        services.env.RATE_LIMIT_WINDOW_SECONDS,
      );

      if (!ipLimit.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
      }

      const identifier = input.identifier.trim();
      const identifierLimit = services.security.rateLimiter.check(
        `auth:login:identifier:${identifier.toLowerCase()}`,
        services.env.AUTH_RATE_LIMIT_MAX_REQUESTS,
        services.env.RATE_LIMIT_WINDOW_SECONDS,
      );

      if (!identifierLimit.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
      }

      const remainingLockSeconds = services.security.loginLockout.getRemainingLockSeconds(identifier);
      if (remainingLockSeconds > 0) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many failed login attempts. Account temporarily locked." });
      }

      try {
        const result = await services.auth.login.execute(input);
        services.security.loginLockout.registerSuccess(identifier);
        return result;
      } catch (error) {
        services.security.loginLockout.registerFailure(identifier);
        throw error;
      }
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await services.auth.getPublicUser.execute(ctx.userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }),

  forgotPassword: publicProcedure
    .input(
      z.object({
        phoneNumber: z.string().trim().regex(phoneRegex),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const limit = services.security.rateLimiter.check(
        `auth:forgot:${ctx.ip}`,
        services.env.AUTH_RATE_LIMIT_MAX_REQUESTS,
        services.env.RATE_LIMIT_WINDOW_SECONDS,
      );

      if (!limit.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
      }

      return services.auth.forgotPassword.execute(input);
    }),

  resetPassword: publicProcedure
    .input(
      z
        .object({
          phoneNumber: z.string().trim().regex(phoneRegex),
          otpCode: z.string().trim().regex(/^\d{6}$/),
          newPassword: z.string().min(6),
          confirmNewPassword: z.string().min(6),
        })
        .refine((data) => data.newPassword === data.confirmNewPassword, {
          message: "Passwords do not match",
          path: ["confirmNewPassword"],
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const limit = services.security.rateLimiter.check(
        `auth:reset:${ctx.ip}`,
        services.env.AUTH_RATE_LIMIT_MAX_REQUESTS,
        services.env.RATE_LIMIT_WINDOW_SECONDS,
      );

      if (!limit.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
      }

      return services.auth.resetPassword.execute({
        phoneNumber: input.phoneNumber,
        otpCode: input.otpCode,
        newPassword: input.newPassword,
      });
    }),

  adminHeartbeat: adminProcedure.query(async ({ ctx }) => {
    return {
      ok: true,
      userId: ctx.userId,
      userRole: ctx.userRole,
    };
  }),

  createStaff: adminProcedure
    .input(createPrivilegedUserInput)
    .mutation(async ({ input }) => {
      return services.auth.createStaff.execute({
        username: input.username,
        email: input.email,
        password: input.password,
      });
    }),

  createAdmin: superAdminProcedure
    .input(createPrivilegedUserInput)
    .mutation(async ({ input }) => {
      return services.auth.createAdmin.execute({
        username: input.username,
        email: input.email,
        password: input.password,
      });
    }),

  listUsers: adminProcedure.query(async () => {
    return services.auth.listUsers.execute();
  }),

  setUserActive: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      return services.auth.setUserActive.execute(input);
    }),

  setUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(["PATIENT", "STAFF", "ADMIN"]),
      }),
    )
    .mutation(async ({ input }) => {
      return services.auth.setUserRole.execute(input);
    }),

  bootstrapStatus: publicProcedure.query(async () => {
    return services.auth.bootstrapStatus();
  }),
});
