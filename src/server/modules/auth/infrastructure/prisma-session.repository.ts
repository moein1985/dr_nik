import { type PrismaClient, type Session as PrismaSession, type UserRole as PrismaUserRole } from "@prisma/client";
import type { Session } from "../domain/session.entity";
import type { CreateSessionInput, SessionRepository } from "../domain/session.repository";

const toDomainSession = (session: PrismaSession): Session => ({
  token: session.token,
  userId: session.userId,
  userRole: session.userRole,
  expiresAt: session.expiresAt,
  createdAt: session.createdAt,
});

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateSessionInput): Promise<Session> {
    const created = await this.prisma.session.create({
      data: {
        token: input.token,
        userId: input.userId,
        userRole: input.userRole as PrismaUserRole,
        expiresAt: input.expiresAt,
      },
    });

    return toDomainSession(created);
  }

  async findByToken(token: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { token },
    });

    return session ? toDomainSession(session) : null;
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { token },
    });
  }
}
