import type { SessionRepository } from "../domain/session.repository";

export class RevokeSessionUseCase {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(token: string): Promise<void> {
    await this.sessions.deleteByToken(token);
  }
}
