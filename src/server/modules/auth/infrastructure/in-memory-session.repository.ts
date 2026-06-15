import type { Session } from "../domain/session.entity";
import type { CreateSessionInput, SessionRepository } from "../domain/session.repository";

export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions: Session[] = [];

  async create(input: CreateSessionInput): Promise<Session> {
    const session: Session = {
      token: input.token,
      userId: input.userId,
      userRole: input.userRole,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
    };

    this.sessions.push(session);
    return session;
  }

  async findByToken(token: string): Promise<Session | null> {
    return this.sessions.find((session) => session.token === token) ?? null;
  }

  async deleteByToken(token: string): Promise<void> {
    const index = this.sessions.findIndex((session) => session.token === token);

    if (index >= 0) {
      this.sessions.splice(index, 1);
    }
  }
}
