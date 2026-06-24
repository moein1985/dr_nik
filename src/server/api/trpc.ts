import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { UserRole } from "@/server/modules/auth/domain/user.entity";
import { getRequestIp } from "@/server/security/request-ip";
import { services } from "@/server/shared/service-container";

export type TRPCContext = {
  ip: string;
  userId?: string;
  userRole?: UserRole;
};

type AuthenticatedTRPCContext = {
  ip: string;
  userId: string;
  userRole: UserRole;
};

function getCookieValue(cookieHeader: string, cookieName: string): string | undefined {
  const pairs = cookieHeader.split(";").map((item) => item.trim());
  const match = pairs.find((item) => item.startsWith(`${cookieName}=`));

  if (!match) {
    return undefined;
  }

  const value = match.slice(cookieName.length + 1);
  return decodeURIComponent(value);
}

export const createTRPCContext = async (opts: { req: Request }): Promise<TRPCContext> => {
  const ip = getRequestIp(opts.req);
  const cookieHeader = opts.req.headers.get("cookie") ?? "";
  const token = getCookieValue(cookieHeader, services.env.SESSION_COOKIE_NAME);

  if (!token) {
    return { ip };
  }

  const session = await services.auth.session.resolve.execute(token);

  if (!session) {
    return { ip };
  }

  return {
    ip,
    userId: session.userId,
    userRole: session.userRole,
  };
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId || !ctx.userRole) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required" });
  }

  const authCtx: AuthenticatedTRPCContext = {
    ip: ctx.ip,
    userId: ctx.userId,
    userRole: ctx.userRole,
  };

  return next({ ctx: authCtx });
});

const requireRole = (roles: UserRole[]) =>
  protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.userRole || !roles.includes(ctx.userRole)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient role" });
    }

    return next({ ctx });
  });

export const superAdminProcedure = requireRole(["SUPER_ADMIN"]);
export const adminProcedure = requireRole(["DOCTOR", "ADMIN", "SUPER_ADMIN"]);
export const doctorProcedure = requireRole(["DOCTOR", "ADMIN", "SUPER_ADMIN"]);
export const staffProcedure = requireRole(["STAFF", "DOCTOR", "ADMIN", "SUPER_ADMIN"]);
export const contentManagerProcedure = requireRole(["CONTENT_MANAGER", "SUPER_ADMIN"]);
// Appointment mutations are restricted to operational roles only.
// SUPER_ADMIN has read-only visibility and must not create/edit/delete appointments.
export const appointmentWriteProcedure = requireRole(["STAFF", "DOCTOR", "ADMIN"]);
export const patientProcedure = requireRole(["PATIENT"]);
