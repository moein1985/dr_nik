import type { PrismaClient, UserRole } from "@prisma/client";

export type AuditLogEntry = {
  id: string;
  appointmentId: string | null;
  action: string;
  actorUserId: string;
  actorRole: UserRole;
  beforeJson: string | null;
  afterJson: string | null;
  createdAt: Date;
};

export type AuditLogFilters = {
  startDate?: Date;
  endDate?: Date;
  actorUserId?: string;
  action?: string;
  appointmentId?: string;
};

export class AppointmentAuditRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    appointmentId?: string;
    action: string;
    actorUserId: string;
    actorRole: UserRole;
    beforeJson?: string;
    afterJson?: string;
  }): Promise<AuditLogEntry> {
    return this.prisma.appointmentAuditLog.create({
      data: {
        appointmentId: data.appointmentId ?? null,
        action: data.action,
        actorUserId: data.actorUserId,
        actorRole: data.actorRole,
        beforeJson: data.beforeJson ?? null,
        afterJson: data.afterJson ?? null,
      },
    });
  }

  async listLast90Days(filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const where: any = {
      createdAt: {
        gte: filters.startDate ?? ninetyDaysAgo,
        lte: filters.endDate ?? now,
      },
    };

    if (filters.actorUserId) {
      where.actorUserId = filters.actorUserId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.appointmentId) {
      where.appointmentId = filters.appointmentId;
    }

    return this.prisma.appointmentAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  }
}
