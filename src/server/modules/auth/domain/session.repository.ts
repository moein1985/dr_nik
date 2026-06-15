import type { Session } from "./session.entity";

export type CreateSessionInput = {
  token: string;
  userId: string;
  userRole: Session["userRole"];
  expiresAt: Date;
};

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<Session>;
  findByToken(token: string): Promise<Session | null>;
  deleteByToken(token: string): Promise<void>;
}
