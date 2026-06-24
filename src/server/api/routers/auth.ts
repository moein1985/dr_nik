import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import {
  adminProcedure,
  createTRPCRouter,
  doctorProcedure,
  protectedProcedure,
  publicProcedure,
  superAdminProcedure,
} from "@/server/api/trpc";
import { services } from "@/server/shared/service-container";
import { prisma } from "@/server/shared/prisma-client";
import { AUTH_MESSAGES } from "@/server/shared/error-messages";

const phoneRegex = /^(\+?\d{10,15})$/;

const createPrivilegedUserInput = z
  .object({
    username: z.string().trim().min(3),
    email: z.string().trim().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    role: z.enum(["ADMIN", "CONTENT_MANAGER", "STAFF", "DOCTOR"]).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const aiProviderSettingsInput = z.object({
  provider: z.string().trim().min(2).max(80),
  model: z.string().trim().min(2).max(120),
  apiKey: z.string().trim().min(8).max(500),
  baseUrl: z.string().trim().url().max(500).optional(),
  isEnabled: z.boolean(),
});

type AiProviderSettingsRow = {
  id: string;
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string | null;
  isEnabled: boolean;
};

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

  changePassword: protectedProcedure
    .input(
      z
        .object({
          currentPassword: z.string().min(6),
          newPassword: z.string().min(6),
          confirmNewPassword: z.string().min(6),
        })
        .refine((data) => data.newPassword === data.confirmNewPassword, {
          message: "Passwords do not match",
          path: ["confirmNewPassword"],
        }),
    )
    .mutation(async ({ ctx, input }) => {
      return services.auth.changePassword.execute({
        userId: ctx.userId,
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      });
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
        role: input.role,
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
        role: z.enum(["PATIENT", "STAFF", "ADMIN", "DOCTOR", "CONTENT_MANAGER"]),
      }),
    )
    .mutation(async ({ input }) => {
      return services.auth.setUserRole.execute(input);
    }),

  bootstrapStatus: publicProcedure.query(async () => {
    return services.auth.bootstrapStatus();
  }),

  getMyDoctorProfile: doctorProcedure.query(async ({ ctx }) => {
    return services.doctorProfile.getMy.execute(ctx.userId);
  }),

  upsertMyDoctorProfile: doctorProcedure
    .input(
      z.object({
        aboutMe: z.string().trim().max(4000).optional(),
        credentials: z.string().trim().max(4000).optional(),
        acceptedInsurances: z.string().trim().max(4000).optional(),
        workingHours: z.string().trim().max(4000).optional(),
        specialties: z.string().trim().max(4000).optional(),
        services: z.string().trim().max(4000).optional(),
        branchAddress: z.string().trim().max(4000).optional(),
        experience: z.string().trim().max(4000).optional(),
        extraNotes: z.string().trim().max(4000).optional(),
        aiProfileContext: z.string().trim().max(6000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return services.doctorProfile.upsertMy.execute(ctx.userId, input);
    }),

  listAssignableStaff: doctorProcedure.query(async () => {
    return services.doctorStaffAssignment.listAssignableStaff.execute();
  }),

  listMyAssignedStaff: doctorProcedure.query(async ({ ctx }) => {
    return services.doctorStaffAssignment.listAssignedStaffForDoctor.execute(ctx.userId);
  }),

  assignStaffToMe: doctorProcedure
    .input(
      z.object({
        staffUserId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return services.doctorStaffAssignment.assignStaffToDoctor.execute(ctx.userId, input.staffUserId);
    }),

  unassignStaffFromMe: doctorProcedure
    .input(
      z.object({
        staffUserId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await services.doctorStaffAssignment.unassignStaffFromDoctor.execute(ctx.userId, input.staffUserId);
      return { ok: true };
    }),

  listMyDoctorScopes: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.userRole === "STAFF") {
      return services.doctorStaffAssignment.listDoctorsForStaff.execute(ctx.userId);
    }

    if (ctx.userRole === "DOCTOR" || ctx.userRole === "ADMIN") {
      const me = await services.auth.getPublicUser.execute(ctx.userId);
      return me ? [me] : [];
    }

    if (ctx.userRole === "SUPER_ADMIN") {
      const users = await services.auth.listUsers.execute();
      return users.filter((user) => (user.role === "DOCTOR" || user.role === "ADMIN") && user.isActive);
    }

    return [];
  }),

  getAiProviderSettings: superAdminProcedure.query(async () => {
    try {
      const rows = await prisma.$queryRaw<AiProviderSettingsRow[]>`
        SELECT "id", "provider", "model", "apiKey", "baseUrl", "isEnabled"
        FROM "AiProviderSetting"
        ORDER BY "updatedAt" DESC
        LIMIT 1
      `;

      const current = rows[0];

      if (!current) {
        return {
          provider: "avalai",
          model: "gemini-2.5-flash",
          apiKey: "",
          baseUrl: "https://api.avalai.ir/v1",
          isEnabled: true,
        };
      }

      return {
        provider: current.provider,
        model: current.model,
        apiKey: current.apiKey,
        baseUrl: current.baseUrl ?? "",
        isEnabled: current.isEnabled,
      };
    } catch {
      return {
        provider: "avalai",
        model: "gemini-2.5-flash",
        apiKey: "",
        baseUrl: "https://api.avalai.ir/v1",
        isEnabled: true,
      };
    }
  }),

  upsertAiProviderSettings: superAdminProcedure
    .input(aiProviderSettingsInput)
    .mutation(async ({ input }) => {
      try {
        const rows = await prisma.$queryRaw<AiProviderSettingsRow[]>`
          SELECT "id"
          FROM "AiProviderSetting"
          ORDER BY "updatedAt" DESC
          LIMIT 1
        `;

        const baseUrl = input.baseUrl?.trim() || null;

        if (rows[0]) {
          await prisma.$executeRaw`
            UPDATE "AiProviderSetting"
            SET
              "provider" = ${input.provider},
              "model" = ${input.model},
              "apiKey" = ${input.apiKey},
              "baseUrl" = ${baseUrl},
              "isEnabled" = ${input.isEnabled},
              "updatedAt" = now()
            WHERE "id" = ${rows[0].id}
          `;
        } else {
          await prisma.$executeRaw`
            INSERT INTO "AiProviderSetting"
              ("id", "provider", "model", "apiKey", "baseUrl", "isEnabled", "createdAt", "updatedAt")
            VALUES
              (${randomUUID()}, ${input.provider}, ${input.model}, ${input.apiKey}, ${baseUrl}, ${input.isEnabled}, now(), now())
          `;
        }

        return { ok: true };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI settings storage is not ready. Run Prisma migration first.",
        });
      }
    }),

  listActiveDoctors: publicProcedure.query(async () => {
    return services.auth.listUsers.execute().then((users) =>
      users
        .filter((u) => u.isActive && (u.role === "DOCTOR" || u.role === "ADMIN"))
        .map((u) => ({
          id: u.id,
          username: u.username ?? AUTH_MESSAGES.DEFAULT_DOCTOR_NAME,
          email: u.email ?? "",
        }))
        .sort((a, b) => (a.username ?? "").localeCompare(b.username ?? "")),
    );
  }),
});
