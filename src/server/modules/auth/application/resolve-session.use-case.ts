import type { Session } from "../domain/session.entity";
import type { SessionRepository } from "../domain/session.repository";

export class ResolveSessionUseCase {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(token: string): Promise<Session | null> {
    const session = await this.sessions.findByToken(token);

    if (!session) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.sessions.deleteByToken(token);
      return null;
    }

    return session;
  }
}
