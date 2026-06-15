import type { UserRole } from "./user.entity";

export type Session = {
  token: string;
  userId: string;
  userRole: UserRole;
  expiresAt: Date;
  createdAt: Date;
};
