import { randomUUID } from "node:crypto";
import type { Session } from "../domain/session.entity";
import type { SessionRepository } from "../domain/session.repository";

export type CreateSessionInput = {
  userId: string;
  userRole: Session["userRole"];
};

export class CreateSessionUseCase {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly sessionTtlHours: number,
  ) {}

  async execute(input: CreateSessionInput): Promise<Session> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + this.sessionTtlHours * 60 * 60 * 1000);

    return this.sessions.create({
      token,
      userId: input.userId,
      userRole: input.userRole,
      expiresAt,
    });
  }
}
